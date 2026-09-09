# MooshieUI redesign assets

The current website follows the actual [MooshieUI Svelte app](https://github.com/Mooshieblob1/MooshieUI). The original product screenshot and logo, product copy, release logic, and guide content remain in place.

## App theme references

- `src/app.css`: Hanken Grotesk, default Mooshie yellow (#ffcc00), dark neutral ramps, mixed panel surfaces, 16px shell and 12px panel radii.
- `src/lib/utils/theme.ts`: canonical Mooshie dark theme tones.
- `src/App.svelte`: separate rounded navigation and content surfaces.
- `src/lib/components/generation/GenerateButton.svelte`: 12px button corners, accent-600 resting fill, accent-500 hover.
- `src/lib/components/generation/GenerationPage.svelte`: grouped settings and subtle panel borders.
- `src/lib/components/generation/BottomPanel.svelte`: compact navigation and active-accent treatment.

The two Hanken Grotesk font files in `static/fonts` are byte-identical to the app's self-hosted files. Their SIL Open Font License is included alongside them. Website body copy remains at least 16px and navigation targets remain suitable for touch.

SentientX informed the earlier layout, but the app's own visual language now takes precedence.

## Amber sculpture

- Site asset: `static/assets/mooshieui-amber-sculpture.webp`
- Generated using the built-in imagegen tool, with `static/assets/logo.png` as the geometry reference.
- The original logo is unchanged. This earlier artwork is retained as an asset but is no longer displayed; the hero now features the actual app screenshot.
- Source: 1254 × 1254 pixels, converted to WebP for web delivery.

### Generation prompt

Use case: stylized-concept
Asset type: One square landing-page hero artwork for MooshieUI, a friendly image-generation interface for ComfyUI, displayed around 500px wide.
Input image: The supplied logo is a shape reference only. Translate its inner connected M mark into a single physical amber-glass sculpture, without the surrounding rounded-square app-icon frame. This is decorative brand artwork.
Scene/backdrop: Seamless, near-uniform charcoal #18181b studio background and ground, subtle soft grounding shadow.
Subject and invariant geometry: Preserve the recognizable connected M silhouette from the reference. Exactly two straight vertical strokes, left and right. Two diagonal rods descend from the top left and top right nodes to meet at one center node slightly below the middle, forming a central V. Exactly five round spherical node terminals: upper left, lower left, upper right, lower right, center junction. All rods and nodes are connected as one object. Smooth rounded cylindrical rods with generous thickness.
Style/medium: Polished premium 3D studio product rendering; crisp detailed translucent amber resin/glass, convincing gentle refraction and rounded edges, beautiful but restrained warm highlights.
Composition/framing: Square 1:1 image. One centered object with generous 15 percent clear margin on every side. Very slight three-quarter view, predominantly front-facing so the M remains instantly recognizable. Entire sculpture visible.
Color palette: Only golden amber #f2b13c and #f8c869, charcoal #18181b, and soft neutral specular highlights.
Lighting/mood: Quiet refined studio lighting with soft highlights and soft shadow. The object should read clearly against the charcoal.
Constraints: No enclosing app-icon square or border. No text, typography, UI, labels, floating particles, extra rods or wire connections, other objects, neon rainbow, watermark, or duplicate mark. Do not recreate the flat yellow icon; create the amber-glass physical sculpture based on its inner geometry.
