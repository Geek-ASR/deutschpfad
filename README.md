# Deutschpfad

A free German-language learning website for international students —
vocabulary, grammar, stories, history, geography, and real-life German, built
as a static site with **zero recurring infrastructure cost**.

No signup. No login. No payment. No backend. No database. No API keys.
Progress is stored only in the learner's browser (`localStorage`), with
export/import to move it between devices.

## Status

This project was built in incremental phases (see `docs/roadmap.md`), and
**all six are now done**: the design system and site structure; the lesson,
vocabulary, and quiz engines (`lessons/a1-numbers.html`); local progress
tracking with spaced review (`dashboard.html`); an interactive story
reader, a German history timeline, and a Germany facts explorer; a
real-life conversation scenario, audio-first listening practice, and a
Pronunciation Lab (all linked from `explore.html`); and a Phase 6 polish
pass that audited the whole site and fixed what it found — two real
heading-hierarchy skips, a cross-page CSS bug leaving some pages with
unstyled buttons, seven pages missing Open Graph tags, and eight pages
that went silently blank without JavaScript. Details in the roadmap.

The six phases built the engine; populating the curriculum with it was
the first pass tracked unit by unit in `docs/roadmap.md`, and all
twelve originally-planned A1 topic units are live: Greetings,
Introducing Yourself, Numbers, Family, Colors, Days/Months/Seasons,
Time, Food, Drinks, Home, Animals, and Daily Life
(`lessons/a1-greetings.html`, `lessons/a1-introductions.html`,
`lessons/a1-numbers.html` — built first, out of sequence, as the
engine's reference lesson — `lessons/a1-family.html`,
`lessons/a1-colors.html`, `lessons/a1-calendar.html`,
`lessons/a1-time.html`, `lessons/a1-food.html`,
`lessons/a1-drinks.html`, `lessons/a1-home.html`,
`lessons/a1-animals.html`, `lessons/a1-daily-life.html`) — alongside
one story, one scenario, one listening set, and the Pronunciation Lab.

Those twelve units cover the curriculum's *topics*, but not enough
*volume* to pass a real A1 exam — roughly 200 vocabulary items against
the ~600–650 words the Goethe-Institut's official A1 word list expects,
plus real grammar gaps (modal verbs, past tense, pronoun cases,
negation) the topic units never touched. An **A1 exam-readiness
expansion** closed that gap in four parts, and **all four are now
done**:

1. **Four new grammar units** — Questions & Negation
   (`lessons/a1-questions-negation.html`), Pronouns & Cases
   (`lessons/a1-pronouns-cases.html`), Modal Verbs
   (`lessons/a1-modal-verbs.html`), and Perfekt/past tense
   (`lessons/a1-perfekt.html`) — closing the site's biggest grammar
   gaps with the same picker/quiz engines used throughout, no new
   code required.
2. **A vocabulary-expansion pass** across all twelve topic units,
   taking their vocabulary from roughly 200 items to 429 (481
   counting the grammar units), each unit roughly doubling its
   vocabulary and quiz depth. Numbers, Calendar, and Animals are
   worth noting specifically: each has a category that's deliberately
   already complete (cardinal numbers; the fixed 7 days/12 months/4
   seasons; the 7 German plural-formation patterns), so their
   expansions added genuinely new adjacent content instead of padding
   an already-finished list — ordinal numbers (a real addition to
   `js/number-words-de.js`), relative time vocabulary, and more
   animals reinforcing the same 7 plural patterns.
3. **A vocabulary bank** (`vocabulary.html`) — the full A1 word list
   in one searchable page, filterable by topic, with flashcards
   (front/back reveal, either direction, audio, shuffle), a
   browse-list view, and a "Quiz me" mode that generates a typing quiz
   from whatever's currently filtered. It also carries **six topic
   areas no unit covers** but every A1 exam expects — weather,
   clothing, transport & directions, body & health, shopping & money,
   professions (25 words each) — taking the vocabulary total from 481
   to **631**, into the Goethe-Institut's ~600–650-word A1 range.
4. **A1 mock exams** (`mock-exam.html`) — two full, timed practice
   sittings in the real Goethe/telc "Start Deutsch 1" format (Hören,
   Lesen, Schreiben, Sprechen), picked from a dropdown, built only from
   vocabulary and grammar the units and the vocabulary bank already
   cover (exam 2 leans on the six extra topic areas so it isn't a
   rerun). Hören, Lesen, and Schreiben's form-fill task are auto-graded
   through a new engine (`js/exam-engine.js`) built specifically for
   exam conditions — no feedback until a section ends, plus a countdown
   — sharing all its actual question rendering with the lesson quiz
   engine rather than duplicating it. Schreiben's open writing and the
   whole Sprechen module can't be honestly auto-graded without a
   backend or a person, so both are self-check practice instead (a
   model answer to compare against; real speaking prompts to try out
   loud).

