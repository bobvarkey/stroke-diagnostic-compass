// ══════════════════════════════════════════════════════════════════
// Accessibility Utilities — StrokeSuite
// WCAG 2.2 contrast validation and focus management.
// ══════════════════════════════════════════════════════════════════

import type { ColorContrastResult, AccessibilityAudit } from '@/types/compliance';

/**
 * Calculate relative luminance per WCAG 2.2.
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */
function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const linearize = (c: number): number =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Calculate contrast ratio between two hex colors.
 * WCAG requires 4.5:1 for normal text, 3:1 for large text.
 */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate a color pair against WCAG thresholds.
 */
export function validateContrast(
  fg: string,
  bg: string,
  element: string,
  context: string,
): ColorContrastResult {
  const ratio = contrastRatio(fg, bg);
  return {
    foreground: fg,
    background: bg,
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7.0,
    passesAALarge: ratio >= 3.0,
    element,
    context,
  };
}

/**
 * Run a full contrast audit against the design token palette.
 * This validates all foreground-background combinations used in the app.
 */
export function runContrastAudit(): AccessibilityAudit {
  const results: ColorContrastResult[] = [];

  // The app's design tokens (HSL converted to hex approximations)
  // In production, these would be computed from CSS custom properties
  const colors: Record<string, string> = {
    background: '#0f1219',       // hsl(221, 16%, 10%)
    foreground: '#f0f4f8',       // hsl(210, 18%, 96%)
    card: '#1a1f2e',             // hsl(221, 18%, 15%)
    cardForeground: '#f0f4f8',   // hsl(210, 18%, 96%)
    primary: '#55b9e6',          // hsl(200, 90%, 63%)
    primaryForeground: '#ffffff',// hsl(222, 47%, 100%)
    secondary: '#181d2e',        // hsl(222, 34%, 14%)
    secondaryForeground: '#f0f4f8',
    muted: '#1a1f2c',            // hsl(222, 22%, 15%)
    mutedForeground: '#b8c4d0',  // hsl(210, 18%, 76%)
    accent: '#1c3a42',           // hsl(190, 60%, 18%)
    accentForeground: '#ffffff',
    destructive: '#d9364e',      // hsl(355, 75%, 52%)
    destructiveForeground: '#ffffff',
    border: '#1e2330',           // hsl(223, 20%, 18%)
    input: '#181d2b',            // hsl(221, 18%, 18%)
    ring: '#2196f3',             // hsl(205, 95%, 50%)
    medicalHeader: '#3399ff',    // hsl(213, 90%, 60%)
    medicalSection: '#181d2b',   // hsl(223, 18%, 13%)
    medicalComplete: '#1faf65',  // hsl(162, 80%, 45%)
    medicalPending: '#e8962d',   // hsl(42, 92%, 55%)
    accentBlue: '#55b9e6',
    accentPurple: '#7c4dff',
    accentPink: '#e8558c',
    accentTeal: '#2abfaa',
    accentAmber: '#e8962d',
  };

  // Define all meaningful text-on-background pairs used in the app
  const pairs: Array<{ fg: string; bg: string; element: string; context: string }> = [
    { fg: 'foreground', bg: 'background', element: 'body', context: 'Default text on background' },
    { fg: 'foreground', bg: 'card', element: '.card', context: 'Card content text' },
    { fg: 'cardForeground', bg: 'card', element: '.card', context: 'Card title/foreground' },
    { fg: 'primaryForeground', bg: 'primary', element: '.btn-primary', context: 'Primary button' },
    { fg: 'secondaryForeground', bg: 'secondary', element: '.btn-secondary', context: 'Secondary button' },
    { fg: 'mutedForeground', bg: 'muted', element: '.text-muted', context: 'Muted text on muted bg' },
    { fg: 'mutedForeground', bg: 'background', element: '.text-muted', context: 'Muted text on background' },
    { fg: 'mutedForeground', bg: 'card', element: '.text-muted', context: 'Muted text on card' },
    { fg: 'destructiveForeground', bg: 'destructive', element: '.btn-destructive', context: 'Destructive button' },
    { fg: 'accentForeground', bg: 'accent', element: '.badge-accent', context: 'Accent badge/text' },
    { fg: 'foreground', bg: 'medicalSection', element: '.medical-section', context: 'Medical section content' },
    { fg: 'medicalComplete', bg: 'background', element: '.status-complete', context: 'Complete status indicator' },
    { fg: 'medicalPending', bg: 'background', element: '.status-pending', context: 'Pending status indicator' },
    { fg: 'medicalHeader', bg: 'background', element: '.medical-header', context: 'Medical section header' },
    // Dark foregrounds on light backgrounds (for toasts, overlays, etc.)
    { fg: 'foreground', bg: 'border', element: '.border-text', context: 'Text on bordered areas' },
    // Disabled states
    { fg: 'mutedForeground', bg: 'muted', element: '.disabled', context: 'Disabled button text' },
  ];

  for (const pair of pairs) {
    const fgHex = colors[pair.fg];
    const bgHex = colors[pair.bg];
    if (!fgHex || !bgHex) continue;

    results.push(validateContrast(fgHex, bgHex, pair.element, pair.context));
  }

  const failures = results.filter((r) => !r.passesAA);
  const aaaPass = results.filter((r) => r.passesAAA).length;

  return {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    results,
    failures,
    summary: {
      total: results.length,
      aaPass: results.length - failures.length,
      aaaPass,
      failures: failures.length,
    },
  };
}

/**
 * Get accessible focus styles as a CSS string.
 * In production, this would be injected via a <style> tag.
 */
export function getFocusStyleOverrides(): string {
  return `
    /* WCAG 2.2 Focus Visible — 2.4.11 Focus Appearance */
    *:focus-visible {
      outline: 2px solid hsl(205, 95%, 50%) !important;
      outline-offset: 2px !important;
      border-radius: 4px;
    }

    /* Skip nav for keyboard users */
    .skip-to-content {
      position: absolute;
      left: -9999px;
      top: 0;
      z-index: 9999;
      padding: 8px 16px;
      background: hsl(200, 90%, 63%);
      color: white;
      font-weight: 600;
      border-radius: 0 0 4px 0;
    }
    .skip-to-content:focus {
      left: 0;
    }

    /* High-contrast mode overrides */
    @media (prefers-contrast: more) {
      :root {
        --border: 0 0% 40% !important;
        --muted-foreground: 0 0% 60% !important;
      }
    }

    /* Reduce motion */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
}

/**
 * Generate accessible label for a calculator or section.
 * Ensures screen readers get meaningful descriptions.
 */
export function accessibleLabel(
  name: string,
  description?: string,
  status?: 'complete' | 'pending' | 'error',
): string {
  const parts = [name];
  if (description) parts.push(description);
  if (status === 'complete') parts.push('Complete');
  else if (status === 'pending') parts.push('Pending input');
  else if (status === 'error') parts.push('Has errors');
  return parts.join(' — ');
}

/**
 * ARIA-live announcement for dynamic content changes.
 */
export function announceToScreenReader(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
  const id = 'stroke-aria-announce';
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.setAttribute('aria-live', politeness);
    el.setAttribute('aria-atomic', 'true');
    el.className = 'sr-only';
    document.body.appendChild(el);
  }
  el.textContent = '';
  // Use setTimeout to ensure the empty text is registered before new content
  setTimeout(() => {
    if (el) el.textContent = message;
  }, 50);
}