import { google } from "googleapis";

const STALE_MS = 60 * 60 * 1000; // 1 hour

let fileIndex = null; // Map<filename, {fileId, mimeType}>
let indexedAt = 0;

function getDriveClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing Google Drive env vars: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY"
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

async function buildFileIndex() {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error("Missing GOOGLE_DRIVE_FOLDER_ID env var");
  }

  const drive = getDriveClient();
  const index = new Map();
  let pageToken;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType)",
      pageSize: 1000,
      pageToken,
    });
    for (const file of res.data.files ?? []) {
      index.set(file.name, { fileId: file.id, mimeType: file.mimeType });
    }
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);

  return index;
}

export async function getDriveFileIndex({ forceRefresh = false } = {}) {
  const isStale = Date.now() - indexedAt > STALE_MS;
  if (!fileIndex || isStale || forceRefresh) {
    fileIndex = await buildFileIndex();
    indexedAt = Date.now();
  }
  return fileIndex;
}

export async function lookupDriveFile(filename) {
  let index = await getDriveFileIndex();
  let entry = index.get(filename);
  if (!entry) {
    // One retry with a forced refresh in case the file was added after the last index.
    index = await getDriveFileIndex({ forceRefresh: true });
    entry = index.get(filename);
  }
  return entry ?? null;
}

export async function streamDriveFile(fileId) {
  const drive = getDriveClient();
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );
  return res.data;
}
