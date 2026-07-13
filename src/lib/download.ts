// Force-download a file (image or video). Fetches it as a blob first so the
// download works even when the asset lives on another origin (e.g. Vercel Blob),
// where the plain `download` attribute is ignored. Falls back to opening the
// asset in a new tab if the fetch is blocked (CORS) or fails.
export async function downloadFile(url: string, filename?: string): Promise<void> {
  const name = filename || url.split("/").pop()?.split("?")[0] || "download";
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const obj = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = obj;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(obj), 2000);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
