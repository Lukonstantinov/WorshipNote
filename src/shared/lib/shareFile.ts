/**
 * On phones (iPhone home-screen app, mobile Safari/Chrome) a blob "download"
 * is unreliable — iOS can open it in a preview with no way back. The native
 * share sheet (Save to Files, AirDrop, Messages, Telegram…) is the expected
 * way to export a file there.
 *
 * Returns true when the share sheet handled it (or the user cancelled it),
 * false when the caller should fall back to a normal download.
 */
export async function shareFileOnMobile(content: string, filename: string, mimeType: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.canShare || !navigator.share) return false
  // Only on touch devices — desktop browsers should keep the familiar download
  if (!window.matchMedia?.('(pointer: coarse)').matches) return false

  const file = new File([content], filename, { type: mimeType })
  if (!navigator.canShare({ files: [file] })) return false

  try {
    await navigator.share({ files: [file], title: filename })
    return true
  } catch (e) {
    // User closed the share sheet — that's a valid outcome, not an error
    if (e instanceof DOMException && e.name === 'AbortError') return true
    return false
  }
}
