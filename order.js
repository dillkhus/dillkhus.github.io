// Update this URL with your new deployment URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwop29aX2YbT76oLsBISk9xqn1x1JHw2tCJyHv1CftlqVwunzuXdYQJfvYzzHhkWWOQTw/exec';

class OrderManager {
    constructor() {
        this.order = {
            items: {},
            combos: {},
            customerInfo: {},
            isPreorder: true,
            subtotal: 0,
            discount: 0,
            total: 0
        };
        
        this.initializeEventListeners();
        this.updateOrderSummary();
    }

    initializeEventListeners() {
        // Individual item quantity selectors
        document.querySelectorAll('.food-item .quantity').forEach(select => {
            select.addEventListener('change', (e) => {
                const foodItem = e.target.closest('.food-item');
                const itemName = foodItem.dataset.item;
                const quantity = parseInt(e.target.value);
                const price = parseFloat(foodItem.dataset.preorderPrice);
                this.updateItemQuantity(itemName, quantity, price);
            });
        });

        // Combo platter quantity selectors
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity') && e.target.closest('.platter-option')) {
                const comboType = e.target.dataset.combo;
                const quantity = parseInt(e.target.value);
                const price = 10; // Pre-order price
                this.updateComboQuantity(comboType, quantity, price);
            }
        });

        // Platter customization radio buttons
        document.querySelectorAll('.platter-item-choice input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const platterOption = e.target.closest('.platter-option');
                const comboType = platterOption.querySelector('.quantity').dataset.combo;
                const itemNumber = e.target.name.includes('item1') ? 'option1' : 'option2';
                const value = e.target.value;

                if (this.order.combos[comboType]) {
                    this.order.combos[comboType].customizations.forEach(customization => {
                        customization[itemNumber] = value;
                    });
                    this.updateOrderSummary();
                }
            });
        });

        // Place order button
        document.getElementById('placeOrder').addEventListener('click', () => {
            this.placeOrder();
        });

        // Form validation
        document.getElementById('customerForm').addEventListener('input', () => {
            this.validateForm();
        });

        // Warning close button
        const warningClose = document.getElementById('warningClose');
        if (warningClose) {
            warningClose.addEventListener('click', () => this.hideWarning());
        }

        // Overlay controls
        const overlay = document.getElementById('orderOverlay');
        const closeBtn = document.getElementById('overlayClose');
        const okBtn = document.getElementById('overlayOk');
        const backdrop = document.querySelector('.order-overlay-backdrop');

        const hideOverlay = () => {
            if (overlay) {
                overlay.classList.remove('visible');
                overlay.setAttribute('aria-hidden', 'true');
            }
        };

        if (closeBtn) closeBtn.addEventListener('click', hideOverlay);
        if (okBtn) okBtn.addEventListener('click', hideOverlay);
        if (backdrop) backdrop.addEventListener('click', hideOverlay);
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

    updateComboQuantity(comboType, quantity, price) {
        const platterOption = document.querySelector(`.${comboType}-platter`);
        const platterCustomization = platterOption.querySelector('.platter-customization');
        const customizationContainer = platterCustomization.querySelector('.platter-customization-container');
        
        if (quantity === 0) {
            delete this.order.combos[comboType];
            if (platterCustomization) {
                platterCustomization.style.display = 'none';
                customizationContainer.innerHTML = '';
            }
        } else {
            if (platterCustomization) {
                platterCustomization.style.display = 'block';
                platterCustomization.style.opacity = '1';
                platterCustomization.style.height = 'auto';
            }
            
            this.order.combos[comboType] = {
                quantity: quantity,
                price: price,
                total: quantity * price,
                customizations: []
            };

            // Create customization UI
            customizationContainer.innerHTML = '';
            for (let i = 0; i < quantity; i++) {
                customizationContainer.innerHTML += this.createPlatterCustomizationTemplate(comboType, i);
            }

            // Initialize customizations
            const isVeg = comboType === 'veg';
            this.order.combos[comboType].customizations = Array(quantity).fill().map(() => ({
                option1: 'phuchka',
                option2: isVeg ? 'honey-chilli-cauliflower' : 'chicken-65',
                option3: 'chana-pora'
            }));

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
                
                const mainInfo = document.createElement('div');
                mainInfo.className = 'combo-main-info';
                mainInfo.innerHTML = `
                    <div class="item-name">${displayName}</div>
                    <div class="item-quantity">Qty: ${combo.quantity}</div>
                    <div class="item-price">${combo.total}€</div>
                `;
                itemElement.appendChild(mainInfo);
                
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

        this.calculateTotals();
        this.updateTotalDisplay();
    }

    calculateTotals() {
        let subtotal = 0;

        Object.values(this.order.items).forEach(item => {
            subtotal += item.total;
        });

        Object.values(this.order.combos).forEach(combo => {
            subtotal += combo.total;
        });

        this.order.subtotal = subtotal;
        this.order.discount = 0;
        this.order.total = subtotal;
    }

    updateTotalDisplay() {
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

    validateForm() {
        const nameInput = document.getElementById('customerName');
        const mobileInput = document.getElementById('mobileNumber');
        const paymentInputs = document.querySelectorAll('input[name="paymentType"]');
        const placeOrderBtn = document.getElementById('placeOrder');
        
        const name = nameInput.value.trim();
        const mobile = mobileInput.value.trim();
        const hasItems = this.hasItemsInOrder();
        const selectedPayment = Array.from(paymentInputs).find(input => input.checked);
        
        const isNameValid = name.length > 0;
        const isMobileValid = mobile.length > 0;
        const isPaymentValid = selectedPayment !== undefined;
        
        // Handle Bizum verification field
        const bizumVerification = document.getElementById('bizumVerification');
        const bizumNumber = document.getElementById('bizumNumber');
        const isBizumSelected = selectedPayment && selectedPayment.value === 'bizum';
        
        if (bizumVerification) {
            bizumVerification.style.display = isBizumSelected ? 'block' : 'none';
            if (!isBizumSelected) {
                bizumNumber.value = '';
            }
            bizumNumber.required = isBizumSelected;
        }

        const isBizumNumberValid = !isBizumSelected || (bizumNumber && bizumNumber.value.trim().length > 0);
        
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
        
        const isValid = isNameValid && isMobileValid && isPaymentValid && hasItems && isBizumNumberValid;
        placeOrderBtn.disabled = !isValid;
        placeOrderBtn.style.opacity = isValid ? '1' : '0.5';
        placeOrderBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
    }

    hasItemsInOrder() {
        const hasItems = Object.values(this.order.items).some(item => item.quantity > 0);
        const hasCombos = Object.values(this.order.combos).some(combo => combo.quantity > 0);
        return hasItems || hasCombos;
    }

    async placeOrder() {
        const name = document.getElementById('customerName').value.trim();
        const mobile = document.getElementById('mobileNumber').value.trim();
        const selectedPayment = document.querySelector('input[name="paymentType"]:checked');
        
        if (!name || !mobile || !selectedPayment) {
            this.showWarning('Please fill in all required fields.');
            return;
        }

        if (!this.hasItemsInOrder()) {
            this.showWarning('Please select at least one item to order.');
            return;
        }

        this.order.customerInfo = {
            name: name,
            mobile: mobile,
            paymentType: selectedPayment.value,
            bizumNumber: selectedPayment.value === 'bizum' ? document.getElementById('bizumNumber').value : null
        };

        const orderId = this.generateOrderId();
        const paymentId = this.generatePaymentId();
        const orderData = {
            orderId: orderId,
            paymentId: paymentId,
            order: this.order
        };

        // Log order details to console
        console.log('=== Order Details ===');
        console.log('Order ID:', orderId);
        console.log('Customer Info:', {
            name: name,
            mobile: mobile,
            paymentType: selectedPayment.value,
            bizumNumber: selectedPayment.value === 'bizum' ? document.getElementById('bizumNumber').value : null
        });
        
        // Log individual items
        console.log('Items Ordered:');
        Object.entries(this.order.items).forEach(([itemName, details]) => {
            if (details.quantity > 0) {
                console.log(`- ${this.formatItemName(itemName)}: ${details.quantity} x ${details.price}€ = ${details.total}€`);
            }
        });

        // Log combo platters
        console.log('Combo Platters:');
        Object.entries(this.order.combos).forEach(([comboType, details]) => {
            if (details.quantity > 0) {
                console.log(`- ${comboType === 'veg' ? 'Veg' : 'Non-Veg'} Combo: ${details.quantity} x ${details.price}€ = ${details.total}€`);
                if (details.customizations) {
                    details.customizations.forEach((custom, index) => {
                        console.log(`  Platter ${index + 1}: ${custom.option1}, ${custom.option2 || 'Honey Chilli Cauliflower'}, ${custom.option3}`);
                    });
                }
            }
        });

        // Log totals
        console.log('Order Summary:');
        console.log('Subtotal:', this.order.subtotal.toFixed(2) + '€');
        console.log('Total:', this.order.total.toFixed(2) + '€');
        console.log('==================');

        const placeOrderBtn = document.getElementById('placeOrder');
        const originalText = placeOrderBtn.textContent;
        
        try {
            placeOrderBtn.textContent = 'Processing...';
            placeOrderBtn.disabled = true;
            
            // Use FormData with no-cors to avoid preflight and CORS blocking
            const formData = new FormData();
            formData.append('data', JSON.stringify(orderData));

            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            });

            // With no-cors, response is opaque; assume success if no exception
            this.showOrderConfirmation(orderId);
        } catch (error) {
            console.error('Error processing order:', error);
            this.showWarning(`There was an error processing your order: ${error.message}. Please try again or contact support.`);
        } finally {
            placeOrderBtn.textContent = originalText;
            placeOrderBtn.disabled = false;
        }
    }

    showWarning(message) {
        const warningContainer = document.getElementById('warningContainer');
        const warningText = document.getElementById('warningText');
        if (warningText) {
            warningText.textContent = message;
        }
        if (warningContainer) {
            warningContainer.style.display = 'block';
        }
    }

    hideWarning() {
        const warningContainer = document.getElementById('warningContainer');
        if (warningContainer) {
            warningContainer.style.display = 'none';
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

    showOrderConfirmation(orderId) {
        const overlay = document.getElementById('orderOverlay');
        const content = document.getElementById('overlayContent');

        if (content && overlay) {
            const paymentLabel = this.order.customerInfo.paymentType.charAt(0).toUpperCase() + this.order.customerInfo.paymentType.slice(1);
            const now = new Date().toLocaleString();

            content.innerHTML = `
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Customer:</strong> ${this.order.customerInfo.name}</p>
                <p><strong>Mobile:</strong> ${this.order.customerInfo.mobile}</p>
                <p><strong>Payment Method:</strong> ${paymentLabel}</p>
                <p><strong>Total Amount:</strong> ${this.order.total.toFixed(2)}€</p>
                <p><strong>Order Time:</strong> ${now}</p>
                <p style="margin-top:8px;color:#065f46;font-weight:600;">30€+ orders come with a lucky draw bonus!</p>
            `;

            overlay.classList.add('visible');
            overlay.setAttribute('aria-hidden', 'false');
        }

        // Auto close and reload after 5 seconds
        setTimeout(() => {
            const overlayEl = document.getElementById('orderOverlay');
            if (overlayEl) {
                overlayEl.classList.remove('visible');
                overlayEl.setAttribute('aria-hidden', 'true');
            }
            window.location.reload();
        }, 3000);
    }

    resetOrder() {
        this.order = {
            items: {},
            combos: {},
            customerInfo: {},
            isPreorder: true,
            subtotal: 0,
            discount: 0,
            total: 0
        };

        document.getElementById('customerForm').reset();
        document.querySelectorAll('.quantity').forEach(select => {
            select.value = '0';
        });

        const overlay = document.getElementById('orderOverlay');
        if (overlay) {
            overlay.classList.remove('visible');
            overlay.setAttribute('aria-hidden', 'true');
        }
        this.updateOrderSummary();
        this.validateForm();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    new OrderManager();
});