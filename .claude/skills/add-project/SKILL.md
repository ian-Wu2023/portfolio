---
name: add-project
description: Add a new project to the portfolio site, with a card under "Other Projects", a live demo page in projects/<slug>/, a README, tests and the listing updates. Use when asked to add, showcase or publish a new project on the site.
---

# Add a project

Copy the existing projects; don't invent new patterns. Use
`projects/pong/` as the model for a project written in another language and
ported to JavaScript, and `projects/crypto-trading-bot/` for a JavaScript-only
one.

## 1. Gather the facts

Collect these from the user or their code before writing anything:
- the project name and a short folder slug;
- the languages and tools;
- what it does;
- the source code.

Describe only what the code really does. Don't add features, metrics, users
or dates that you can't point to in the code. If the user has no code yet,
say so and stop rather than writing a placeholder.

## 2. Create `projects/<slug>/`

- **Source**: the original code, in its own language.
- **Browser demo**: if the original isn't JavaScript, write a JavaScript port
  that keeps the same classes and rules, as Pong and the calculator do. Put
  the logic in an ES module (like `pong.js`) and the page wiring in `app.js`,
  so tests can import the logic without a browser.
- **`index.html`**: copy `projects/pong/index.html` and change:
  - the `<title>`, description, canonical URL and `og:` tags;
  - the chips, heading and text;
  - the "View code" link
    (`https://github.com/ian-Wu2023/portfolio/tree/main/projects/<slug>`).

  Keep the `../../` asset paths, the "Back to portfolio" header and the
  footer. Use the date chip only for work done that day.
- **`README.md`**: follow `projects/pong/README.md`, with what it is, the
  design, how to run it and how to test it. Link the live demo
  `https://ianwu.co.uk/projects/<slug>/`.

## 3. Tests

- Add `tests/<slug>.test.mjs` (with `node:test` and `node:assert/strict`)
  for the JavaScript logic. `npm test` picks it up automatically.
- If the original language has tests, add them alongside the source. Mirror
  them in the JavaScript tests, and add a job to
  `.github/workflows/tests.yml` modelled on the Python or Java job.

## 4. Add the card in `index.html`

- In the "Other Projects" grid (`<div class="grid gap-8 md:grid-cols-3"`),
  copy an existing `<article>` card.
- Set `data-tags` to values the filter buttons already use: `python`, `r`,
  `javascript`, `java` or `data`. For a language without a filter button,
  add a button next to the others with the same markup.
- Reuse the chip colour classes from existing cards.
- Set both links: "Live demo" (`projects/<slug>/`) and "View code".
- The grid has three columns, so a fourth card starts a new row. Check that
  it looks intentional at desktop width.

## 5. Update listings and styles

- Add `https://ianwu.co.uk/projects/<slug>/` to `sitemap.xml`.
- Add a row to the Projects table in `README.md`, plus the test command if
  there's a new language.
- Run `npm run build:css`. The new page's Tailwind classes need it.

## 6. Verify

Run the `check-site` skill, then look at the new page's screenshots and the
home page's at 390px and 1280px. Try the demo's main interaction in the
browser (for example, with a short Playwright script) before saying it works.