Quiz results from the vocabulary bank and the mock exams all feed the
same local spaced-review schedule lesson quizzes do, so anything
tested in either place shows up on the dashboard's review queue too.
Full plan and reasoning in `docs/roadmap.md`'s "A1 exam-readiness
expansion" section.

**A2 has now begun.** The lesson/quiz engines carry over unchanged, so
an A2 unit is pure content in the same shapes. Thirty units are live:
**Präteritum (Simple Past)** — the written past tense plus the spoken
Präteritum for sein/haben/modals; **Comparatives & Superlatives** —
bigger, better, best, plus `so … wie`; **Two-Way Prepositions** —
`in/an/auf/…` with the Dativ (location) vs. Akkusativ (movement)
rule; **Subordinate Clauses** — the verb-to-the-end word order after
`weil`/`dass`/`wenn`, with the `denn` and `deshalb` traps; and
**Reflexive Verbs** — the
`mich/dich/sich` pronoun set and accusative-vs-dative; and
**Dative-only Prepositions** —
`mit/nach/zu/von/bei/seit/aus/gegenüber`, which always take the
Dativ, plus the fused forms `zum/zur/vom/beim`; and **Travel &
Holidays** (`lessons/a2-travel-holidays.html`) — the first A2 topic
unit: the Perfekt with `sein` for movement verbs, separable travel
verbs (`abgeflogen`, `angekommen`, `umgestiegen`), and `nach` vs.
`in die` for destinations; and **City Life & Getting Around**
(`lessons/a2-city-life.html`) — the imperative (`Sie` / `du` / `ihr`)
for directions, separable verbs in commands, polite indirect
questions, and ordinals for streets and floors; and **Health & the
Body** (`lessons/a2-health-body.html`) — `weh tun` + Dativ, the
plural `-schmerzen` nouns, and `sollte` for advice; and **The
Genitiv** (`lessons/a2-genitiv.html`) — the fourth case (`des`/`der`,
the `-s`/`-es` ending) and the prepositions `wegen` / `während` /
`trotz` / `(an)statt`, with the spoken `von`-Dativ shortcut; and
**Work & Job-Hunting** (`lessons/a2-work.html`) — `als` + profession
and `werden` + profession (both article-less), the Perfekt for a CV,
and reflexive `sich bewerben um` / `bei`; and **Adjective Endings
after der/die/das** (`lessons/a2-adjective-endings.html`) — the weak
declension, `-e` in five slots and `-en` everywhere else, across all
four cases; and **The Konjunktiv II** (`lessons/a2-konjunktiv-2.html`)
— `würde` + infinitive and the short forms `wäre` / `hätte` /
`könnte` / `dürfte` / `müsste`, for polite requests and wishes; and
**Adjective Endings after ein/kein/mein**
(`lessons/a2-adjective-endings-ein.html`) — the mixed declension:
the weak set from Unit 12 plus `-er` / `-es` in the three slots where
`ein` has no ending; and **The Passive & the Amt**
(`lessons/a2-passive-amt.html`) — the present passive with `werden` +
past participle, `man` as the active alternative, modal + passive,
and the vocabulary for German public offices; and **Adjective
Endings with No Article** (`lessons/a2-adjective-endings-none.html`)
— the strong declension, the last of the three: with no article the
adjective takes the ending `der/die/das` would have carried; and
**Relative Clauses** (`lessons/a2-relative-clauses.html`) — the
relative pronouns (the article table plus `denen` and
`dessen`/`deren`), gender/number from the antecedent and case from
the clause, prepositions before the pronoun, and `was`/`wo`; and
**`zu` + Infinitive Clauses** (`lessons/a2-zu-infinitive.html`) —
`zu` + infinitive after trigger verbs and `es ist …`, `zu` inside
separable verbs, no `zu` after modals, and `um` / `ohne` / `statt …
zu`; and **The n-Declension** (`lessons/a2-n-declension.html`) — the
weak masculine nouns (`der Junge`, `der Kunde`, `der Student`, `der
Herr`, `der Name`) that add `-n`/`-en` in every case but the
nominative singular; and **Verbs with Fixed Prepositions**
(`lessons/a2-verbs-prepositions.html`) — `warten auf`, `denken an`,
`Angst haben vor` and friends, plus the `da-`/`wo-` compounds
(`darauf`, `worüber`) and why people are different; and **Temporal
Clauses** (`lessons/a2-temporal-clauses.html`) — the time
conjunctions `bevor` / `nachdem` / `während` / `bis` / `seitdem` /
`sobald` / `solange` (verb to the end), and `als` vs. `wenn`; and **Two-Part Connectors & Adjectival Nouns**
(`lessons/a2-connectors-adjectival-nouns.html`) — `entweder…oder`,
`weder…noch`, `sowohl…als auch`, `nicht nur…sondern auch`, `je…desto`,
and adjectives used as nouns (`der Deutsche`, `etwas Neues`). The
first Phase 2 topic units are also live: **Housing & Flat-Hunting**
(`lessons/a2-housing.html`) — 28 words for renting a flat and
decoding a German rental ad — and **Media & Internet**
(`lessons/a2-media-internet.html`) — 28 words for phones, apps and
the internet — **Education & Studying**
(`lessons/a2-education.html`) — 28 words for university life, plus
`studieren` vs. `lernen` — **Feelings & Relationships**
(`lessons/a2-feelings-relationships.html`) — 28 words for emotions
and relationships — **Environment & Recycling**
(`lessons/a2-environment.html`) — 28 words for the environment,
including a decoder for the German household-bin system — **Celebrations & Invitations** (`lessons/a2-celebrations.html`) — 28
words for parties, invitations and German holidays — **Eating
Out** (`lessons/a2-eating-out.html`) — 28 words for a whole meal in a
restaurant — and **Money & Banking**
(`lessons/a2-money-banking.html`) — 28 words for a German bank
account, transfers, and returning a purchase. The
dashboard's estimated-level meter was made A1-specific so finishing
an A2 unit doesn't push it past 100%. A vocabulary-expansion pass
then enlarged eight of the grammar units that were carrying
topic-sized word lists underweight, bringing A2-specific vocabulary
to ~630 (site total ~1,260). Two full A2 mock exams (`mock-exam.html`, in the Goethe/telc
"Start Deutsch 2" format) round it off — the page now offers all
four A1/A2 exams from one dropdown. A short polish pass then added an
A2 story (**"Die Wohnungssuche"**, `stories/a2-die-wohnungssuche.html`)
and an A2 scenario (**"Beim Arzt"**, `scenarios/beim-arzt.html`) to
match the A1 pair, and replaced the `deutschpfad.example` placeholder
in every canonical tag, the sitemap, and `robots.txt` with the live
`https://geek-asr.github.io/deutschpfad/` URL. The dashboard
"Estimated level" meter is now per-level: an A1 bar plus an A2 bar
that unlocks once A1 is finished. See `docs/roadmap.md`'s
"A2 curriculum buildout" section for detail.

