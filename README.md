# Dil Khush Homemade - Online Ordering Website

A beautiful, responsive website that replicates your price list design with full ordering functionality.

## Features

### 🎨 Design
- **Exact replica** of your price list design with warm colors (red, yellow, beige)
- **Professional logo** with circular design and Gulab Jamun illustration
- **Responsive design** that works perfectly on mobile, tablet, and desktop
- **Modern UI/UX** with smooth animations and hover effects

### 🍽️ Menu Items
- **7 Individual Items**: Phuchka, Papri Chat, Honey Chilli Cauliflower, Narkel Naru, Chana Pora, Chicken 65, Chicken Shami Kabab
- **Dietary Indicators**: Clear 100% VEG and NON VEG labels
- **Dual Pricing**: Regular prices and pre-order discount prices
- **Combo Platters**: Both Veg and Non-Veg options with special pricing

### 🛒 Ordering System
- **Quantity Selection**: Easy dropdown menus for each item
- **Real-time Calculation**: Automatic total calculation with discounts
- **Pre-order Discounts**: 10% discount when pre-order option is selected
- **Customer Information**: Name and mobile number collection
- **Order Summary**: Clear breakdown of items and pricing

### 💳 Payment & Confirmation
- **Unique Order ID**: Generated for each order (format: DK + timestamp + random)
- **Payment ID**: Separate payment reference for tracking
- **Order Confirmation**: Complete order details with customer info
- **Special Offers**: Lucky draw bonus notification for 30€+ orders

## How to Use

### For Customers
1. **Browse Menu**: Scroll through individual items and combo platters
2. **Select Items**: Use quantity dropdowns to choose how many of each item
3. **Choose Pre-order**: Check the pre-order box for discount prices
4. **Fill Details**: Enter your name and mobile number
5. **Review Order**: Check the order summary for total amount
6. **Place Order**: Click "Place Order" to get your Order ID and Payment ID

### For Restaurant
1. **Open Website**: Simply open `index.html` in any web browser
2. **No Setup Required**: Everything works offline - no server needed
3. **Order Tracking**: Use the generated Order ID and Payment ID to track orders
4. **Mobile Friendly**: Customers can order from their phones easily

## File Structure
```
dilkhush/
├── index.html          # Main website file
├── styles.css          # All styling and responsive design
├── script.js           # Ordering functionality and calculations
└── README.md           # This documentation
```

## Technical Details

### Technologies Used
- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with flexbox, grid, and animations
- **JavaScript (ES6+)**: Class-based order management system
- **Google Fonts**: Poppins font family for professional look

### Key Features
- **Responsive Grid**: Automatically adjusts to screen size
- **Form Validation**: Ensures required fields are filled
- **Price Calculation**: Real-time updates with discount logic
- **Order Management**: Complete order lifecycle from selection to confirmation
- **Mobile Optimization**: Touch-friendly interface for mobile users

### Browser Compatibility
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)
- No external dependencies required

## Customization

### Adding New Items
1. Add new `.food-item` div in `index.html`
2. Set `data-item`, `data-price`, `data-preorder-price`, and `data-veg` attributes
3. Update the `formatItemName()` function in `script.js`

### Changing Prices
- Update `data-price` and `data-preorder-price` attributes in HTML
- Modify combo platter prices in the JavaScript `updateComboQuantity()` method

### Styling Changes
- All colors and fonts are defined in `styles.css`
- Easy to modify colors, spacing, and layout
- Responsive breakpoints are clearly marked

## Special Features

### Pre-order System
- Customers can choose between regular and pre-order pricing
- Pre-orders get 10% discount automatically applied
- Clear visual indication of which prices apply

### Order Confirmation
- Unique Order ID and Payment ID for each order
- Complete order details with customer information
- Special offer notification for large orders (30€+)

### Mobile Experience
- Touch-optimized interface
- Responsive design that works on all screen sizes
- Easy-to-use quantity selectors and form inputs

## Getting Started

1. **Download Files**: Save all files in the same folder
2. **Open Website**: Double-click `index.html` or open in any web browser
3. **Start Taking Orders**: The website is ready to use immediately!

## Support

The website is designed to be self-contained and easy to use. All functionality is built-in and requires no additional setup or maintenance.

---

**Dil Khush Homemade** - Bringing authentic flavors to your doorstep! 🍽️✨
