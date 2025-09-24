# Dil Khush Order System

A simple and clean order management system for Dil Khush restaurant.

## Files

- `index.html` - Main order form
- `order.js` - Order management logic
- `script.js` - Additional functionality
- `styles.css` - Styling
- `GOOGLESCRIPTS/Code.gs` - Google Apps Script for saving orders

## Setup

1. **Deploy Google Script:**
   - Copy `GOOGLESCRIPTS/Code.gs` to Google Apps Script
   - Deploy as Web app with "Anyone" access
   - Copy the Web App URL

2. **Update Script URL:**
   - Open `order.js`
   - Replace `YOUR_GOOGLE_SCRIPT_URL_HERE` with your deployed URL

3. **Deploy Website:**
   - Upload all files to your web server
   - Or use GitHub Pages, Netlify, etc.

## Features

- Menu item selection
- Combo platter customization
- Customer information form
- Order validation
- Google Sheets integration
- Order confirmation

## Google Sheet

Orders are saved to your Google Sheet with columns:
- Order ID
- Customer Name
- Mobile Number
- Payment Type
- Total Amount
- Items (JSON)
- Timestamp