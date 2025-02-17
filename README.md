# cop-reader

## Goal:
Make the [latest draft](https://digital-strategy.ec.europa.eu/en/library/second-draft-general-purpose-ai-code-practice-published-written-independent-experts) of the EU AI Act Code of Practice more accessible and improve usability for a wide range of stakeholders on both mobile and desktop devices. 

## Development Plan:
- Convert the official PDF to HTML
- Find a good default template for accessible text rendering 
- Client-side scipting for accessibility and usability features (below)
- Host static site on GitHub pages

## Features:
- Disclaimer & contribution guide
- Responsive on any device from mobile phones to wide screen monitors
- Amazing text rendering that is a pleasure to read
- Table of contents in a side bar left (desktop) or menu (mobile)
- Dark and light mode, following the device default (user configurable, save any changes locally)
- Full support for browser-based search functions (no search provided by the web app itself)
- Any referencs to the AI Act or other legal documents provide links to the official documents on the web
- Glossary at the end, all terms from the glossary are highlighted in the document itself and show their definition on-hover and (desktop) or on-tap (mobile), with a direct link to jump to the glossary
- Recitals are shown in-line by default, but can also be shown just at the end of the document (user configurable, save any changes locally)
- Keyboard navigation
- Full screenreader support
- Full support for [WAI-ARIA](https://www.w3.org/WAI/standards-guidelines/aria/)
