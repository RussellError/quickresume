# Fonts

QuickResume uses system fonts (Georgia for the Classic and Professional headings, the
device's UI font everywhere else), so nothing is downloaded and the page loads fast.

To use your own fonts:

1. Put `.woff2` files in this folder, for example `Inter-Variable.woff2`.
2. Add an `@font-face` rule to `assets/css/style.css`:

   ```css
   @font-face {
     font-family: "Inter";
     src: url("../fonts/Inter-Variable.woff2") format("woff2");
     font-weight: 100 900;
     font-display: swap;
   }
   ```

3. Put the new family first in the `--sans` or `--serif` variable at the top of `style.css`
   (and in `resume.css` if you want it inside the resume itself).

The Content-Security-Policy in `_headers` already allows fonts from the same origin
(`font-src 'self'`). Font files are cached for a year, so give new versions a new file name.
