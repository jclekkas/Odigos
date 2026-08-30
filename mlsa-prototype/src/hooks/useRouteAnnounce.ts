import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * The last location this app actually announced.
 *
 * Module scope, not a ref: each page component mounts its own copy of this
 * hook, so a per-component "is this the first render?" flag is true on *every*
 * navigation and would never fire. It also makes the hook idempotent under
 * StrictMode's double-invoked effects in development, since the key does not
 * change between the two passes.
 */
let lastAnnounced: string | null = null;

/**
 * A single-page app changes the page without a page load, so a screen reader is
 * never told anything happened. On each route change we move focus to the main
 * heading, which announces the new page and puts the user at the top of it.
 *
 * Crucially this does NOT run on the first page load. The browser already
 * starts focus at the top of the document there, and stealing it to the <h1>
 * would put the skip link, the header and the navigation *behind* the user,
 * reachable only by tabbing backwards.
 */
export function useRouteAnnounce(title: string) {
  const { pathname, hash } = useLocation();
  const key = pathname + hash;

  useEffect(() => {
    document.title = `${title} — MLSA concept prototype`;
  }, [title]);

  useEffect(() => {
    const isInitialLoad = lastAnnounced === null;
    const isSameLocation = lastAnnounced === key;
    lastAnnounced = key;

    if (isSameLocation) return;

    if (isInitialLoad) {
      // Honour a deep link's hash, but leave focus at the top of the document.
      if (hash) document.querySelector(hash)?.scrollIntoView({ block: 'start' });
      return;
    }

    // An in-page anchor (e.g. /our-work#housing) should behave like an anchor,
    // not reset the user to the top of the document.
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ block: 'start' });
        if (target instanceof HTMLElement) {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
        return;
      }
    }

    window.scrollTo({ top: 0 });
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
  }, [key, hash]);
}
