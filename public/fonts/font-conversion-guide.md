
# Complete Font Conversion Guide

## Why Web Fonts?

Web browsers prefer optimized font formats like WOFF (Web Open Font Format) and WOFF2 instead of traditional TTF (TrueType) fonts. These formats:

- Load faster (especially WOFF2 which has better compression)
- Render more consistently across browsers
- Provide better performance

## Step-by-Step Conversion Process

### Option 1: Using Transfonter (Recommended)

1. **Go to [Transfonter](https://transfonter.org/)**
2. **Upload your TTF files:**
   - Click the "Add fonts" button
   - Select your Rockwell-Bold.ttf and AArslanWessamA.ttf files
   - Click "Open"

3. **Configure conversion settings:**
   - Under "Formats", check "WOFF" and "WOFF2" (uncheck others)
   - Set "Base64 encode" to OFF
   - Set "With fallbacks" to OFF
   - Keep "Subset" set to "No subsetting"
   - Click "Convert"

4. **Download and prepare files:**
   - Download the ZIP file
   - Extract the contents
   - Locate the converted WOFF and WOFF2 files
   - Rename them precisely to match these names:
     - Rockwell-Bold.woff
     - Rockwell-Bold.woff2
     - AArslanWessamA.woff
     - AArslanWessamA.woff2

5. **Place files correctly:**
   - Move all four files into the `/public/fonts` directory of your project
   - Ensure the names match exactly (case-sensitive)

### Option 2: Using Font Squirrel Generator

1. **Go to [Font Squirrel Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator)**
2. **Upload your TTF fonts:**
   - Click "Add Fonts" and select your TTF files
   
3. **Choose the "Expert" option and configure:**
   - Under "Formats", check only "WOFF" and "WOFF2"
   - Set "Subsetting" to "No Subsetting"
   - Uncheck "Fix Missing Glyphs" and "Fix Vertical Metrics"
   - Click "Download Your Kit"

4. **Prepare the files:**
   - Follow steps 4-5 from Option 1 above

## Verifying Font Installation

After placing the files in the correct location, verify that they're working:

1. **Clear browser cache:**
   - Press Ctrl+Shift+Del (or Cmd+Shift+Del on Mac)
   - Check "Cached images and files"
   - Click "Clear data"

2. **Refresh the application**

3. **Use the font debugging tools:**
   - Hover over a card and click the bug icon to cycle through fonts
   - Click the warning icon to see font loading status

If the fonts show "not loaded", check:
- File locations (must be in `/public/fonts/`)
- File names (case-sensitive, must match exactly)
- File formats (must be WOFF and WOFF2)
- Network requests (use F12 dev tools, Network tab)

## Common Problems and Solutions

### Files Not Found (404 errors)
- Ensure files are in the correct directory (/public/fonts/)
- Check file permissions
- Verify exact filenames match

### Fonts Not Rendering Correctly
- Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Check if font files are correctly formatted
- Use the font debugging tools to verify loading

### Font Shows as Fallback
- The WOFF/WOFF2 files might be corrupted
- Try converting again with a different converter
- Ensure you're using the correct font files initially

## Need More Help?

If you're still having issues:
1. Use the font debugging tools in the application
2. Check the browser console (F12) for errors
3. Try a different browser to see if the issue persists
