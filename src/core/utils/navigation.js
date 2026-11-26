/**
 * @layer Core (Utils)
 * @responsibility Safe navigation helpers preventing unhandled GO_BACK errors and
 *                rapid double-tap duplicate route pushes.
 */

let lastPushTimestamp = 0;
const NAVIGATION_COOLDOWN_MS = 400;

/**
 * Navigates back when history exists; otherwise replaces the current screen
 * with `fallbackHref` to avoid the unhandled GO_BACK action error.
 *
 * On web it is common to open a route directly by URL, which means the router
 * has no history to go back through. Calling `router.back()` in that situation
 * triggers "The action 'GO_BACK' was not handled by any navigator." This helper
 * guards against that by checking `router.canGoBack()` first.
 *
 * @param {import('expo-router').Router} router   Expo Router router object.
 * @param {string} [fallbackHref='/']             Fallback route when no back
 *                                                history exists. Defaults to
 *                                                the Home tab ('/').
 * @returns {void}
 */
export function safeGoBack(router, fallbackHref = '/') {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackHref);
  }
}

/**
 * Pushes a route while ignoring rapid duplicate taps within a short cooldown window
 * so double-tapping a FAB or Edit button never opens stacked duplicate modals.
 *
 * @param {import('expo-router').Router} router Expo Router router object.
 * @param {string | { pathname: string, params?: object }} target Destination route or descriptor.
 * @returns {boolean} True when navigation ran; false if ignored by cooldown.
 */
export function safePush(router, target) {
  const now = Date.now();
  if (now - lastPushTimestamp < NAVIGATION_COOLDOWN_MS) {
    return false;
  }
  lastPushTimestamp = now;
  router.push(target);
  return true;
}
