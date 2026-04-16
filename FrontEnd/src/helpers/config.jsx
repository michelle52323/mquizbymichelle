// helpers/config.jsx

export function getApiBaseUrl() {
  const mode = import.meta.env.VITE_MODE;
  const width = window.innerWidth;

  if (mode === 'dev') {
    return width < 500
      ? import.meta.env.VITE_API_BASE_MOBILE
      : import.meta.env.VITE_API_BASE_LOCAL;
  }

  if (mode === 'prod') {
    return import.meta.env.VITE_API_BASE;
  }

  // Optional fallback
  return import.meta.env.VITE_API_BASE_LOCAL;
}



// Other helpers
export function isDevUseMockLogin(){
    const isDev = !isProdMode();
    return isDev && isMobileTouchDeviceDev();
}

export function isMobileTouchDeviceDev() {
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  const isNarrow = window.innerWidth < 500;

  return isTouch && (isPortrait || isNarrow);
}

// export function isMobileTouchDevice() {
//   const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
//   const isPortrait = window.matchMedia('(orientation: portrait)').matches;
//   const isNarrow = window.innerWidth < 900;

//   return isTouch && (isPortrait || isNarrow);
// }

export function isMobileTouchDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;

    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);

    return isIOS || isAndroid;
}

export function isIOS() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /iPhone|iPad|iPod/i.test(ua);
}



export function isProdMode() {
  return import.meta.env.VITE_MODE === 'prod';
}