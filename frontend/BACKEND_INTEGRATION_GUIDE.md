# DRAG.ai Backend Integration Guide

## Scope

This repository is the frontend for two free college-project features:

1. Video Generation
2. PPT Generation

The frontend intentionally does not create fake users, scripts, videos, presentations or API responses. Forms and request builders are complete; the next team connects them to real services.

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set the backend URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

All HTTP requests use `src/services/api.js`. Its Axios interceptor reads the JWT from `localStorage` key `drag_ai_token` and sends it as a Bearer token.

## Current demo authentication

The landing page is public. The workspace currently uses the frontend-only demo
credentials `admin@123` / `admin_pass`. `LoginPage.jsx` compares those values in
the browser and `AuthContext.jsx` stores the demo session locally. This requires
no backend, but it provides no real security because frontend source is visible.

## Replacing the demo login with backend authentication

Implement the routes already declared in `src/services/authService.js`:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/logout`

Login/register should return a validated user object and JWT. Then:

1. Store the token as `drag_ai_token`.
2. Call `login(response.user, rememberMe)` from `AuthContext`.
3. Remove `DEMO_CREDENTIALS` and replace the local comparison in `LoginPage.jsx` with the auth service call.
4. Add a current-user endpoint such as `GET /auth/me` and hydrate `AuthContext` on page reload.

## Workspace data

Use `src/services/projectService.js` for video-project CRUD:

- `GET /projects`
- `GET /projects/:id`
- `POST /projects`
- `PUT /projects/:id`
- `DELETE /projects/:id`

Hydrate `WorkspaceContext` with authenticated backend responses for projects, presentation records, history and notifications. The default workspace arrays are intentionally empty.

## AI script generation

`buildScriptGenerationRequest()` in `src/utils/generationRequests.js` converts the user's video brief into:

```text
{
  prompt: string,
  project: {
    projectName, productName, brandName, productDescription,
    targetAudience, marketingGoal, platform, adStyle, tone,
    language, videoDuration, voice, callToAction
  }
}
```

Connect the Generate Script action in `src/pages/AIScriptPage.jsx` to `generateScript()` from `src/services/scriptService.js`. Set the returned script in page state; do not build a script in the browser.

Recommended backend response:

```text
{ scriptId: string, script: string }
```

## Video generation

`buildVideoGenerationRequest()` prepares:

```text
{ script, avatarId, voiceId, language, duration, platform }
```

Connect `src/pages/GenerateVideoPage.jsx` to:

- `POST /videos/generate`
- `GET /videos/:id/status`
- `GET /videos/history`
- `DELETE /videos/:id`

Recommended job flow:

1. Submit the generation request and receive `{ jobId }`.
2. Poll status until `completed` or `failed`.
3. On completion, return the real project/video metadata and preview/download URL.
4. Add those backend records to `WorkspaceContext` and navigate to the preview route.

## PPT generation

The complete PPT frontend flow is:

- `/projects/ppt/new`
- `/projects/ppt/new/content`
- `/projects/ppt/new/generate`

`buildPPTGenerationRequest()` prepares:

```text
{
  prompt: string,
  presentation: {
    title, topic, purpose, targetAudience, slideCount,
    style, tone, language, keyPoints, sourceNotes, outline
  }
}
```

Connect `src/pages/GeneratePPTPage.jsx` to `src/services/presentationService.js`:

- `POST /presentations/generate`
- `GET /presentations/:id/status`
- `GET /presentations`

Recommended job flow:

1. Submit the request and receive `{ jobId }`.
2. Generate the slide outline and PPT file on the backend.
3. Poll until `completed` or `failed`.
4. Return presentation metadata plus a secured `.pptx` download URL.
5. Store the returned presentation record in `WorkspaceContext.presentations`.

Do not generate the PPT file in the React client.

## Error and loading behavior

For every service call:

- Disable the submit button while the request is running.
- Show a clear inline error for validation, authentication or generation failures.
- Preserve the user's draft after an error.
- Stop polling after completion, failure or component unmount.
- Treat HTTP `401` as an expired session: clear the token and redirect to `/login`.

## Verification

After connecting the backend, run:

```bash
npm run lint
npm run build
```

Then test registration, login, protected-route hydration, project loading, AI-script generation, video job polling/preview, PPT job polling/download and failure recovery.
