// fetch() has no upload-progress event, so real "uploading…" percentages need
// XMLHttpRequest instead. This wraps a JSON POST with upload progress callbacks
// so the UI can show real progress before the server-side work even starts.

export type XhrJsonResult<T> = { ok: true; status: number; data: T } | { ok: false; status: number; data: unknown };

export function postJsonWithProgress<T>(
  url: string,
  body: unknown,
  onUploadProgress: (fraction: number) => void
): Promise<XhrJsonResult<T>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onUploadProgress(e.loaded / e.total);
      }
    };
    xhr.upload.onload = () => onUploadProgress(1);

    xhr.onload = () => {
      let data: unknown;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Received an unreadable response from the server."));
        return;
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data: data as T });
    };

    xhr.onerror = () => reject(new Error("Network error — could not reach the server."));

    xhr.send(JSON.stringify(body));
  });
}
