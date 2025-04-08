
# Font Upload Instructions

To use the custom fonts with this application:

## If you have TrueType (.ttf) fonts:

1. Convert your TrueType (.ttf) fonts to web formats (WOFF and WOFF2) using one of these online converters:
   - [Transfonter](https://transfonter.org/)
   - [Font Squirrel Generator](https://www.fontsquirrel.com/tools/webfont-generator)
   - [Online Font Converter](https://onlinefontconverter.com/)

2. When converting:
   - Select both WOFF and WOFF2 output formats
   - Set optimal compression
   - Use the exact output filenames:
     - Rockwell-Bold.woff
     - Rockwell-Bold.woff2
     - AArslanWessamA.woff
     - AArslanWessamA.woff2

3. After conversion, place these files in the `public/fonts` directory of the application.

4. To verify that fonts are loading correctly:
   - Open the browser console (F12)
   - Check the Network tab to ensure font files are being found
   - Look for font debugging messages in the console

## Font Testing

The application includes font debugging classes you can activate in the console:

```javascript
// Test the Rockwell font
document.querySelector('.card p').classList.add('font-debug-rockwell');

// Test the Arslan font
document.querySelector('.card p').classList.add('font-debug-arslan');
```

**Important Note**: 
When using custom fonts, make sure the filenames match EXACTLY what the application is looking for. Font names are case-sensitive.
