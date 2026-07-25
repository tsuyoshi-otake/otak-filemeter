# Change Log

## [0.1.9] - 2026-07-26

### Changed
- Count the lines of a file a chunk at a time instead of reading it whole, so measuring holds 64 KB regardless of how large the file is, and stop reading as soon as the content turns out to be binary (#3).
- Answer from an open editor's own line count when it matches what is on disk, so a file VS Code already holds in memory is never read again (#3).
- Never open files whose type can only be binary, and cap reads in flight at 4, so revealing a folder does not arrive at an on-access virus scanner as a burst (#3).
- Count newlines with an indexed loop rather than a typed-array iterator, which measures 2.7 GB/s against 145 MB/s (#3).
- Read the settings once and keep them until they change, rather than once per decorated file (#3).
- Announce file changes as one event per 100 ms, and redraw everything instead of listing them past 256 files, so a build or a branch switch is one round trip rather than thousands (#3).
- Remember measurements as sizes and line counts, capped at 4096 files, instead of keeping every decoration ever built (#3).

## [0.1.8] - 2026-06-30

### Changed
- Updated the extension icon and repackaged the release.

## [0.1.7] - 2026-06-30

### Changed
- Repackaged the extension release.

## [0.1.6] - 2026-06-30

### Changed
- Repackaged the extension release.

## [0.1.5] - 2026-06-29

### Changed
- Moved file metrics into Explorer decoration tooltips with line count and file size.
- Uses a short `i` decoration badge so VS Code has a decoration target for the tooltip.

## [0.1.4] - 2026-06-29

### Changed
- Returned Explorer badges to size-only display, such as `5KB` or `1MB`.
- Removed line count settings and file content reads.

## [0.1.3] - 2026-06-29

### Fixed
- Activated the extension immediately so Explorer badges appear without needing to run a command after installing the VSIX.

## [0.1.2] - 2026-06-29

### Changed
- Repackaged the combined line count and file size badge build.

## [0.1.1] - 2026-06-29

### Changed
- Changed the default Explorer badge to show line count and file size together, such as `100L 5KB`.
- Kept size-only fallback for files that are too large to count or look like binary content.

## [0.1.0] - 2026-06-29

### Added
- Added Explorer file decorations for compact file size badges.
- Added localized package metadata for English and Japanese.
