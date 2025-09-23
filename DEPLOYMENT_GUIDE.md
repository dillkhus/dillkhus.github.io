# 🚀 Deployment Guide - Dil Khush Order Form with Google Sheets

This guide will walk you through deploying your order form with Google Sheets integration.

## 📋 Prerequisites

- Google account
- Access to Google Sheets and Google Apps Script
- Your website files ready for deployment

## 🔧 Step 1: Set Up Google Apps Script

### 1.1 Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "Dil Khush Orders" (or your preferred name)
4. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```

### 1.2 Create Google Apps Script
1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the contents from `GOOGLESCRIPTS/Code.gs`
4. Update the `SHEET_ID` constant with your actual Sheet ID:
   ```javascript
   const SHEET_ID = 'YOUR_ACTUAL_SHEET_ID_HERE';
   ```

### 1.3 Deploy the Script
1. Click "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set the following options:
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click "Deploy"
5. **IMPORTANT**: Copy the Web App URL - you'll need this for your website

## 🌐 Step 2: Update Your Website

### 2.1 Update JavaScript Configuration
1. Open `script.js` in your project
2. Find this line:
   ```javascript
   this.googleScriptUrl = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
   ```
3. Replace `YOUR_GOOGLE_SCRIPT_URL_HERE` with your actual Google Script Web App URL

### 2.2 Test the Integration
1. Open `test-google-script.html` in your browser
2. Enter your Google Script URL
3. Test the connection and submit a test order
4. Verify the data appears in your Google Sheet

## 🚀 Step 3: Deploy Your Website

### Option A: GitHub Pages (Recommended)
1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Select "Deploy from a branch" → "main"
4. Your site will be available at `https://yourusername.github.io/repository-name`

### Option B: Netlify
1. Go to [Netlify](https://netlify.com)
2. Drag and drop your project folder
3. Your site will be deployed automatically

### Option C: Vercel
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Deploy with default settings

## ✅ Step 4: Verify Everything Works

### 4.1 Test Your Live Website
1. Visit your deployed website
2. Fill out the form and submit an order
3. Check your Google Sheet to confirm the data was saved

### 4.2 Check Google Sheet Structure
Your Google Sheet should have these columns:
- Order ID, Payment ID, Timestamp
- Customer Name, Mobile Number
- Payment Type, Bizum Number
- Order details, Total Amount
- Full order JSON

## 🔧 Troubleshooting

### Common Issues

#### ❌ "Script not found" error
- **Solution**: Verify the Google Script URL is correct
- **Check**: Make sure the script is deployed with "Anyone" access

#### ❌ "Permission denied" error
- **Solution**: Ensure the script is deployed with "Me" as executor
- **Check**: Verify the Sheet ID is correct and the sheet exists

#### ❌ Orders not appearing in sheet
- **Solution**: Check browser console for errors
- **Check**: Verify the Sheet ID in your Google Script
- **Check**: Make sure the sheet tab name matches `SHEET_NAME` in the script

#### ❌ CORS errors
- **Solution**: This is normal for Google Apps Script - the script handles CORS internally
- **Check**: Make sure you're using the correct Web App URL (not the script editor URL)

### Testing Commands

You can test your Google Script directly:

1. **Test GET request**: Visit your Web App URL in a browser
2. **Test POST request**: Use the test page (`test-google-script.html`)
3. **Check logs**: Go to Google Apps Script → Executions to see logs

## 📊 Monitoring Your Orders

### Google Sheet Features
- **Auto-formatting**: Headers are automatically styled
- **Auto-resize**: Columns adjust to content
- **Frozen headers**: First row stays visible when scrolling
- **JSON data**: Complete order details stored for reference

### Order Management
- Each order gets a unique Order ID and Payment ID
- Timestamps are automatically added
- Customer information is clearly separated
- Order details are broken down by item and combo

## 🔒 Security Considerations

- **Public access**: The Google Script is set to "Anyone" access (required for your website)
- **Data privacy**: Only order data is accessible through the script
- **Sheet access**: Keep your Google Sheet private or share only with authorized personnel
- **No sensitive data**: The script doesn't store passwords or personal information beyond what customers provide

## 📈 Advanced Features (Optional)

You can enhance your setup by:

1. **Email notifications**: Add email alerts when orders are received
2. **Order status tracking**: Add status updates to orders
3. **Data validation**: Add more validation rules
4. **Analytics**: Track order patterns and popular items
5. **Backup**: Set up automatic backups of your order data

## 🆘 Support

If you encounter issues:

1. **Check the test page**: Use `test-google-script.html` to diagnose problems
2. **Browser console**: Check for JavaScript errors
3. **Google Script logs**: Check execution logs in Google Apps Script
4. **Verify URLs**: Make sure all URLs are correct and accessible

## 📝 Quick Reference

### Important URLs to Keep Handy:
- **Google Sheets**: `https://sheets.google.com`
- **Google Apps Script**: `https://script.google.com`
- **Your Web App URL**: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
- **Your Website**: `https://yourdomain.com`

### Key Files:
- `GOOGLESCRIPTS/Code.gs` - Google Apps Script code
- `script.js` - Main website JavaScript (update the URL here)
- `test-google-script.html` - Testing page
- `GOOGLESCRIPTS/README.md` - Detailed setup instructions

---

🎉 **Congratulations!** Your order form is now integrated with Google Sheets and ready to collect orders automatically!
