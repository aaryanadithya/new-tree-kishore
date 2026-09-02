# Family Tree — React + Tailwind

A rewrite of the original vanilla HTML/CSS/JS family tree app as a proper
React + Tailwind CSS project (built with Vite).

## Setup

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build → dist/
```

## Advanced features (added on top of the base rewrite)

- **Undo / redo** — every edit, add, delete, and import is on a history
  stack. `Ctrl+Z` / `Ctrl+Y` (or `Ctrl+Shift+Z`), or the toolbar buttons.
- **Autosave** — the tree persists to `localStorage` automatically, so a
  refresh doesn't lose changes. (Fine here since this is your own app, not
  a claude.ai artifact — see `src/utils/storage.js`.)
- **Dark mode** — toggle in the toolbar, remembered across sessions.
- **Birth/death dates** — each person can have a `birthDate` and optional
  `deathDate`. Cards show computed age and a living/deceased status dot.
- **Photo upload** — the edit form accepts a URL or a local file (stored
  as a data URL), not just a link.
- **Statistics dashboard** — total members, gender split, generation
  count, living vs. deceased, average age, oldest member.
- **Relationship finder** — pick any two people and see how they're
  related (parent/child, sibling, grandparent, aunt/uncle, nth cousins —
  including "removed" degrees, and in-laws by marriage). Logic lives in
  `src/utils/family.js` and is unit-tested by inspection against the
  sample tree.
- **JSON import** — load a whole tree from a `.json` file, replacing the
  current one (with a toast confirming success/failure).
- **Toast notifications** — replace blocking `alert()` calls for
  success/error/info feedback (add, edit, delete, export, undo/redo, etc.).
- **Live search suggestions** — a dropdown of matching names as you type,
  in addition to full search-and-scroll on Enter.
- **Generation badges** — each card shows which generation it belongs to.
- **Ctrl+scroll to zoom**, in addition to the existing zoom buttons.

## What changed from the original (base rewrite)

- **State management**: all the scattered `let` globals and direct DOM
  mutation in `script.js` became a single `useFamilyTree` hook
  (`src/hooks/useFamilyTree.js`) driving React state. The tree re-renders
  itself instead of being torn down and rebuilt on every change.
- **Editing UX**: `prompt()` / `alert()` / `confirm()` calls were replaced
  with real modal components (`MemberFormModal`, `ConfirmDialog`) styled
  to match the app.
- **Styling**: the ~3,900-line hand-rolled `style.css` was replaced with
  Tailwind utility classes directly in each component. The only leftover
  plain CSS is the tree connector-line rules in `src/index.css` — those
  pseudo-element sibling connectors are genuinely simpler as CSS than as
  Tailwind utilities, so they stayed put deliberately.
- **Data**: the old `fetch("family.json")` became `src/data/familyData.js`,
  a plain JS module with the same shape (`id`, `name`, `gender`, `photo`,
  `voice`, `details`, `spouse?`, `children?`). Swap it for a real fetch
  call if you want to load the tree from a server — the hook only needs
  the same shape back.
- **PNG export**: still uses `html2canvas`, now as an npm dependency
  instead of a CDN `<script>` tag.
- **Background music**: kept as an opt-in floating toggle
  (`BackgroundMusic.jsx`). Drop a track at `public/music.mp3`, or pass a
  different `src` prop — no audio file ships with this project.

## Project structure

```
src/
  App.jsx                    # top-level state wiring + layout
  index.css                  # Tailwind directives + tree connector-line CSS
  data/familyData.js          # sample tree data (same shape as old family.json)
  hooks/
    useFamilyTree.js          # tree state, undo/redo, edit/add/delete/export/import
    useToasts.js               # toast notification queue
  utils/
    family.js                  # flatten tree, stats, relationship calculator
    storage.js                  # localStorage autosave + theme persistence
  components/
    Topbar.jsx                  # search+suggestions, undo/redo, zoom, dark mode, etc.
    TreeNode.jsx                 # recursive node (person + spouse + children)
    MemberCard.jsx                # a person's card (age, status dot, gen badge)
    MemberPopup.jsx                # "view details" modal
    ContextMenu.jsx                # right-click menu
    MemberFormModal.jsx            # edit / add child / add spouse form (+ dates, photo upload)
    ConfirmDialog.jsx               # delete confirmation
    StatsPanel.jsx                   # statistics dashboard slide-over
    RelationshipFinder.jsx            # "how are these two related?" modal
    ToastContainer.jsx                 # toast notifications
    BackgroundMusic.jsx                 # floating music toggle
```

## Notes

- Dark mode is wired up via Tailwind's `class` strategy
  (`darkMode: "class"` in `tailwind.config.js`) — toggle it by adding/
  removing the `dark` class on `<html>` from wherever you want a theme
  switch to live; it isn't hooked up to a button yet.
- Photos fall back to an initial-letter avatar when `photo` is empty,
  instead of pointing at a local `images/person.png` that may not exist.
