/**
 * Motion presets — Apple-calibrated spring physics.
 *
 * Rule: no linear easing anywhere. Everything is spring-based.
 * Springs should feel intentional — not bouncy, not stiff. Decisive.
 */

import type { Transition, Variants } from "framer-motion";
import { useReducedMotion } from "framer-motion";

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

/** Button press — subtle scale down, with hover scale */
export const buttonTap = {
  whileHover: { scale: 1.01 },
  whileTap:   { scale: 0.96 },
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

/**
 * Hook — returns motion props that respect prefers-reduced-motion.
 * Components using AnimatePresence / motion.div should call this and
 * spread the result onto <motion.div> to disable animations when the
 * user has requested reduced motion.
 */
export function useMotionVariants(variants: import("framer-motion").Variants) {
  const reduce = useReducedMotion();
  if (reduce) return { variants: undefined, initial: false, animate: false, exit: undefined };
  return { variants };
}

/* ─── Additional spring presets ────────────────────────────────────── */

/** Tight — very snappy for micro-interactions */
export const springTight: Transition = {
  type: "spring",
  stiffness: 700,
  damping: 40,
  mass: 0.6,
};

/* ─── Panel / drawer variants ──────────────────────────────────────── */

/** Slide up — panel slides up from bottom */
export const slideUp: Variants = {
  hidden: { y: "100%", opacity: 0 },
  show:   { y: 0, opacity: 1, transition: springSmooth },
  exit:   { y: "100%", opacity: 0, transition: { ...springSmooth, duration: 0.2 } },
};

/** Slide from right — panel slides in from right */
export const slideRight: Variants = {
  hidden: { x: "100%", opacity: 0 },
  show:   { x: 0, opacity: 1, transition: springSmooth },
  exit:   { x: "100%", opacity: 0, transition: { ...springSmooth, duration: 0.2 } },
};

/** Drawer up — bottom sheet drawer */
export const drawerUp: Variants = {
  hidden: { y: 60, opacity: 0 },
  show:   { y: 0, opacity: 1, transition: springStd },
  exit:   { y: 40, opacity: 0, transition: { ...springStd, duration: 0.16 } },
};

/** Pop in — scale-in with slight bounce for tooltips */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show:   { opacity: 1, scale: 1, transition: { ...springSnap, stiffness: 600, damping: 28 } },
  exit:   { opacity: 0, scale: 0.9, transition: { duration: 0.1 } },
};

/* ─── Additional micro-interaction props ───────────────────────────── */

/** Hover card — upgraded cardHover with shadow-change hint */
export const hoverCard = {
  whileHover: { y: -3, transition: springSnap },
  whileTap:   { scale: 0.98, y: 0, transition: springSnap },
} as const;

/* ─── Extended variants ────────────────────────────────────────────── */

/** Tooltip — scales from bottom, origin center-bottom */
export const tooltipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 4, transition: { duration: 0.1 } },
  show:   { opacity: 1, scale: 1, y: 0, transition: springSnap },
  exit:   { opacity: 0, scale: 0.92, y: 2, transition: { duration: 0.1 } },
};

/** Fade only — subtle content transitions */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.2 } },
  exit:   { opacity: 0, transition: { duration: 0.15 } },
};

/** Pop — for badges, notifications, count indicators */
export const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show:   { opacity: 1, scale: 1, transition: { ...springSnap, stiffness: 600, damping: 28 } },
  exit:   { opacity: 0, scale: 0.6, transition: { duration: 0.1 } },
};

/** Icon spin — for loading icons */
export const spinVariant = {
  animate: { rotate: 360 },
  transition: { repeat: Infinity, duration: 1.2, ease: "linear" },
} as const;

/** List container with stagger */
export const listContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
};

/** List item — slides up with fade */
export const listItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  show:   { opacity: 1, x: 0, transition: springStd },
};

/** Hover glow — for interactive cards */
export const cardGlow = {
  whileHover: {
    y: -3,
    boxShadow: "6px 8px 20px #C5D5E8, -6px -4px 16px #FFFFFF, 0 0 0 1px rgba(37,99,235,0.1)",
    transition: springSnap,
  },
  whileTap: { scale: 0.98, y: 0, transition: springSnap },
} as const;
