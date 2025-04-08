
# Custom Fonts for Message Cards

This directory contains custom fonts used by the card message crafter application:

- Rockwell-Bold.woff and Rockwell-Bold.woff2: Used for English text
- AArslanWessamA.woff and AArslanWessamA.woff2: Used for Arabic text

## Converting TTF to Web Fonts:

If you have TrueType (.ttf) files, you need to convert them to web formats:

1. Use online converters like [Transfonter](https://transfonter.org/) or [Font Squirrel](https://www.fontsquirrel.com/tools/webfont-generator)
2. Upload your TTF files
3. Select WOFF and WOFF2 formats
4. Download the converted files
5. Place them in this directory with EXACT names:
   - Rockwell-Bold.woff
   - Rockwell-Bold.woff2
   - AArslanWessamA.woff
   - AArslanWessamA.woff2

## Using The Converter:

Here's a step-by-step guide using Transfonter:

1. Go to [Transfonter.org](https://transfonter.org/)
2. Click "Add fonts" and select your TTF files
3. In the options:
   - Check "WOFF" and "WOFF2" format options
   - Set "Base64 encode" to OFF
   - Set "With fallbacks" to OFF
   - Keep "Subset" set to "No subsetting"
4. Click "Convert"
5. Download the ZIP file
6. Extract and rename the files as needed
7. Place them in this directory

## Font Not Displaying?

If the custom fonts aren't showing:

1. Make sure you've placed the font files in this exact directory
2. Check that filenames match EXACTLY (case-sensitive)
3. Check browser console (F12 > Network tab) for 404 errors
4. Try clearing your browser cache and refresh
5. Use the font debugging tools in the UI (bug icon when hovering over a card)
6. Check font loading status in the UI (warning icon when hovering over a card)

## Tool for Testing:

The application includes special debugging tools for troubleshooting:
- Bug icon: Cycles through font styles to test appearance
- Warning icon: Shows font loading status and details
