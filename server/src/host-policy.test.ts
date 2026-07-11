import { describe, expect, it } from 'vitest';
import { resolveLoopbackHost } from './host-policy.js';

describe('resolveLoopbackHost', () => {
  it('accepts loopback hosts', () => {
    expect(resolveLoopbackHost('127.0.0.1')).toBe('127.0.0.1');
    expect(resolveLoopbackHost('localhost')).toBe('localhost');
  });

  it('rejects externally reachable hosts', () => {
    expect(() => resolveLoopbackHost('0.0.0.0')).toThrow('HOST must stay on loopback');
  });
});
