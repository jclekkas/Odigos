import type { L } from '@/i18n/types';
import { COPY } from '@/i18n/copy';

export interface NavItem {
  to: string;
  label: L;
  /** Routes that exist in this prototype vs. ones a real site would have. */
  built: boolean;
}

/**
 * Top-level navigation.
 *
 * "Need Legal Help" is first and stays first. The ordering is the argument:
 * the person in trouble is served before the person doing research about the
 * organisation. Items marked `built: false` are real IA slots that this
 * four-page prototype does not implement; the UI labels them honestly rather
 * than pretending they lead somewhere.
 */
export const PRIMARY_NAV: NavItem[] = [
  { to: '/get-help', label: COPY.nav.needHelp, built: true },
  { to: '/our-work', label: COPY.nav.ourWork, built: true },
  { to: '/about', label: COPY.nav.about, built: true },
  { to: '/about#support', label: COPY.nav.getInvolved, built: true },
  { to: '/get-help#resources', label: COPY.nav.resources, built: true },
];
