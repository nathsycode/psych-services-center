const APP_MODE_KEY = "app_mode";
export const APP_MODES = {
  PORTFOLIO: "portfolio",
  DEMO: "demo",
};

export function getInitialMode() {
  const urlParam = new URLSearchParams(window.location.search).get("mode");

  if (
    import.meta.env.DEV &&
    (urlParam === APP_MODES.DEMO || urlParam === APP_MODES.PORTFOLIO)
  ) {
    return urlParam;
  }

  if (import.meta.env.DEV) {
    const saved = localStorage.getItem(APP_MODE_KEY);

    if (saved === APP_MODES.DEMO || saved === APP_MODES.PORTFOLIO) return saved;
  }

  const envMode = import.meta.env.VITE_APP_MODE;

  if (envMode === APP_MODES.DEMO || envMode === APP_MODES.PORTFOLIO)
    return envMode;

  return import.meta.env.DEV ? APP_MODES.DEMO : APP_MODES.PORTFOLIO;
}

export function setAppMode(mode) {
  if (!import.meta.env.DEV) return;
  localStorage.setItem(APP_MODE_KEY, mode);
}

export function isPortfolioMode(mode) {
  return mode === APP_MODES.PORTFOLIO;
}
