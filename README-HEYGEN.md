# DRAG.ai — HeyGen Video 1 API setup

This version uses the HeyGen Video model `heygen-video-1` in `reference_to_video` mode. The selected DRAG.ai avatar image and uploaded product image are sent as reference assets; HeyGen generates the clip and its audio. The voice-selection step and active Tavus/Magic Hour pipeline have been removed. PPT generation and the rest of the website remain in place.

## Prerequisites
- Node.js 20 or newer
- MongoDB connection string
- Gemini API key (for script generation)
- HeyGen API key with `videos:write`, `videos:read`, and `assets:write` scopes

## Configure backend
1. Open a terminal in `backend`.
2. Copy `.env.example` to `.env` (Windows: `copy .env.example .env`). If you already have a working `.env`, keep it and add `HEYGEN_API_KEY=your_key` plus `HEYGEN_VIDEO_RESOLUTION=768p`. Do not share or commit `.env`.
3. Ensure `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY` are correctly set.
4. Run `npm install` once.
5. Run `npm run dev`.

## Configure frontend
1. Open another terminal in `frontend`.
2. Run `npm install` once.
3. Create `frontend/.env` only if needed, with `VITE_API_BASE_URL=http://localhost:5000/api`.
4. Run `npm run dev` and open the URL Vite prints (usually `http://localhost:5173`).

## Test
1. Log in, create a project, and upload a product image.
2. Select one of the ten DRAG.ai creators.
3. Continue directly to generation. HeyGen will generate both video and audio.
4. Wait for the video to finish and preview/download the MP4.

## Important model limits
- Reference-to-video clips currently support 5–15 seconds; the backend clamps requested duration to that range.
- Reference images are visual guidance, not a guarantee of perfect identity or product-label preservation. Test with a low-cost short generation first.
- Generated clips are stored in `backend/uploads/videos` and served from `/uploads/videos/`.
- The API key stays on the backend. Never add it to `frontend/.env` or any `VITE_` variable.
