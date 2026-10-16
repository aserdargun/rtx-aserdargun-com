# Local verification — RTX Spark Atlas

Date: 2026-10-16. Scope: the user-authorized detailed representative N1X 128 GB model and bilingual application. This is local evidence, not a public deployment or physical-hardware validation.

## Build and assets

- Blender **5.1.1** generated the native scene, raw GLB, part manifest and poster successfully.
- glTF Transform output: **6,446,428 bytes**, **122 meshes**, **15 materials**. Khronos validator: **0 errors, 0 warnings**. See [model-validation.json](model-validation.json).
- Manifest: **46 distinct selectable parts**. Export has 49 part-tagged nodes because two display mounts and one connecting group reuse semantic IDs. These are not 49 distinct chip components.
- **4/4 Node tests passed**: selected configuration / actual CUDA-marker geometry; bilingual part-to-GLB coverage; published memory-partition cases; decimal-GB calculations.
- TypeScript and Vite production build passed. Vite reports the Three.js chunk above 500 kB: about **640 kB raw / 160 kB gzip**. The warning is retained. The GLB is about 6.45 MB; native `.blend` is a separate optional download.
- Fourteen source URLs returned HTTP 200. [HTTP checks](source-http-checks.json) establish reachability only; the research reports contain the content evidence.

## Browser paths exercised

Used the Codex in-app browser against development `127.0.0.1:4317` and the built production bundle at `127.0.0.1:4318`.

| Path | Observed result |
|---|---|
| Load production explorer | Model reports `ready`; live WebGL scene renders. |
| Select memory by clicking its 3D geometry | Memory chapter and `128 GB · LPDDR5X` selection appear. |
| Select CPU core 8 | `Cortex-X925 · 8` is selected; its bilingual description appears; focus zooms to the core group. |
| Top / assembled / exploded views | Camera and separated geometry visibly change; reset restores overview. |
| Separation slider with keyboard | End sets separation to 1 and selects exploded view. |
| Section isolation | Only selected memory-category objects remain visible. |
| Labels | Off removes all text geometry after semantic-label export fix; on restores it. |
| AI inference at 2× | Playback starts with CPU input and advances through the scenario; geometry/path and caption are visible. |
| Graphics scenario, manual step, pause | GPU/RT step appears; pause retains the path and caption. Manual step does not start automatic playback. |
| Guided tour | Start displays chapter 1/8; Next displays CPU chapter 2/8; close removes tour controls. |
| English and Turkish | Navigation, chapters, controls and descriptions switch; English survives reload. |
| Memory carveout keyboard input | 8 GB carveout displays 96 GB shared, 24 GB CPU-only and 104 GB GPU-visible. |
| Transfer calculator | 128 GB, 100% utilization displays 0.427 seconds at 300 GB/s. |
| Weight calculator | 70 billion parameters at 16 bits displays 140 GB. |
| Tensor example | Advance shows partial accumulation 3 after the second term. |
| RT example | Three advances light all four conceptual stages. |
| Sources and GLB download | Fourteen references and representation boundary visible; GLB downloads successfully. |
| PNG export | Production PNG download succeeds after switching from a data URL to a Blob URL. |
| Chapter / tab navigation | New chapter starts at top; changing inspector category resets its own scroll. |

No errors or warnings were recorded in the fresh production-preview tab during these checks. An earlier development-tab warning about removed `PCFSoftShadowMap` was fixed by using `PCFShadowMap`; that old timestamp remains in the historical development log.

## Responsive and visual review

Desktop **1536 × 1024**, phone **390 × 844**, narrow view **320 × 800** were exercised. Root scroll width did not exceed document client width after the fixes (the narrow view's scrollbar reduces usable width to 305 px). The component rail deliberately scrolls horizontally within its own container. Mobile places controls immediately after the model, with the readable inspector below. Camera controls move into a horizontal strip above the model to avoid covering the GPU.

Retained screenshots:

- [Desktop explorer](explorer-desktop.jpg)
- [Mobile explorer](explorer-mobile.jpg)
- [Exploded animation](exploded-animation.jpg)

The final desktop screenshot and [architecture concept](../design/architecture-concept.png) were opened together with `view_image` for visual comparison. The concept is a design reference, not claimed user sign-off.

| Fidelity point | Reference → delivered result |
|---|---|
| Overall hierarchy | Header, title band, component rail, central 3D view, right inspector, toolbar, metrics and footer retained. |
| Geometry of layout | Flat three-column explorer retained; 228 px rail and 330 px inspector leave more room for an interactive canvas. |
| Color | Graphite background, acid-green active states and cyan interconnect accents retained; original procedural material colors replace image-generated surface textures. |
| Typography | Large compact sans-serif headings and monospaced indices retained; self-hosted Inter / JetBrains Mono. Inspector text is smaller to accommodate part controls and citations. |
| Main visual | Original Blender meshes replace the concept illustration. CPU count is 20; CUDA marker count is 6,144; S/G functional organization is source-grounded. No photorealistic or dimensional equivalence is claimed. |
| Navigation and controls | Eight chapter entries and three camera views retained; functional focus, labels, isolate, export, speed and scenario controls added. |
| Metrics | 300 GB/s, 256 bit and FP4 peak retained; documented 600 GB/s C2C announcement added as a fourth metric. |
| Mobile | Concept's desktop columns become a horizontal chapter rail, model, controls and inspector; no miniature desktop layout. |

## Above-fold copy deviations

All deviations support the detailed representative scope:

- The overview explicitly says **same physical memory pool** to avoid implying identical allocation budgets.
- “Gerçek mimariyi keşfet” becomes **“Mimariyi keşfet”**; no exact physical reconstruction is promised.
- The inspector's lower introduction becomes **“46 bileşeni seç, işlevini öğren, veri yolculuğunu izle.”**
- **“600 GB/sn · NVLink-C2C · duyurulan”** is added, keeping announcement and memory bandwidth distinct.
- N1X stage index, interaction hint, scenario selector, speed, step controls and source links are added for working interaction.
- The footer adds **“Temsili eğitim modeli”**. The original “Fiziksel ölçekte değil” stage caption remains.

## Limits

No real N1X device, sustained bandwidth or application-performance benchmark was tested. No exact physical geometry, SM topology or memory-package arrangement is claimed. The WebGL error fallback and reduced-motion behavior are implemented but were not separately failure-injected or emulated in this browser session. Phone sizes were desktop-browser viewport tests, not physical iOS/Android acceptance. Public DNS, TLS, hosting, deployed assets and the `aserdargun.com` inbound link remain outside this completed local build.
