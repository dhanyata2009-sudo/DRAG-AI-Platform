# DRAG.ai — Frontend

AI-assisted video and PPT generation workspace. This repo is the **frontend only** —
React + Vite + Tailwind CSS, built to plug into a separate Node/Express +
MongoDB backend.

## Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router v7
- Framer Motion (animation)
- Axios (API calls)
- lucide-react (icons)

## Getting started

```bash
npm install
cp .env.example .env      # then set VITE_API_BASE_URL to your API
npm run dev                # http://localhost:5173
npm run build               # production build -> /dist
```

The landing page is public. The generator workspace uses a frontend-only demo
login—no backend is required:

```text
Login ID: admin@123
Password: admin_pass
```

After starting Vite, open `/login`. A successful login leads to `/projects`,
where users can choose Video Generation or PPT Generation.

## Folder structure

```
src/
  assets/          brand logo (official asset, do not replace)
  components/
    common/         Button, Card, Logo, ThemeToggle, FormFields, Loader...
    landing/        marketing page sections (Navbar, Hero, Features, ...)
    dashboard/      Sidebar, Topbar, StatCard, ProjectCard
    project/        StepIndicator for the creation wizard
  context/          auth, workspace, video draft and PPT draft state
  hooks/            typed accessors for each context
  layouts/          public, auth, dashboard, video and PPT creation shells
  pages/            one file per route (see App.jsx)
  services/         axios wrappers per resource — THIS IS THE INTEGRATION LAYER
  utils/            staticData.js (UI choices/marketing content), constants.js (routes)
```

## Connecting the backend

Every network call lives in `src/services/*.js` and is already wired to
the UI. Nothing in `pages/` or `components/` calls `axios`/`fetch`
directly, so backend integration should only require editing the
`services/` files:

1. Set `VITE_API_BASE_URL` in `.env` to your Express API base.
2. Implement the matching routes on the backend (see the comment above
   each function in `authService.js`, `projectService.js`,
   `scriptService.js`, `videoService.js`, `presentationService.js` for the expected method/path/payload).
3. Connect the documented `// TODO (backend): ...` handoff points in the
   AI-script, video-generation and PPT-generation screens to the matching service calls. These
   screens intentionally do not create fake sessions or generated results.
4. The active login is a frontend-only demo check in `LoginPage.jsx`; it is not
   real security. If the backend team later adds accounts, replace that comparison
   with `authService.js` and hydrate `AuthContext.jsx` from a validated server session.

## Design system

Brand tokens (colors, fonts, the theme-aware CSS variables used for
light/dark mode) live in `src/index.css`. The signature visual motif —
circuit lines converging into a play triangle, echoing the logo — shows
up as `.circuit-corner` accents on cards and in the hero illustration.

## Notes

- User, project, history, notification, admin and generated-media records are
  intentionally empty until supplied by the backend. Wizard drafts and local
  UI preferences persist in browser storage.
- `src/utils/staticData.js` contains only static UI choices and public marketing
  content; it does not seed authenticated user/workspace records.
- The official DRAG.ai logo (`src/assets/logo.jpeg`) is used as-is for
  the navbar, auth screens and favicon. Do not regenerate or edit it.
- See `BACKEND_INTEGRATION_GUIDE.md` for endpoint contracts and connection steps.
- See `FRONTEND_READINESS_REPORT.md` for the complete handoff inventory.
