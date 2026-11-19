# T14Z Studio — Roadmap & Milestones

Legend: ✅ done · 🔲 planned

## Milestone 1 — Quick Wins (smoothness & robustness)
- ✅ Debounce sublimation texture redraws so sliders/color pickers don't lag
- ✅ Code-split Three.js (lazy-load the 3D stage) and add vendor chunking
- ✅ Loading skeleton while the 3D stage loads
- ✅ WebGL-unsupported fallback message
- ✅ Dynamic price that reflects fabric, sleeve, and logo options
- ✅ Responsive layout (stacked layout on tablets/phones)
- ✅ Move front number up so it no longer sits too low on the chest

## Milestone 2 — UI/UX Redesign
- 🔲 Step-by-step wizard flow (Style → Colour → Design → Text → Logos → Review)
- 🔲 Sticky bottom bar with live price and "Get Quote" CTA
- 🔲 Named colour swatches with labels and recently-used colours
- 🔲 Pattern thumbnails rendered from the real 3D model
- 🔲 Mobile bottom-sheet editor with swipe gestures
- 🔲 First-visit onboarding tooltips

## Milestone 3 — 3D Realism
- 🔲 Replace procedural mesh with a real `.glb` jersey model with proper UV panels
- 🔲 Fix pinstripe pinching at shoulders/neck (panel-based UVs)
- 🔲 Seamless sleeve/armhole blending; proper collar geometry
- 🔲 Stitching/seam normal maps and cloth folds
- 🔲 HDRI environment lighting + soft shadows

## Milestone 4 — Interactive Editing
- 🔲 Click a jersey zone (sleeve, collar, body) to recolour it (raycasting)
- 🔲 Drag/resize/rotate logos and text directly on the model with snap guides
- 🔲 Per-panel pattern assignment

## Milestone 5 — Sharing & Backend
- 🔲 Short share links (`?d=ab12cd`) instead of the long Base64 hash
- 🔲 Optional backend to persist designs and quote submissions
- 🔲 Export print-ready flat pattern PDF

## Milestone 6 — Code Quality
- 🔲 Split `EditorPanel.tsx` (1100+ lines) into per-tab components
- 🔲 Vitest unit tests (URL state, pricing, roster)
- 🔲 CI (type-check + build) via GitHub Actions
- ✅ Visual QA of Back view, Women's/Youth cuts, Polo collar, Roster modal and mobile (screenshots in docs/qa, script in scripts/qa-shots.sh)
- ✅ Fixed camera clipping through the jersey on view changes (orbit transitions) and the dark viewer-left sleeve (winding)
