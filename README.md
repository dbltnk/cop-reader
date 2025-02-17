# cop-reader

## Goal:
Make the [latest draft](https://digital-strategy.ec.europa.eu/en/library/second-draft-general-purpose-ai-code-practice-published-written-independent-experts) of the EU AI Act Code of Practice more accessible and improve usability for a wide range of stakeholders on both mobile and desktop devices. 

## Development Plan:
x Convert the official PDF to HTML
x Find a good default template for accessible text rendering 
x Client-side scipting for accessibility and usability features (below)
- Host static site on GitHub pages
- Human and automated QA to prevent any differences to the official PDF
x Proper credit for https://github.com/edwardtufte/tufte-css/blob/gh-pages/LICENSE

## Features:
x Disclaimer & contribution guide
x Responsive on any device from mobile phones to wide screen monitors
x Amazing text rendering that is a pleasure to read
x Table of contents in a side bar left (desktop) or menu (mobile)
x Dark and light mode, following the device default (user configurable, save any changes locally)
x Full support for browser-based search functions (no search provided by the web app itself)
- Any referencs to the AI Act or other legal documents provide links to the official documents on the web
x Glossary at the end, all terms from the glossary are highlighted in the document itself and show their definition on-hover and (desktop) or on-tap (mobile), with a direct link to jump to the glossary
x Recitals are shown in-line by default, but can also be shown just at the end of the document (user configurable, save any changes locally)
x Keyboard navigation
- Full screenreader support
- Full support for [WAI-ARIA](https://www.w3.org/WAI/standards-guidelines/aria/)

## Credits & License

This project uses [Tufte CSS](https://github.com/edwardtufte/tufte-css) as a foundation for its styling, which is licensed under the MIT License. Copyright (c) 2014 Dave Liepmann. See [LICENSE-TUFTE-CSS](LICENSE-TUFTE-CSS) for the full license text.
