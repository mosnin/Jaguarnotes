/**
 * Motion presets — Apple-calibrated spring physics.
 *
 * Rule: no linear easing anywhere. Everything is spring-based.
 * Springs should feel intentional — not bouncy, not stiff. Decisive.
 */

import type { Transition, Variants } from "framer-motion";

/* ─── Spring presets ───────────────────────────────────────────────── */

/** Snappy — for small UI elements (buttons, chips, icons) */
export const springSnap: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 36,
  mass: 0.8,
};

/** Standard — most UI transitions (menus, panels, overlays) */
export const springStd: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 34,
  mass: 0.9,
};

/** Smooth — larger surfaces (sidebar, page-level) */
export const springSmooth: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 32,
  mass: 1,
};

/** Gentle — entrance animations (hero text, onboarding) */
export const springGentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 28,
  mass: 1.1,
};

/* ─── Shared variants ──────────────────────────────────────────────── */

/** Fade up — clean entrance from below */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: springStd },
  exit:   { opacity: 0, y: 6, transition: { ...springSnap, duration: 0.15 } },
};

/** Scale in — overlays, menus, tooltips */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 6 },
  show:   { opacity: 1, scale: 1, y: 0, transition: springSnap },
  exit:   { opacity: 0, scale: 0.97, y: 3, transition: { duration: 0.12 } },
};

/** Slide from left — sidebar */
export const slideLeft: Variants = {
  hidden: { x: -280, opacity: 0, transition: { ...springSmooth, duration: 0.2 } },
  show:   { x: 0, opacity: 1, transition: springSmooth },
  exit:   { x: -280, opacity: 0, transition: { ...springSmooth, duration: 0.22 } },
};

/** Stagger container — for lists of cards */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.06,
    },
  },
};

/** Stagger item — child of staggerContainer */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: springStd },
};

/* ─── Micro-interaction props ──────────────────────────────────────── */

/** Button press — subtle scale down */
export const buttonTap = {
  whileTap: { scale: 0.97 },
  transition: springSnap,
} as const;

/** Card hover — subtle lift */
export const cardHover = {
  whileHover: { y: -2, transition: springSnap },
  whileTap:   { scale: 0.99, transition: springSnap },
} as const;

/** Icon hover — subtle scale */
export const iconHover = {
  whileHover: { scale: 1.08, transition: springSnap },
  whileTap:   { scale: 0.93, transition: springSnap },
} as const;
