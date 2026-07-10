# Product

## Register

product

## Platform

web

## Users

Church media volunteers preparing a service in advance — typically the night before or on a Sunday morning, at home or in the media room, with enough time to get the result right rather than merely acceptable. They are not designers and not necessarily technical, but they are careful: the output goes on a screen in front of a congregation, so a wrong verse or a clipped line is a visible mistake.

Their job is to turn a scripture reference into finished image assets and get those assets into the software that will actually display them. The tool's output lands in **ProPresenter** (full-slide images and transparent lower-third overlays) and in **OBS / vMix** for livestream overlays. Filenames and ordering therefore matter as much as the pixels, because the next step is always an import into another program.

## Product Purpose

Turn a Tamil scripture reference into ready-to-project images. Two output formats: a full 16:9 slide, and a transparent lower-third overlay sized for a 1920×1080 frame. A companion Unicode ↔ Bamini converter handles the legacy Tamil encodings that older church presentation setups still require.

Success is a volunteer going from "Psalms 119:1-30" to a correctly named, correctly ordered set of PNGs in their presentation software, without having to think about the tool.

## Positioning

The one tool that renders Tamil scripture in the legacy encodings church presentation software still expects, and hands back assets already named for the import.

## Brand Personality

Warm and approachable, without being soft or decorative. The tool is used by volunteers, not operators — it should explain itself, name things in plain language, and never punish a wrong click. Warmth is carried by generous spacing, a warm accent, and helpful copy, never by ornament.

Its voice is a calm colleague: it tells you what will happen before it happens, and what went wrong in terms of what to do next.

## Anti-references

- **Generic AI SaaS.** Gradient heroes, glassmorphism, identical rounded cards in a grid, purple-to-blue everything.
- **Churchy clip-art warmth.** Sunbeam stock photography, script faces, dove iconography, beige-and-gold parchment surfaces. The subject is sacred; the tool is not.
- **Sterile enterprise admin.** Grey tables, default form controls, dead-flat surfaces, no hierarchy.
- **Overdesigned and animation-heavy.** Scroll-jacking, decorative motion, flourish for its own sake.

Corollary, since two of these pull against "warm": warmth must never be expressed as a cream, sand, beige, or parchment background. The surface stays neutral; the brand colors and the spacing carry the warmth.

## Design Principles

- **The flow is the interface.** A volunteer should be able to read the page top to bottom and know what to do next without being told. Order the screen by the order of the work: format, then passage, then export.
- **Show the artifact, not a description of it.** Choices that change the output are previewed as the output. A transparent overlay is shown over a transparency backdrop, never over white.
- **Name things for where they are going.** The export is not a file, it is an import into ProPresenter. Filenames, ordering, and formats are part of the product, not an afterthought.
- **Never punish a wrong click.** Every destructive or lossy action is reversible or confirmable. Errors say what to do next, not what the parser rejected.
- **Earned familiarity.** Standard affordances behave in standard ways. Nothing is reinvented for flavor; the tool disappears into the task.

## Accessibility & Inclusion

WCAG 2.1 AA. Body text meets 4.5:1 against its background and placeholder text is held to the same bar, not the muted-grey default. Every custom control (combobox, slider, tabs, segmented choice, toast) carries correct roles, keyboard operation, and a visible focus ring. All motion has a `prefers-reduced-motion: reduce` alternative. Color is never the sole carrier of state — selection and error are also marked by shape, icon, or text.
