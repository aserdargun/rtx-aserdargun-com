# Spark Atlas design specification

**Active representative scope, 2026-10-16:** the user explicitly accepted a very detailed representative model. Exact physical geometry is no longer a release gate. Preserve documented functions and counts; disclose illustrative layout, materials, routing and depth. No manufacturing-accurate claim.

Final reference: architecture-concept.png, 1536 × 1024. Initial explorer-concept.png is superseded because the user requires architectural fidelity. The model follows the official S-die / G-die functional diagram, not the invented package in the initial concept.

Graphite #101412 background, #191e1b rails, #edf1ea foreground, #a4afa8 secondary text, acid green #b6ed64, cyan #67cedb CPU/interconnect, warm metal edges. Sans-serif UI with monospaced labels and numerical indices. Header 64px, title band 86px. Desktop: 218px component rail, flexible 3D canvas, 310px inspector. Flat bands and thin rules; no nested card layout. Use 40px title, 32px inspector title, 14px controls, 13px secondary text. Slightly rounded 6px controls. Lucide line icons.

Primary surface: Explorer with selectable components, local inspector, assembled/exploded/top view, animation playback, speed, separation and camera controls. Architecture and Sources are necessary additional readable views for the user's detailed bilingual learning requirement. All descriptions available in English and Turkish. Technical block names remain as in NVIDIA's diagram. Mobile: horizontal component scroller, 3D canvas, controls then readable inspector; no clipped desktop columns.

Allowed initial visible copy matches the final image. Intentional additions for accuracy and interaction: 128 GB selected configuration, status/loading/errors, mouse/touch help, animation selector/speed/steps, component sub-selection, documentation links. Physical memory-package counts and die sizes remain unknown. Add original schematic surface detail, logical CUDA markers, and separate Tensor/RT teaching regions; all routing and depth remain illustrative. Extra controls use the existing line-button style.

The concept is an implementation reference selected during autonomous work, not an assertion of user sign-off. Imagegen built-in used; final prompt preserves the first UI and replaces the central model with an extrusion of NVIDIA's official functional diagram.

## Required functional extensions

Architecture view includes a synchronized chapter rail, detailed prose, a memory-capacity calculator, bandwidth arithmetic and model-weight calculator. Sources view lists primary NVIDIA references and explicitly distinguishes documented data from illustrative geometry. Explorer retains the concept's flat three-column design, including 20 selectable CPU cores, GPU subfunctions, labels, focus/isolate, three animation scenarios, manual steps, and a guided chapter tour. These are intentional functional extensions of the original concept, authorized by the request for very detailed representative learning. The concept is a design reference, not user sign-off.
