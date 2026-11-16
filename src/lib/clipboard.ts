export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Try modern navigator.clipboard API
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy method on permission denial or insecure context
    }
  }

  // 2. Fallback to document.execCommand('copy')
  if (typeof document !== "undefined" && typeof document.createElement === "function") {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Prevent scrolling and position off-screen
      textArea.style.position = "fixed";
      textArea.style.top = "-9999px";
      textArea.style.left = "-9999px";
      textArea.style.opacity = "0";
      if (typeof textArea.setAttribute === "function") {
        textArea.setAttribute("readonly", "");
      }

      if (document.body && typeof document.body.appendChild === "function") {
        document.body.appendChild(textArea);
      }

      if (typeof textArea.focus === "function") textArea.focus();
      if (typeof textArea.select === "function") textArea.select();
      if (typeof textArea.setSelectionRange === "function") {
        textArea.setSelectionRange(0, 99999);
      }

      const successful = document.execCommand ? document.execCommand("copy") : false;

      if (document.body && typeof document.body.removeChild === "function") {
        document.body.removeChild(textArea);
      }

      return Boolean(successful);
    } catch (err) {
      return false;
    }
  }

  return false;
}
