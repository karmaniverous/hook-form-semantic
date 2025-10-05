/**
 * Minimal logging interface accepted by components and hooks for optional diagnostics.
 *
 * Pass `console` or a custom logger that implements the standard Console methods.
 * Typical usage:
 * - debug: verbose diagnostic messages useful during development and tests
 * - log: general informational messages
 * - warn: non-fatal issues worth highlighting
 * - error: errors and assertions
 */
export type Logger = Pick<Console, 'debug' | 'log' | 'warn' | 'error'>;
