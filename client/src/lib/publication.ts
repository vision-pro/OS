const channelName = "vision-public-content";
const sameTabEvent = "vision-public-content-updated";

export function notifyPublicContentUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(sameTabEvent));
  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type: "published" });
    channel.close();
  }
}

export function onPublicContentUpdated(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(sameTabEvent, callback);
  const channel = "BroadcastChannel" in window ? new BroadcastChannel(channelName) : null;
  if (channel) channel.onmessage = callback;
  return () => {
    window.removeEventListener(sameTabEvent, callback);
    channel?.close();
  };
}
