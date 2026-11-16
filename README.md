# Unravel: The Brain Lab

Build the "Unravel" Alzheimer's & Dementia university research simulation web app for UK A-level students, importing and redesigning the project from https://github.com/giuliotaggart-star/alzheimers-explorer using the attached seaad-mtg.json dataset.

Keep all scientific text, numbers, donor metrics, case study questions, and poll data exactly as defined in seaad-mtg.json (the user and Claude Code author the copy and data; Lovable owns the visual design, layout, color palette, formatting, and interactive smoothness).

Key Design & UX Requirements from the User:
1. Color Palette:
- Move away from the pitch-dark gloomy theme.
- Create a clean, bright, modern academic feel: soft warm alabaster/light background (#FBFBFA or #F8FAFC), crisp white cards with subtle borders (#E2E8F0) and gentle shadows, deep slate/navy typography (#0F172A) for high readability, and retain the signature coral (#E15B50) and periwinkle (#6366F1) for active states, cell-type accents, and data markers.

2. Typography:
- Keep the friendly personality for the "UNRAVEL" hero title/brand.
- Upgrade all other section titles, headings, and cards to an elegant, refined typeface (Plus Jakarta Sans and clean editorial headings) so it looks credible, prestigious, and welcoming to teachers, parents, and UCAS reviewers rather than cartoony.

3. Fix Thread & Knots (No Text Overlap):
- Eliminate the laggy, full-page continuous SVG thread and moving dot that caused text collisions and jank on scroll.
- Replace it with clean section flow, smooth progress indicators, and crisp visual anchors.
- For the "Unravel" concept, create a clean interactive SVG knot button that smoothly unties/straightens into an inline callout or expands neatly without hijacking the viewport or overlapping surrounding text.

4. Clear Sectioning (No Endless Janky Scroll):
- Section the experience into clear, beautifully formatted chapters:
  - 01 Title & Mission
  - 02 Dementia Poll (6 interactive statements, instant feedback, scoring breakdown)
  - 03 Myth Busting / What Dementia Is (Dementia vs Alzheimer's, Tau & Amyloid, Brain Cell Types, Single-Cell Resolution with the clean unravel knot)
  - 04 Where Data Comes From (5-step donor journey explainer)
  - 05 The Lab (The core investigation experience)
  - 06 Explore (Interactive query builder: metric x pathology x cell type with live donor dot plots)
  - 07 Further (UCAS, £50 Essay Prize, Teachers guide)

5. The Lab Overhaul (Easy, Medium, Difficult):
- Reorganize the 3 investigations into progressive difficulty levels:
  - Level 1: Easy / Guided (Neurons that calm the network - SST inhibitory neurons)
  - Level 2: Medium / Intermediate (The brain's immune cells - Microglia & TREM2)
  - Level 3: Difficult / Advanced (Neurons that link brain areas - Deep layer projection neurons)
- Present these as 3 distinct, beautiful selector cards at the top of the Lab.
- When the student clicks one, that card highlights cleanly, and the dedicated 5-step lab workflow opens smoothly underneath:
  1. Introduction & Background
  2. Aims & Hypotheses (student commits to predicting directional change)
  3. Methods (donor cohort, sample sizes, SEA-AD MTG protocol)
  4. Results (Interactive dot plot of real donor data points, median lines, IQR, and statistical summary)
  5. Discussion & Confounders (Stratify by age band, sex, APOE4, and draw conclusions)

6. Responsive & Polish:
- Fully responsive across desktop, tablet, and mobile.
- Fast, accessible, smooth animations (Framer Motion / Tailwind).
- Ensure all charts (dot plots per donor with medians) render clearly with tooltip inspection for individual donor dots.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ec3ea63e-a5d0-4930-bac1-e963f8816ca8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
