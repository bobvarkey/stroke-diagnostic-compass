/// <reference types="node" />
// Opt-in live regression: RUN_DATABASE_SECURITY_TESTS=1 bun run test -- src/test/strokeEmergencyAccess.integration.test.ts
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

type Policy = { tablename: string; cmd: string; qual: string | null; with_check: string | null; roles: string };
const enabled = process.env.RUN_DATABASE_SECURITY_TESTS === '1';

describe.skipIf(!enabled)('Live emergency-record access rules', () => {
  const getPolicies = (): Policy[] => {
    const result = execFileSync('lovable', ['supabase', 'query',
      "SELECT tablename, cmd, qual, with_check, roles FROM pg_policies WHERE schemaname='public' AND tablename IN ('stroke_activations','stroke_call_logs')", '--json'], { encoding: 'utf8' });
    return (JSON.parse(result) as { rows: Policy[] }).rows;
  };

  it('only administrators may insert activations', () => {
    const policies = getPolicies().filter(p => p.tablename === 'stroke_activations' && ['INSERT', 'ALL'].includes(p.cmd));
    expect(policies).toHaveLength(1);
    expect(policies[0]?.roles).toBe('{authenticated}');
    expect(policies[0]?.with_check).toBe("has_role(auth.uid(), 'admin'::app_role)");
  });

  it('only administrators may read activation history', () => {
    const policies = getPolicies().filter(p => p.tablename === 'stroke_activations' && ['SELECT', 'ALL'].includes(p.cmd));
    expect(policies).toHaveLength(1);
    expect(policies[0]?.roles).toBe('{authenticated}');
    expect(policies[0]?.qual).toBe("has_role(auth.uid(), 'admin'::app_role)");
  });

  it('only administrators may insert call logs', () => {
    const policies = getPolicies().filter(p => p.tablename === 'stroke_call_logs' && ['INSERT', 'ALL'].includes(p.cmd));
    expect(policies).toHaveLength(1);
    expect(policies[0]?.roles).toBe('{authenticated}');
    expect(policies[0]?.with_check).toBe("has_role(auth.uid(), 'admin'::app_role)");
  });
});