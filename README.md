# TSX → Modular Shortcode Builder

## Most Used

```bash
pnpm run create:block block1
```

```bash
pnpm shortcode block1 HeroDemo1 --build
```

```bash
pnpm shortcode block1 --build
```

```bash
MSC_BASE_URL=https://example.com/my-project/ pnpm gallery block1 --build
```

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
dist/gallery/app.js
dist/gallery/app.css
```

Another example:

```bash
pnpm shortcode testimonial HeroDemo2 --build
```

Output:

```text
dist/testimonial/testimonial.js
dist/testimonial/testimonial.css
```

The source can be a complete TSX component structure. Imports such as `@/components/...` and `@/lib/...` are supported through the Vite alias.

## Mounting

Generated shortcodes use only the `data-msc-shortcode` attribute:

```html
<div data-msc-shortcode="gallery"></div>
```

The generated JavaScript uses `querySelectorAll()` so multiple instances of the same shortcode can appear on one page.

## Create a block

Create a new block with its TSX component and isolated CSS module:

```bash
pnpm run create:block block2
```

The generator creates:

```text
src/components/blocks/block2/
├── block2.tsx
└── block2.module.css
```

If `src/src.tsx` already exists, the generator asks:

```text
Replace and delete existing src/src.tsx? [Y/n]
```

Press **Enter** to accept the default **Yes**. Type `n` or `no` to keep the existing entry.

When accepted, `src/src.tsx` becomes:

```tsx
import Block2 from "@/components/blocks/block2/block2";

export { Block2 };

export default Block2;
```

### Block CSS isolation

Every generated block uses a CSS Module:

```tsx
import styles from "./block2.module.css";
```

This means custom selectors and animation names are scoped by Vite, so CSS from `block2` cannot accidentally target elements in `block1`.

Do not put block-specific selectors in the global `src/style.css`. Keep block-specific CSS inside that block's `.module.css` file.

## Build links manifest

Each `--build` creates or updates `dist/links.json`. The newly built shortcode is placed first, while entries for other shortcode folders in `dist/` are preserved. For example:

```json
[
  {
    "shortcode": "block1",
    "js": "http://localhost/araw/reactgit/react-section/dist/block1/app.js",
    "css": "http://localhost/araw/reactgit/react-section/dist/block1/app.css",
    "script": "<script type=\"module\" src=\"http://localhost/araw/reactgit/react-section/dist/block1/app.js\"></script>",
    "stylesheet": "<link rel=\"stylesheet\" href=\"http://localhost/araw/reactgit/react-section/dist/block1/app.css\">"
  }
]
```

The base URL defaults to:

```text
http://localhost/araw/reactgit/react-section/
```

To use another base URL without changing the builder, set `MSC_BASE_URL` before building:

```bash
MSC_BASE_URL=https://example.com/my-project/ pnpm shortcode block1 --build
```
