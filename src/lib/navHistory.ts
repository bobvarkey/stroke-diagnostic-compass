/** Shared back-navigation: a registered in-page handler (e.g. condition tabs) gets first chance, then browser history. */
type BackHandler = () => boolean;
let handler: BackHandler | null = null;

export function registerBackHandler(h: BackHandler | null) {
  handler = h;
}

export function goBack(navigateHome: () => void) {
  if (handler && handler()) return;
  if (window.history.length > 1) window.history.back();
  else navigateHome();
}
