declare global {
  interface Window {
    __env?: {
      apiUrl?: string;
    };
    API_URL?: string;
  }
}

function getProductionApiUrl(): string {
  if (typeof window !== 'undefined') {
    if (window.__env?.apiUrl) {
      return window.__env.apiUrl;
    }
    if (window.API_URL) {
      return window.API_URL;
    }
    try {
      const stored = window.localStorage.getItem('API_URL');
      if (stored) {
        return stored;
      }
    } catch {}
  }
  return 'https://audio-agent-backend-0xmq.onrender.com';
}

export const environment = {
  production: true,
  get apiUrl(): string {
    return getProductionApiUrl();
  }
};
