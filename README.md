# cop-reader

## Credits & License

This is being developed by Alexander Zacherl (alexander.zacherl@googlemail.com) and I have not yet figured out how to license it.

This project uses [Tufte CSS](https://github.com/edwardtufte/tufte-css) as a foundation for its styling, which is licensed under the MIT License. Copyright (c) 2014 Dave Liepmann. See [LICENSE-TUFTE-CSS](LICENSE-TUFTE-CSS) for the full license text.

This project uses [Lucide Icons](https://lucide.dev/), which is licensed under the ISC License. Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.

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
- [x] Proper credit for https://github.com/edwardtufte/tufte-css/blob/gh-pages/LICENSE

## Features

- [x] Disclaimer & contribution guide
- [~] Responsive on any device from mobile phones to wide screen monitors
- [x] Amazing text rendering that is a pleasure to read
- [x] Table of contents in a side bar left (desktop) or menu (mobile)
- [x] Dark and light mode, following the device default (user configurable, save any changes locally)
- [x] Full support for browser-based search functions (no search provided by the web app itself)
- [ ] Any referencs to the AI Act or other legal documents provide links to the official documents on the web
- [x] Glossary at the end, all terms from the glossary are highlighted in the document itself and show their definition on-hover and (desktop) or on-tap (mobile), with a direct link to jump to the glossary
- [x] Recitals are shown in-line by default, but can also be shown just at the end of the document (user configurable, save any changes locally)
- [x] Keyboard navigation
- [~] Full screenreader support
- [ ] Full support for [WAI-ARIA](https://www.w3.org/WAI/standards-guidelines/aria/)

## Known issues & unsorted notes

- [x] Glossary hover is not visible on mobile devices
- [~] Dark mode is not working on mobile devices
- [ ] KPI boxes are too wide on tablets (<760px)
- [~] Glossary hover does not work on touch screen laptops, the "hot keys" box is accidentally removed as well (check for mouse instead?)
- [ ] Recital header numbers missing on the summary ones
- [ ] Underline for glossary item vertically too far away on small screen
- [ ] Longer lines
- [~] Collapsable shortcuts, see more ToC
- [ ] Nav items closer together
- [ ] ToC text formatting
- [ ] ToC titles too long, truncate?
- [ ] Remove the all caps formatting
- [ ] Sans serif for the nav?
- [ ] Move settings away or down or sth
- [X] Collapsable nav items?
- [ ] Collapse them by default?
- [~] Anchor links, click to copy & share!
- [X] Glossary does not work with spaces in the term
- [x] All headlines need to obey line width
- [ ] More space between list items, UL and OL
- [x] Make boxes more unique
- [x] Add characters / custom icons to boxes
- [ ] Add proper favicon
- [x] Change color of nav item to selected on click
- [~] H5 hard to recognize as such
- [ ] Use full width for text on small screens
- [x] Headlines more space before
- [x] Nav item not just color as current indicator
- [ ] Equalize distance between left and box and box and nav bar
- [ ] KPI box goes too wide
- [ ] Accessibility text color contrast check
- [x] Boxes similar styles, too different, KPI vs yellow one
- [ ] Replace emojis with icons, lucide.dev
- [ ] Style the flowcharts
- [ ] Icons for commitments and measures?
- [ ] Animation polish for recitals
- [ ] Dropdown arrow too to right side
- [ ] Recital hover smaller than the box
- [x] Key nav skips commitment 2
- [ ] Check key nav against screenreader and accessibility guidelines
- [ ] Nav item spacing polish pass
- [ ] Hamburger icon not equally spaced to top and right
- [ ] Left-align all content items better, list stands out etc right now (maybe just mobile)
- [ ] Font could be smaller on small screens, also reduce padding left and right
- [ ] Underline for glossary item vertically too far away on small screen
- [ ] Select to share feature, send snippet, plug into default sharing API
- [x] Check for and remove footnotes
- [x] Icons: Talking chairs, lawyercat
- [~] Fonts
- [ ] Colors
- [ ] Anchor icon breaks to new line on mobile
- [~] Always hide the keyboard shortcuts on mobile
- [ ] Chair signatures: break points not optimal
- [X] Headlines too short on mobile
- [x] the legal box is using our serif, but it should use the sans serif
- [ ] finish the nav visuals