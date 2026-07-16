# Pollen-Detection-Pre

Contains preliminary segmentation visualization for pollen detection.

A small Next.js app for browsing all 391 pollen microscope images produced by the
DINOv2 species-tagging pipeline (`../annotate_code`), viewing the annotation overlays,
and correcting labels by hand. Images are streamed from Google Drive; the base
annotations and all label edits live in Firebase Realtime Database, merged at read time.

## Stack

Next.js (App Router, plain JavaScript, no TypeScript), Tailwind CSS v4, Google Drive API
(service account), Firebase Admin SDK (Realtime Database).

## Setup

1. In a Google Cloud project, enable the **Google Drive API**.
2. Create a **service account**, download its JSON key. Take the `client_email` and
   `private_key` from it.
3. Share the Drive folder containing the 391 images with that service account's email,
   as **Viewer**. Copy the folder's ID from its URL.
4. Reuse the same GCP project (or a new one) for **Firebase** — enable **Realtime
   Database**. The base annotations JSON (`images`/`annotations`/`categories`) should
   be uploaded at the database **root**.
5. In the Firebase Console, go to Project Settings → Service Accounts → generate a new
   Admin SDK private key. Take `project_id`, `client_email`, and `private_key` from it.
   Also grab the database URL from the Realtime Database page
   (`https://<project-id>-default-rtdb.<region>.firebasedatabase.app`).
6. Set Realtime Database rules to deny all client access (all reads/writes go through
   the Admin SDK on the server, never the browser):
   ```json
   {
     "rules": {
       ".read": false,
       ".write": false
     }
   }
   ```
7. Copy `.env.local.example` to `.env.local` (already scaffolded as `.env.local`) and
   fill in all seven values:
   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=
   GOOGLE_PRIVATE_KEY=
   GOOGLE_DRIVE_FOLDER_ID=
   FIREBASE_PROJECT_ID=
   FIREBASE_CLIENT_EMAIL=
   FIREBASE_PRIVATE_KEY=
   FIREBASE_DATABASE_URL=
   ```
   Both private keys must keep their `\n` line breaks escaped as literal `\n` inside
   the quoted value (the app un-escapes them at startup).

## Running

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Both the gallery and the detail
pages now require the Firebase env vars above, since the base annotation data itself
is read from Realtime Database (there's no local JSON fallback anymore).

## How it works

- `/` — gallery of all images, sorted by filename, with object counts per image.
- `/image/[id]` — full image with polygon overlays; click an object to select it,
  change its label in the side panel, and save.
- `src/lib/annotations.js` — reads the base annotations from Realtime Database root
  (cached per server process) and merges in any `annotationEdits` overrides at read time.
- `src/lib/drive.js` + `src/app/api/image/[filename]/route.js` — looks up each image
  by filename in the shared Drive folder and streams its bytes back with long-lived
  cache headers.
- `src/lib/firebaseAdmin.js` + `src/app/api/annotations/[annotationId]/route.js` —
  validates and writes label edits under `/annotationEdits/{annotationId}` in the same
  Realtime Database, keyed by annotation id.
