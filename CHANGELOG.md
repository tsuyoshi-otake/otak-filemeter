# Change Log

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