**B1 has started.** Unit 1, **The Konjunktiv II**
(`lessons/b1-konjunktiv-2.html`), is live — the full present + past
Konjunktiv II, unreal conditionals, `als ob`, and `beinahe` + K II,
with 28 vocabulary items and a 16-question quiz. The planned B1 shape
(a grammar backbone, ~13 topic units, a story, a scenario, and two
*Zertifikat B1* mock exams) is in `docs/roadmap.md`'s "B1 curriculum
buildout" section.

## Stack

Plain HTML, CSS, and JavaScript (ES modules) — no framework, no build step,
no bundler. This is a deliberate choice: it keeps the site fast, inspectable,
accessible, and trivially deployable on GitHub Pages. See
`docs/architecture.md` for the reasoning.

## Project structure

```
/               top-level pages (index.html, levels.html, about.html, …)
/lessons        one page per lesson    /stories   one page per story
/scenarios      one page per scenario  (A1 + A2 so far; more to come)
/css            design tokens + stylesheets (no CSS framework)
/js             site chrome and feature engines (ES modules)
/data           structured content (JSON) — vocabulary, lessons, etc.
/assets         SVGs and other static assets
/docs           architecture, curriculum, and content documentation
```

See `docs/content-model.md` for how content data is structured and
`docs/architecture.md` for how the pieces fit together.

## Running locally

No build step — just serve the folder statically. For example:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static file server works (`npx serve`, VS Code's Live Server, etc.).

## Deploying

The site is plain static files, so GitHub Pages needs no build step:

1. Push this repository to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment", choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then save.

The site will be published at `https://<username>.github.io/<repo>/`.

## License

Code is MIT-licensed (`LICENSE`). Educational content has its own license —
see `CONTENT-LICENSE.md`.

## Contributing

See `docs/contributing.md`.
