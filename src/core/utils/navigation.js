/**
 * @layer Core (Utils)
 * @responsibility Safe back navigation helper that falls back to a known route
 *                when there is no navigation history (e.g. direct URL load on web).
 */

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
 */
export function safeGoBack(router, fallbackHref = '/') {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackHref);
  }
}
