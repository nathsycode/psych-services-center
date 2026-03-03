const APP_MODE_KEY = "app_mode";
export const APP_MODES = {
  PORTFOLIO: "portfolio",
  DEMO: "demo",
};

function normalizeMode(value) {
  if (value === APP_MODES.DEMO || value === APP_MODES.PORTFOLIO) return value;
  return null;
}

const ENV_MODE = normalizeMode(import.meta.env.VITE_APP_MODE);

export function canSwitchAppMode() {
  // If mode is pinned via env, do not allow runtime switching.
  if (ENV_MODE) return false;
  return import.meta.env.DEV;
}

export function getInitialMode() {
  if (ENV_MODE) return ENV_MODE;

  const urlParam = new URLSearchParams(window.location.search).get("mode");

  if (import.meta.env.DEV && normalizeMode(urlParam)) {
    return urlParam;
  }

  if (import.meta.env.DEV) {
    const saved = localStorage.getItem(APP_MODE_KEY);

    if (normalizeMode(saved)) return saved;
  }

  return import.meta.env.DEV ? APP_MODES.DEMO : APP_MODES.PORTFOLIO;
}

export function setAppMode(mode) {
  if (!canSwitchAppMode()) return;
  if (!normalizeMode(mode)) return;
  localStorage.setItem(APP_MODE_KEY, mode);
}

export function isPortfolioMode(mode) {
  return mode === APP_MODES.PORTFOLIO;
}
