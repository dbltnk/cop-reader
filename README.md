# cop-reader

This little web site's goal is to make the [latest draft](https://digital-strategy.ec.europa.eu/en/library/second-draft-general-purpose-ai-code-practice-published-written-independent-experts) of the EU AI Act Code of Practice more accessible and improve usability for a wide range of stakeholders on both mobile and desktop devices. 

## Credits & License

This is being developed by Alexander Zacherl (alexander.zacherl@googlemail.com) and I have not yet figured out how to license it.

This project uses [Lucide Icons](https://lucide.dev/), which is licensed under the ISC License. Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.

This project uses [Source Serif 4](https://github.com/adobe-fonts/source-serif) and [Source Sans 3](https://github.com/adobe-fonts/source-sans) fonts, which are licensed under the SIL Open Font License, Version 1.1. Copyright 2014-2023 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source'.

The color system is based on [Radix Colors](https://www.radix-ui.com/colors), which is licensed under the MIT License. Copyright (c) 2022 WorkOS.

## Contribution Guide

This project welcomes contributions! Here's how you can help:

1. **Report Issues**: Found a bug or have a suggestion? Open an issue on GitHub.
2. **Submit Pull Requests**: Feel free to submit PRs for any improvements.
   - For text changes and simple fixes
   - For feature additions and major changes
   - Please discuss larger changes in an issue first

Note: This is a simple web abb built quickly by an amateur with most code written by LLMs. While I welcome all contributions, be aware there is some technical debt and some design debt. If you want to maintain a long-term version, consider forking the repo and doing a full refactor.

## Development Plan

- [x] Convert the official PDF to HTML
- [x] Find a good default template for accessible text rendering 
- [x] Client-side scipting for accessibility and usability features (below)
- [x] Host static site on GitHub pages
- [ ] Human and automated QA to prevent any differences to the official PDF
- [ ] Figure out more long term hosting solution and domain

## Features

- [x] Disclaimer & contribution guide
- [x] Responsive on any device from mobile phones to wide screen monitors
- [x] Amazing text rendering that is a pleasure to read
- [x] Table of contents in a side bar left (desktop) or menu (mobile)
- [x] Dark and light mode, following the device default (user configurable, save any changes locally)
- [x] Full support for browser-based search functions (no search provided by the web app itself)
- [ ] Any referencs to the AI Act or other legal documents provide links to the official documents on the web
- [x] Glossary at the end, all terms from the glossary are highlighted in the document itself and show their definition on-hover and (desktop) or on-tap (mobile), with a direct link to jump to the glossary
- [x] Recitals are shown in-line by default, but can also be shown just at the end of the document (user configurable, save any changes locally)
- [x] Keyboard navigation
- [~] Full screenreader support
- [~] Full support for [WAI-ARIA](https://www.w3.org/WAI/standards-guidelines/aria/)

## Known issues & unsorted notes

- [ ] Explanation box headline can overap with chevron, on mobile (probably others as well)
- [ ] Glossary summary numbers slightly below headers
- [ ] Buttons in nav are not fully visible on mobile, 2nd line cut off
- [ ] Nav bar not perfectly styled, lines and selected
- [ ] Disable tne arrow keys UI element on mobile
- [ ] Remove the all caps formatting
- [ ] Collapsable nav items?
- [ ] Collapse them by default?
- [ ] Add proper favicon
- [ ] Accessibility text color contrast check
- [ ] Style the flowcharts
- [ ] Animation polish for recitals
- [ ] Check key nav against screenreader and accessibility guidelines
- [ ] Finalize fonts
- [ ] Finalize colors