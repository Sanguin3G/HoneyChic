# 006 — Central capabilities

**Decision:** A central registry distinguishes installed, enabled and configured, and derives available from all three. Installation is a code fact; typed store settings provide merchant preferences.

**Why:** Backend enforcement and frontend visibility need one source. Disabling customer accounts must preserve administration. Feature flags never alter migration history.

**Alternatives rejected:** Scattered checks lose consistency. A generic plugin framework is premature. Configuration for unimplemented providers would falsely imply usable features.
