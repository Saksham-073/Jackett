export const DEFAULT_BASE_URL = "http://localhost:9117";

export function getJackettSettings() {
  return {
    baseUrl: (localStorage.getItem("jackettBaseUrl") || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    apiKey: localStorage.getItem("jackettApiKey") || "",
  };
}

export function openExternal(url: string) {
  if (/^(https?|magnet):/i.test(url)) {
    window.open(url, "_blank", "noopener");
  }
}
