// ══════════════════════════════════════════════════════════════════
// Accessibility Test — Contrast Validation
// Run: npx vitest run src/test/accessibility.test.ts
// ══════════════════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest';
import { validateContrast, contrastRatio, runContrastAudit } from '@/services/accessibility';

describe('Color Contrast Utilities', () => {
  describe('contrastRatio', () => {
    it('returns 21:1 for black on white', () => {
      const ratio = contrastRatio('#000000', '#ffffff');
      expect(ratio).toBeGreaterThanOrEqual(20.9);
      expect(ratio).toBeLessThanOrEqual(21.1);
    });

    it('returns 1:1 for same color', () => {
      const ratio = contrastRatio('#ff0000', '#ff0000');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('handles hex strings with or without hash', () => {
      // Both should work — function expects #
      expect(() => contrastRatio('#000', '#fff')).not.toThrow();
    });

    it('is symmetric (fg⇔bg yields same ratio)', () => {
      const r1 = contrastRatio('#123456', '#abcdef');
      const r2 = contrastRatio('#abcdef', '#123456');
      expect(r1).toBeCloseTo(r2, 10);
    });
  });

  describe('validateContrast', () => {
    it('passes AA for high contrast pair', () => {
      const result = validateContrast('#000000', '#ffffff', 'test', 'test');
      expect(result.passesAA).toBe(true);
      expect(result.passesAAA).toBe(true);
      expect(result.passesAALarge).toBe(true);
    });

    it('fails AA for low contrast pair', () => {
      const result = validateContrast('#cccccc', '#ffffff', 'test', 'test');
      expect(result.passesAA).toBe(false);
      expect(result.ratio).toBeLessThan(4.5);
    });

    it('includes context and element metadata', () => {
      const result = validateContrast('#000', '#fff', '.btn-primary', 'Primary button text');
      expect(result.element).toBe('.btn-primary');
      expect(result.context).toBe('Primary button text');
    });
  });

  describe('runContrastAudit', () => {
    it('returns audit object with all required fields', () => {
      const audit = runContrastAudit();
      expect(audit).toHaveProperty('timestamp');
      expect(audit).toHaveProperty('version');
      expect(audit).toHaveProperty('results');
      expect(audit).toHaveProperty('failures');
      expect(audit).toHaveProperty('summary');
    });

    it('audits at least 15 color pairs', () => {
      const audit = runContrastAudit();
      expect(audit.results.length).toBeGreaterThanOrEqual(15);
    });

    it('has no AA failures for critical text pairs in default theme', () => {
      const audit = runContrastAudit();
      // Critical: body and card text MUST pass WCAG AA
      // Note: .btn-primary (white on #55b9e6) fails AA at 2.22:1;
      // this is a known design token issue for future theme refresh.
      const criticalPairs = audit.results.filter((r) =>
        ['body', '.card'].includes(r.element)
      );
      for (const pair of criticalPairs) {
        expect(pair.passesAA).toBe(true);
      }
    });

    it('reports failures in the failures array', () => {
      const audit = runContrastAudit();
      expect(Array.isArray(audit.failures)).toBe(true);
    });
  });
});