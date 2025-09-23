const GOOGLESHEET_URL = 'https://script.google.com/macros/s/AKfycbw22VIdsecBtnrgSGBCfMHfAu4xkb4wFlHa9aifxk7Ul244qK4dlFVdEZx_60MfuojzJQ/exec';

// Order Management System
class OrderManager {
    constructor() {
        this.order = {
            items: {},
            combos: {},
            customerInfo: {},
            isPreorder: true, // Default to pre-order
            subtotal: 0,
            discount: 0,
            total: 0
        };
        
        // Google Script configuration
        this.googleScriptUrl = GOOGLESHEET_URL; // Use the configured URL
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
        
        this.initializeEventListeners();
        this.updateOrderSummary();
    }

    initializeEventListeners() {
        // Initialize warning system
        this.initializeWarningSystem();

        // Quantity selectors for individual items
        document.querySelectorAll('.food-item .quantity').forEach(select => {
            select.addEventListener('change', (e) => {
                const foodItem = e.target.closest('.food-item');
                const itemName = foodItem.dataset.item;
                const quantity = parseInt(e.target.value);
                const price = this.order.isPreorder ? 
                    parseFloat(foodItem.dataset.preorderPrice) : 
                    parseFloat(foodItem.dataset.price);
                
                this.updateItemQuantity(itemName, quantity, price);
            });
        });

        // Quantity selectors for combo platters - use event delegation for better reliability
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity') && e.target.closest('.platter-option')) {
                const comboType = e.target.dataset.combo;
                const quantity = parseInt(e.target.value);
                const price = this.order.isPreorder ? 10 : 12; // Pre-order vs regular price
                
                this.updateComboQuantity(comboType, quantity, price);
            }
        });

        // Platter menu radio button selections
        document.querySelectorAll('.platter-item-choice input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const platterOption = e.target.closest('.platter-option');
                const comboType = platterOption.querySelector('.quantity').dataset.combo;
                const itemNumber = e.target.name.includes('item1') ? 'option1' : 'option2';
                const value = e.target.value;

                if (this.order.combos[comboType]) {
                    // Update all platters of this type with the new selection
                    this.order.combos[comboType].customizations.forEach(customization => {
                        customization[itemNumber] = value;
                    });
                    this.updateOrderSummary();
                }
            });
        });

        // Initialize platter customization event listeners
        this.initializeCustomizationListeners();

        // Always in pre-order mode
        this.order.isPreorder = true;

        // Place order button
        document.getElementById('placeOrder').addEventListener('click', () => {
            this.placeOrder();
        });

        // Form validation
        document.getElementById('customerForm').addEventListener('input', () => {
            this.validateForm();
        });
    }

    updateItemQuantity(itemName, quantity, price) {
        if (quantity === 0) {
            delete this.order.items[itemName];
        } else {
            this.order.items[itemName] = {
                quantity: quantity,
                price: price,
                total: quantity * price
            };
        }
        this.updateOrderSummary();
    }

    createPlatterCustomizationTemplate(comboType, platterIndex) {
        const isVeg = comboType === 'veg';
        return `
            <div class="platter-instance" data-platter-index="${platterIndex}">
                <h4>Platter ${platterIndex + 1}</h4>
                <div class="customization-option">
                    <label>Choose Item 1:</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="${comboType}-platter-${platterIndex}-option1" value="phuchka" checked>
                            Phuchka
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="${comboType}-platter-${platterIndex}-option1" value="papri-chat">
                            Papri Chaat
                        </label>
                    </div>
                </div>
                ${!isVeg ? `
                <div class="customization-option">
                    <label>Choose Item 2:</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="${comboType}-platter-${platterIndex}-option2" value="chicken-65" checked>
                            Chicken 65
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="${comboType}-platter-${platterIndex}-option2" value="chicken-shami-kabab">
                            Chicken Shami Kabab
                        </label>
                    </div>
                </div>
                ` : ''}
                ${isVeg ? `
                <div class="fixed-items">
                    <div class="fixed-item">
                        <span class="item-label">Item 2:</span>
                        <span class="item-value">Honey Chilli Cauliflower</span>
                    </div>
                </div>
                ` : ''}
                <div class="customization-option">
                    <label>Choose Item ${isVeg ? '3' : '3'}:</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="${comboType}-platter-${platterIndex}-option3" value="chana-pora" checked>
                            Chena Pora
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="${comboType}-platter-${platterIndex}-option3" value="narkel-naru">
                            Narkel Naru
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    updateComboQuantity(comboType, quantity, price) {
        const platterOption = document.querySelector(`.${comboType}-platter`);
        const platterCustomization = platterOption.querySelector('.platter-customization');
        const customizationContainer = platterCustomization.querySelector('.platter-customization-container');
        
        if (quantity === 0) {
            delete this.order.combos[comboType];
            if (platterCustomization) {
                platterCustomization.style.display = 'none';
                customizationContainer.innerHTML = ''; // Clear customization options
            }
        } else {
            // Show customization options when quantity > 0
            if (platterCustomization) {
                // First set display to block to make it visible
                platterCustomization.style.display = 'block';
                // Force a reflow to ensure the element is rendered
                platterCustomization.offsetHeight;
                // Then set the other properties for the transition
                platterCustomization.style.opacity = '1';
                platterCustomization.style.height = 'auto';
                platterCustomization.style.overflow = 'visible';
            }
            
            // Initialize or update combo in order
            if (!this.order.combos[comboType]) {
                this.order.combos[comboType] = {
                    quantity: quantity,
                    price: price,
                    total: quantity * price,
                    customizations: []
                };
            } else {
                this.order.combos[comboType].quantity = quantity;
                this.order.combos[comboType].price = price;
                this.order.combos[comboType].total = quantity * price;
            }

            // Store current customizations before updating UI
            const currentCustomizations = this.order.combos[comboType].customizations;

            // Update customization UI
            customizationContainer.innerHTML = '';
            for (let i = 0; i < quantity; i++) {
                customizationContainer.innerHTML += this.createPlatterCustomizationTemplate(comboType, i);
            }

            // Initialize or update customizations array
            const isVeg = comboType === 'veg';
            
            // Preserve existing customizations if available
            this.order.combos[comboType].customizations = Array(quantity).fill().map((_, index) => {
                const existingCustomization = currentCustomizations[index] || {};
                return {
                    option1: existingCustomization.option1 || 'phuchka',
                    ...(isVeg ? {
                        option2: 'honey-chilli-cauliflower', // Fixed for veg platters
                        option3: existingCustomization.option3 || 'chana-pora'
                    } : {
                        option2: existingCustomization.option2 || 'chicken-65',
                        option3: existingCustomization.option3 || 'chana-pora'
                    })
                };
            });

            // Set the radio buttons to match the current customizations
            this.order.combos[comboType].customizations.forEach((customization, index) => {
                const platterInstance = customizationContainer.querySelector(`[data-platter-index="${index}"]`);
                if (platterInstance) {
                    // Set option1 (Phuchka/Papri Chat)
                    const option1Radio = platterInstance.querySelector(`input[name="${comboType}-platter-${index}-option1"][value="${customization.option1}"]`);
                    if (option1Radio) option1Radio.checked = true;

                    // Set option2 for non-veg (Chicken 65/Chicken Shami Kabab) only
                    if (!isVeg) {
                        const option2Radio = platterInstance.querySelector(`input[name="${comboType}-platter-${index}-option2"][value="${customization.option2}"]`);
                        if (option2Radio) option2Radio.checked = true;
                    }

                    // Set option3 (Chena Pora/Narkel Naru)
                    const option3Radio = platterInstance.querySelector(`input[name="${comboType}-platter-${index}-option3"][value="${customization.option3}"]`);
                    if (option3Radio) option3Radio.checked = true;
                }
            });

            // Add event listeners for radio buttons
            customizationContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    const platterIndex = parseInt(e.target.closest('.platter-instance').dataset.platterIndex);
                    let optionNumber;
                    if (e.target.name.includes('option1')) {
                        optionNumber = 'option1';
                    } else if (e.target.name.includes('option2')) {
                        optionNumber = 'option2';
                    } else if (e.target.name.includes('option3')) {
                        optionNumber = 'option3';
                    }
                    this.order.combos[comboType].customizations[platterIndex][optionNumber] = e.target.value;
                    this.updateOrderSummary();
                });
            });
        }
        this.updateOrderSummary();
    }

    recalculateAllPrices() {
        // Recalculate individual items
        Object.keys(this.order.items).forEach(itemName => {
            const foodItem = document.querySelector(`[data-item="${itemName}"]`);
            const quantity = this.order.items[itemName].quantity;
            const price = this.order.isPreorder ? 
                parseFloat(foodItem.dataset.preorderPrice) : 
                parseFloat(foodItem.dataset.price);
            
            this.order.items[itemName].price = price;
            this.order.items[itemName].total = quantity * price;
        });

        // Recalculate combos
        Object.keys(this.order.combos).forEach(comboType => {
            const quantity = this.order.combos[comboType].quantity;
            const price = this.order.isPreorder ? 10 : 12;
            
            this.order.combos[comboType].price = price;
            this.order.combos[comboType].total = quantity * price;
        });
    }

    updateOrderSummary() {
        const orderItemsContainer = document.getElementById('orderItems');
        orderItemsContainer.innerHTML = '';

        // Add individual items
        Object.keys(this.order.items).forEach(itemName => {
            if (this.order.items[itemName].quantity > 0) {
                const item = this.order.items[itemName];
                const displayName = this.formatItemName(itemName);
                
                const itemElement = document.createElement('div');
                itemElement.className = 'order-item';
                itemElement.innerHTML = `
                    <div class="item-name">${displayName}</div>
                    <div class="item-quantity">Qty: ${item.quantity}</div>
                    <div class="item-price">${item.total}€</div>
                `;
                orderItemsContainer.appendChild(itemElement);
            }
        });

        // Add combo platters
        Object.keys(this.order.combos).forEach(comboType => {
            if (this.order.combos[comboType].quantity > 0) {
                const combo = this.order.combos[comboType];
                const displayName = comboType === 'veg' ? 'Veg Combo Platter' : 'Non-Veg Combo Platter';
                
                const itemElement = document.createElement('div');
                itemElement.className = 'order-item';
                
                // Create the main combo info
                const mainInfo = document.createElement('div');
                mainInfo.className = 'combo-main-info';
                mainInfo.innerHTML = `
                    <div class="item-name">${displayName}</div>
                    <div class="item-quantity">Qty: ${combo.quantity}</div>
                    <div class="item-price">${combo.total}€</div>
                `;
                itemElement.appendChild(mainInfo);
                
                // Add customization details for each platter
                if (combo.customizations && combo.customizations.length > 0) {
                    const customizationsContainer = document.createElement('div');
                    customizationsContainer.className = 'combo-customizations';
                    
                    combo.customizations.forEach((customization, index) => {
                        const platterDetails = document.createElement('div');
                        platterDetails.className = 'platter-details';
                        const isVeg = comboType === 'veg';
                        platterDetails.innerHTML = `
                            <div class="platter-number">Platter ${index + 1}:</div>
                            <div class="platter-items">
                                <div>• ${this.formatItemName(customization.option1)}</div>
                                ${isVeg ? 
                                    `<div>• Honey Chilli Cauliflower</div>` : 
                                    `<div>• ${this.formatItemName(customization.option2)}</div>`
                                }
                                <div>• ${this.formatItemName(customization.option3)}</div>
                            </div>
                        `;
                        customizationsContainer.appendChild(platterDetails);
                    });
                    
                    itemElement.appendChild(customizationsContainer);
                }
                
                orderItemsContainer.appendChild(itemElement);
            }
        });

        // Calculate totals
        this.calculateTotals();
        this.updateTotalDisplay();
    }

    calculateTotals() {
        let subtotal = 0;

        // Add individual items
        Object.values(this.order.items).forEach(item => {
            subtotal += item.total;
        });

        // Add combos
        Object.values(this.order.combos).forEach(combo => {
            subtotal += combo.total;
        });

        this.order.subtotal = subtotal;
        
        // Calculate discount (pre-order gets discount prices, no additional percentage discount)
        this.order.discount = 0; // No additional discount since pre-order prices are already discounted
        this.order.total = subtotal;
    }

    updateTotalDisplay() {
        // Hide subtotal since we only show final price
        document.getElementById('subtotal').parentElement.style.display = 'none';
        document.getElementById('total').textContent = `${this.order.total.toFixed(2)}€`;
    }

    formatItemName(itemName) {
        const nameMap = {
            'phuchka': 'Phuchka',
            'papri-chat': 'Papri Chat',
            'honey-chilli-cauliflower': 'Honey Chilli Cauliflower',
            'narkel-naru': 'Narkel Naru',
            'chana-pora': 'Chana Pora',
            'chicken-65': 'Chicken 65',
            'chicken-shami-kabab': 'Chicken Shami Kabab'
        };
        return nameMap[itemName] || itemName;
    }

    initializeWarningSystem() {
        const warningClose = document.getElementById('warningClose');
        if (warningClose) {
            warningClose.addEventListener('click', () => {
                this.hideWarning();
            });
        }
    }

    showWarning(message) {
        const warningContainer = document.getElementById('warningContainer');
        const warningText = document.getElementById('warningText');
        
        if (warningContainer && warningText) {
            warningText.textContent = message;
            warningContainer.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.hideWarning();
            }, 5000);
        }
    }

    hideWarning() {
        const warningContainer = document.getElementById('warningContainer');
        if (warningContainer) {
            warningContainer.style.display = 'none';
        }
    }

    validateForm() {
        const nameInput = document.getElementById('customerName');
        const mobileInput = document.getElementById('mobileNumber');
        const paymentInputs = document.querySelectorAll('input[name="paymentType"]');
        const placeOrderBtn = document.getElementById('placeOrder');
        
        const name = nameInput.value.trim();
        const mobile = mobileInput.value.trim();
        const hasItems = this.hasItemsInOrder();
        const selectedPayment = Array.from(paymentInputs).find(input => input.checked);
        
        // Validate individual fields
        const isNameValid = name.length > 0;
        const isMobileValid = mobile.length > 0;
        const isPaymentValid = selectedPayment !== undefined;
        
        // Handle Bizum verification field
        const bizumVerification = document.getElementById('bizumVerification');
        const bizumNumber = document.getElementById('bizumNumber');
        const isBizumSelected = selectedPayment && selectedPayment.value === 'bizum';
        
        // Show/hide Bizum verification field
        if (bizumVerification) {
            bizumVerification.style.display = isBizumSelected ? 'block' : 'none';
            bizumVerification.classList.toggle('active', isBizumSelected);
            if (!isBizumSelected) {
                bizumNumber.value = ''; // Clear the field when not selected
            }
            bizumNumber.required = isBizumSelected; // Make it required only when Bizum is selected
        }

        // Validate Bizum number when Bizum is selected
        const isBizumNumberValid = !isBizumSelected || (bizumNumber && bizumNumber.value.trim().length > 0);
        
        // Add validation feedback classes
        nameInput.classList.toggle('invalid', !isNameValid && nameInput.classList.contains('touched'));
        mobileInput.classList.toggle('invalid', !isMobileValid && mobileInput.classList.contains('touched'));
        if (bizumNumber) {
            bizumNumber.classList.toggle('invalid', !isBizumNumberValid && bizumNumber.classList.contains('touched'));
        }
        
        // Add touched class on blur
        nameInput.addEventListener('blur', () => {
            nameInput.classList.add('touched');
            this.validateForm();
        });
        
        mobileInput.addEventListener('blur', () => {
            mobileInput.classList.add('touched');
            this.validateForm();
        });
        
        // Add touched class for payment options
        paymentInputs.forEach(input => {
            input.addEventListener('change', () => {
                input.closest('.payment-type').classList.add('touched');
                this.validateForm();
            });
        });
        
        // Show error messages
        const nameError = nameInput.nextElementSibling;
        const mobileError = mobileInput.nextElementSibling;
        const paymentError = document.querySelector('.payment-type .error-message');
        
        if (!isNameValid && nameInput.classList.contains('touched')) {
            nameError.textContent = 'Please enter your name';
            nameError.style.display = 'block';
        } else {
            nameError.style.display = 'none';
        }
        
        if (!isMobileValid && mobileInput.classList.contains('touched')) {
            mobileError.textContent = 'Please enter your mobile number';
            mobileError.style.display = 'block';
        } else {
            mobileError.style.display = 'none';
        }
        
        const paymentType = document.querySelector('.payment-type');
        if (!isPaymentValid && paymentType.classList.contains('touched')) {
            paymentError.textContent = 'Please select a payment method';
            paymentError.style.display = 'block';
        } else {
            paymentError.style.display = 'none';
            // Don't consider payment validation until user has interacted with it
            if (!paymentType.classList.contains('touched')) {
                isPaymentValid = true;
            }
        }
        
        // Show no items selected message
        const orderError = document.querySelector('.order-error');
        if (!hasItems) {
            if (!orderError) {
                const error = document.createElement('div');
                error.className = 'order-error';
                error.textContent = 'Please select at least one item';
                placeOrderBtn.parentNode.insertBefore(error, placeOrderBtn);
            }
        } else if (orderError) {
            orderError.remove();
        }
        
        // Update button state
        const isValid = isNameValid && isMobileValid && isPaymentValid && hasItems;
        placeOrderBtn.disabled = !isValid;
        placeOrderBtn.style.opacity = isValid ? '1' : '0.5';
        placeOrderBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
        
        // Add vibration feedback on mobile
        if (!isValid && 'vibrate' in navigator && isMobile()) {
            navigator.vibrate(200);
        }
    }

    hasItemsInOrder() {
        const hasItems = Object.values(this.order.items).some(item => item.quantity > 0);
        const hasCombos = Object.values(this.order.combos).some(combo => combo.quantity > 0);
        return hasItems || hasCombos;
    }

    async placeOrder() {
        // Validate form
        const name = document.getElementById('customerName').value.trim();
        const mobile = document.getElementById('mobileNumber').value.trim();
        const selectedPayment = document.querySelector('input[name="paymentType"]:checked');
        
        if (!name || !mobile || !selectedPayment) {
            this.showWarning('Please fill in all required fields (name, mobile number, and payment method).');
            return;
        }

        if (!this.hasItemsInOrder()) {
            this.showWarning('Please select at least one item to order.');
            return;
        }

        // Store customer info
        this.order.customerInfo = {
            name: name,
            mobile: mobile,
            paymentType: selectedPayment.value,
            bizumNumber: selectedPayment.value === 'bizum' ? document.getElementById('bizumNumber').value : null
        };

        // Generate order and payment IDs
        const orderId = this.generateOrderId();
        const paymentId = this.generatePaymentId();

        // Prepare data for Google Script
        const orderData = {
            orderId: orderId,
            paymentId: paymentId,
            order: this.order
        };

        try {
            // Show loading state
            const placeOrderBtn = document.getElementById('placeOrder');
            const originalText = placeOrderBtn.textContent;
            placeOrderBtn.textContent = 'Processing...';
            placeOrderBtn.disabled = true;

            // Show loading state in button
            placeOrderBtn.innerHTML = `
                <span class="spinner"></span>
                <span>Processing...</span>
            `;
            
            // Send order to Google Script with retry logic
            const result = await this.sendOrderWithRetry(orderData);

            if (result.status === 'success') {
                // Show confirmation
                this.showOrderConfirmation(orderId, paymentId);
            } else {
                throw new Error(result.message || 'Failed to process order');
            }
        } catch (error) {
            console.error('Error processing order:', error);
            this.showWarning('There was an error processing your order. Please try again or contact support.');
        } finally {
            // Reset button state
            const placeOrderBtn = document.getElementById('placeOrder');
            placeOrderBtn.textContent = originalText;
            placeOrderBtn.disabled = false;
        }
    }

    generateOrderId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `DK${timestamp}${random}`;
    }

    generatePaymentId() {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        return `PAY${timestamp}${random}`;
    }

    /**
     * Send order to Google Script with retry logic
     */
    async sendOrderWithRetry(orderData, attempt = 1) {
        try {
            // Check if Google Script URL is configured
            if (!this.googleScriptUrl || this.googleScriptUrl === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
                throw new Error('Google Script URL not configured. Please update the googleScriptUrl in the OrderManager constructor.');
            }

            const response = await fetch(this.googleScriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            
            if (attempt < this.maxRetries) {
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
                return this.sendOrderWithRetry(orderData, attempt + 1);
            } else {
                throw error;
            }
        }
    }

    /**
     * Test Google Script connection
     */
    async testGoogleScriptConnection() {
        try {
            if (!this.googleScriptUrl || this.googleScriptUrl === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
                console.warn('Google Script URL not configured');
                return false;
            }

            const response = await fetch(this.googleScriptUrl, {
                method: 'GET'
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Google Script connection test successful:', result);
                return true;
            } else {
                console.error('Google Script connection test failed:', response.status);
                return false;
            }
        } catch (error) {
            console.error('Google Script connection test error:', error);
            return false;
        }
    }

    showOrderConfirmation(orderId, paymentId) {
        const confirmationSection = document.getElementById('orderConfirmation');
        
        // Show loading state
        confirmationSection.style.display = 'block';
        confirmationSection.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Processing your order...</p>
            </div>
        `;
        
        // Simulate processing delay
        setTimeout(() => {
            // Update confirmation details
            confirmationSection.innerHTML = `
                <h2>Order Confirmed!</h2>
                <div class="confirmation-details">
                    <p><strong>Order ID:</strong> <span id="orderId">${orderId}</span></p>
                    <p><strong>Payment ID:</strong> <span id="paymentId">${paymentId}</span></p>
                    <p><strong>Customer:</strong> <span id="confirmedName">${this.order.customerInfo.name}</span></p>
                    <p><strong>Mobile:</strong> <span id="confirmedMobile">${this.order.customerInfo.mobile}</span></p>
                    <p><strong>Payment Method:</strong> <span id="confirmedPayment">${this.order.customerInfo.paymentType.charAt(0).toUpperCase() + this.order.customerInfo.paymentType.slice(1)}</span></p>
                    ${this.order.customerInfo.bizumNumber ? `<p><strong>Bizum Number/Name:</strong> <span id="confirmedBizumNumber">${this.order.customerInfo.bizumNumber}</span></p>` : ''}
                    <p><strong>Total Amount:</strong> <span id="confirmedTotal">${this.order.total.toFixed(2)}€</span></p>
                    <p><strong>Order Time:</strong> <span id="orderTime">${new Date().toLocaleString()}</span></p>
                </div>
                <div class="special-offer" style="display: ${this.order.total >= 30 ? 'block' : 'none'}">
                    <p>**30€+ orders come with a lucky draw bonus!</p>
                </div>
            `;
            
            // Add success animation
            confirmationSection.classList.add('confirmation-success');
            
            // Enhanced smooth scroll to confirmation
            if ('scrollBehavior' in document.documentElement.style) {
                confirmationSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                smoothScrollTo(confirmationSection, 800);
            }
            
            // Reset form after a delay
            setTimeout(() => {
                this.resetOrder();
                confirmationSection.classList.remove('confirmation-success');
            }, 10000); // Reset after 10 seconds
        }, 1500); // Show confirmation after 1.5s loading
    }

    initializeCustomizationListeners() {
        // Add event listeners for radio buttons when they're added to the DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            // Find all radio buttons in the added node
                            node.querySelectorAll('input[type="radio"]').forEach(radio => {
                                radio.addEventListener('change', (e) => {
                                    const platterInstance = e.target.closest('.platter-instance');
                                    if (platterInstance) {
                                        const platterIndex = parseInt(platterInstance.dataset.platterIndex);
                                        const comboType = e.target.name.split('-')[0]; // 'veg' or 'non-veg'
                                        let optionNumber;
                                        if (e.target.name.includes('option1')) {
                                            optionNumber = 'option1';
                                        } else if (e.target.name.includes('option2')) {
                                            optionNumber = 'option2';
                                        } else if (e.target.name.includes('option3')) {
                                            optionNumber = 'option3';
                                        }
                                        
                                        if (this.order.combos[comboType] && 
                                            this.order.combos[comboType].customizations && 
                                            this.order.combos[comboType].customizations[platterIndex]) {
                                            this.order.combos[comboType].customizations[platterIndex][optionNumber] = e.target.value;
                                            this.updateOrderSummary();
                                        }
                                    }
                                });
                            });
                        }
                    });
                }
            });
        });

        // Observe both platter customization containers
        document.querySelectorAll('.platter-customization-container').forEach(container => {
            observer.observe(container, { childList: true, subtree: true });
        });
    }

    resetOrder() {
        // Reset order data
        this.order = {
            items: {},
            combos: {},
            customerInfo: {},
            isPreorder: true, // Keep pre-order as default
            subtotal: 0,
            discount: 0,
            total: 0
        };

        // Reset form
        document.getElementById('customerForm').reset();
        document.getElementById('isPreorder').checked = true; // Keep pre-order checked

        // Reset quantity selectors
        document.querySelectorAll('.quantity').forEach(select => {
            select.value = '0';
        });

        // Hide confirmation
        document.getElementById('orderConfirmation').style.display = 'none';

        // Update display
        this.updateOrderSummary();
        this.validateForm();
    }
}

// Mobile detection utility
function isMobile() {
    return window.innerWidth <= 768;
}

// Initialize the order manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const orderManager = new OrderManager();
    
    // Test Google Script connection on page load
    orderManager.testGoogleScriptConnection().then(success => {
        if (success) {
            console.log('✅ Google Script connection is working');
        } else {
            console.warn('⚠️ Google Script connection failed. Please check your configuration.');
        }
    });
    
    // Add loading animation for place order button
    document.getElementById('placeOrder').addEventListener('click', function() {
        const originalText = this.textContent;
        this.textContent = 'Processing...';
        this.disabled = true;
        
        setTimeout(() => {
            this.textContent = originalText;
            this.disabled = false;
        }, 2000);
    });
});
