// Vitest runs page/component tests in plain Node, without Next's bundler-level
// enforcement of "server-only" imports, the real package throws unconditionally
// outside that bundler, which would fail any test that transitively imports a
// server-only module. Aliased in vitest.config.mts instead.
export {};
