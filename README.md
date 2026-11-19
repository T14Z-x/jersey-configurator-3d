# Jersey Configurator 3D (DYO Studio)

An interactive **3D WebGL Custom Sportswear & Jersey Configurator** built with **React, TypeScript, Three.js, and Tailwind CSS**. Design custom team jerseys in real time with procedural 3D garment geometry, live 2048×1024 sublimation textures, custom typography, logo placement, shareable design URLs, and a team roster & quote workflow.

## Features

- **Real-Time 3D WebGL Viewport**
  - Procedurally sculpted anatomical 3D jersey meshes supporting **Men's, Women's, and Youth** cuts.
  - Dynamic collar geometry (**Full Button Baseball, 2-Button Henley, Pro V-Neck, Crew Neck, Rugby Polo**) with 3D placket & buttons.
  - Sleeve styles (**Short, Raglan, Long, Sleeveless**) and 4 procedural fabric bump/roughness textures (**Pro Mesh, Micro Interlock, Performance Pique, Matte Poly**).
  - Smooth 360° `OrbitControls`, camera view presets (`Front`, `Back`, `Right Side`, `Left Side`, `3/4`), auto-spin, zoom controls, and 3 studio lighting backdrops.

- **Multi-Sport & Sublimation Pattern Studio**
  - Supports **Baseball, Basketball, Soccer, and Rugby** with sport-specific defaults.
  - **10 Sublimation Templates**: Classic Solid, Pro Pinstripes, Raglan Contrast, Chest Hoops, V-Chevron, Diagonal Sash, Pro Side Panels, Sublimation Fade, Geo Shatter, and Velocity Stripes.
  - **Multi-Zone Color Customizer**: 18 curated athletic swatches + full custom hex picker for Primary, Secondary, Accent/Piping, Collar/Placket, and Buttons, plus Pro Team Palettes, Swap, and Randomize.

- **Personalization & Branding**
  - **Team Name & Player Typography**: Arched, straight, and slanted lettering across 5 athletic fonts (`Oswald`, `Graduate`, `Bebas Neue`, `Pacifico`, `Inter`) with fill & outline controls.
  - **Front & Back Numbers**: Independently toggled and styled numerals.
  - **Logo Upload & Built-In Emblems**: Upload custom PNG/SVG logos or pick from built-in vector crests, placed on Left Chest, Right Chest, Center Chest, Left/Right Sleeve, or Back Locker Tag with scale & offset sliders.

- **Share, Export & Team Roster**
  - **Shareable URL Hash State**: Live `#/sport/{sport}/cut/{cut}/color/{color}/{encoded}` URLs to share exact 3D kits.
  - **Saved Locker**: Save, preview, load, and delete designs locally with 3D thumbnails.
  - **PNG Snapshot & Printable Spec Sheet**: Download high-res 3D PNGs or generate a Front + Back production spec sheet with hex color swatches and garment specs.
  - **Roster & Quote Modal**: Build a team roster (`YXS–4XL`) with tiered bulk discounts (`10+` 10% off, `25+` 20% off, `50+` 30% off) and export the roster as CSV.

## Tech Stack

- **React 18** + **TypeScript**
- **Three.js** (`WebGLRenderer`, `OrbitControls`, `BufferGeometry`, `CanvasTexture`)
- **Vite 5**
- **Tailwind CSS 3** + **Lucide React**

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type-check and build for production
npm run build
```

## Project Structure

```text
src/
├── components/
│   ├── ColorPickerRow.tsx      # Swatch grid + custom hex picker
│   ├── EditorPanel.tsx         # 6-tab customization studio sidebar
│   └── RosterQuoteModal.tsx    # Team roster builder, bulk pricing & CSV export
├── data/
│   └── presets.ts              # Sports, cuts, patterns, color swatches & SVG emblems
├── three/
│   ├── jerseyGeometry.ts       # Procedural 3D torso, sleeves, collar & buttons
│   ├── jerseyTexture.ts        # 2048x1024 sublimation CanvasTexture & fabric bump maps
│   └── JerseyStage.tsx         # Three.js scene, lighting, OrbitControls & snapshot API
├── types/
│   └── jersey.ts               # TypeScript interfaces
├── utils/
│   ├── specSheet.ts            # Printable Front/Back production spec sheet generator
│   └── urlState.ts             # URL hash state encoder/decoder
└── App.tsx                     # Main studio layout & state management
```

## License

MIT — see [LICENSE](./LICENSE).
