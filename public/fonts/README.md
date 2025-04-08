
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

## Font Not Displaying?

If the custom fonts aren't showing:

1. Make sure you've placed the font files in this exact directory
2. Check that filenames match EXACTLY (case-sensitive)
3. Check browser console (F12 > Network tab) for 404 errors
4. Try clearing your browser cache and refresh
5. Note that the app expects web font formats (WOFF/WOFF2), not TTF

## Font Debugging:

The application includes special CSS classes for troubleshooting:
- `font-debug-rockwell` - Will apply Rockwell font with green color
- `font-debug-arslan` - Will apply Arslan font with blue color

You can try these in your browser console to test if fonts are loading correctly.
