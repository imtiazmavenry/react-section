# TSX → Modular Shortcode Builder

## Install

```bash
pnpm install
```

## Build a shortcode

If your source exports multiple components, explicitly choose one:

```bash
pnpm shortcode testimonial HeroDemo1 --build
```

If the export name is omitted, the builder automatically uses the first detected export. For the example component with `export { HeroDemo1, HeroDemo2, HeroDemo3 }`, this means `HeroDemo1`:

```bash
pnpm shortcode gallery --build
```

The shortcode name controls the DOM target and output filenames.

```html
<div data-msc-shortcode="gallery"></div>
```

Output:

```text
dist/gallery.js
dist/gallery.css
```

Another example:

```bash
pnpm shortcode testimonial HeroDemo2 --build
```

Output:

```text
dist/testimonial.js
dist/testimonial.css
```

The source can be a complete TSX component structure. Imports such as `@/components/...` and `@/lib/...` are supported through the Vite alias.


## Mounting

Generated shortcodes use only the `data-msc-shortcode` attribute:

```html
<div data-msc-shortcode="gallery"></div>
```

The generated JavaScript uses `querySelectorAll()` so multiple instances of the same shortcode can appear on one page.
