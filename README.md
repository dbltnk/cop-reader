# cop-reader

## Credits & License

This is being developed by Alexander Zacherl (alexander.zacherl@googlemail.com) and I have not yet figured out how to license it.

This project uses [Lucide Icons](https://lucide.dev/), which is licensed under the ISC License. Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.

This project uses [Source Serif 4](https://github.com/adobe-fonts/source-serif) and [Source Sans 3](https://github.com/adobe-fonts/source-sans) fonts, which are licensed under the SIL Open Font License, Version 1.1. Copyright 2014-2023 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source'.

The color system is based on [Radix Colors](https://www.radix-ui.com/colors), which is licensed under the MIT License. Copyright (c) 2022 WorkOS.

## Goal:
Make the [latest draft](https://digital-strategy.ec.europa.eu/en/library/second-draft-general-purpose-ai-code-practice-published-written-independent-experts) of the EU AI Act Code of Practice more accessible and improve usability for a wide range of stakeholders on both mobile and desktop devices. 

## Contribution Guide

This code base was quickly hacked together in a few days by an amateur, making lots of use of LLMs to write everything. It should be considered prototype quality and not a code base that can be maintained in the long run. There is too much technical debt and design debt for that. Low hanging fruits will be plucked (such as simple text changes), but more complex changes and fixes will not be considered. If you think this web app is so useful that you want it to exist for the long run, consider forking it and maintaining it yourself.

## Development Plan

- [x] Convert the official PDF to HTML
- [x] Find a good default template for accessible text rendering 
- [x] Client-side scipting for accessibility and usability features (below)
- [x] Host static site on GitHub pages
- [ ] Human and automated QA to prevent any differences to the official PDF

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

- [ ] Nav bar not perfectly styled, lines and selected
- [ ] Disable tne arrow keys UI element on mobile
- [x] Glossary hover is not visible on mobile devices
- [x] Dark mode is not working on mobile devices
- [x] KPI boxes are too wide on tablets (<760px)
- [x] Glossary hover does not work on touch screen laptops, the "hot keys" box is accidentally removed as well (check for mouse instead?)
- [x] Recital header numbers missing on the summary ones
- [x] Underline for glossary item vertically too far away on small screen
- [x] Longer lines
- [x] Nav items closer together
- [x] ToC text formatting
- [x] ToC titles too long, truncate?
- [ ] Remove the all caps formatting
- [x] Sans serif for the nav?
- [x] Move settings away or down or sth
- [ ] Collapsable nav items?
- [ ] Collapse them by default?
- [x] Anchor links, click to copy & share!
- [X] Glossary does not work with spaces in the term
- [x] All headlines need to obey line width
- [x] More space between list items, UL and OL
- [x] Make boxes more unique
- [x] Add characters / custom icons to boxes
- [ ] Add proper favicon
- [x] Change color of nav item to selected on click
- [x] H5 hard to recognize as such
- [x] Use full width for text on small screens
- [x] Headlines more space before
- [x] Nav item not just color as current indicator
- [] Equalize distance between left and box and box and nav bar
- [x] KPI box goes too wide
- [ ] Accessibility text color contrast check
- [x] Boxes similar styles, too different, KPI vs yellow one
- [x] Replace emojis with icons, lucide.dev
- [ ] Style the flowcharts
- [ ] Animation polish for recitals
- [x] Dropdown arrow too to right side
- [x] Key nav skips commitment 2
- [ ] Check key nav against screenreader and accessibility guidelines
- [x] Nav item spacing polish pass
- [x] Hamburger icon not equally spaced to top and right
- [x] Left-align all content items better, list stands out etc right now (maybe just mobile)
- [x] Font could be smaller on small screens, also reduce padding left and right
- [x] Underline for glossary item vertically too far away on small screen
- [x] Check for and remove footnotes
- [x] Icons: Talking chairs, lawyercat
- [~] Fonts
- [~] Colors
- [x] Anchor icon breaks to new line on mobile
- [X] Headlines too short on mobile
- [x] the legal box is using our serif, but it should use the sans serif