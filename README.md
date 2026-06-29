<div align="center">

# Otak File Meter

**Compact file size and line count badges for the VS Code Explorer.**  
otak-filemeter adds lightweight Explorer decorations so you can scan file weight without opening files.

[![VS Marketplace](https://img.shields.io/visual-studio-marketplace/v/odangoo.otak-filemeter?label=Marketplace&color=1d4ed8)](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-filemeter)
[![VS Code engine](https://img.shields.io/badge/VS%20Code-%5E1.125.0-007acc)](https://code.visualstudio.com/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-otak--filemeter-24292f)](https://github.com/tsuyoshi-otake/otak-filemeter)

![Local processing](https://img.shields.io/badge/processing-local-0f766e)
![No telemetry](https://img.shields.io/badge/telemetry-none-64748b)
![Explorer badges](https://img.shields.io/badge/Explorer-badges-2563eb)

[**Install**](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-filemeter) ·
[**GitHub**](https://github.com/tsuyoshi-otake/otak-filemeter) ·
[**Report an issue**](https://github.com/tsuyoshi-otake/otak-filemeter/issues)

</div>

---

VS Code's built-in Explorer does not expose a public API for adding arbitrary table columns. otak-filemeter uses the supported decoration API instead: each file gets a compact badge, and exact details are available from the hover tooltip.

## Capabilities

- **File size badges**: shows compact badges such as `B`, `1K`, `12K`, or `2M`.
- **Exact size tooltips**: hover a decorated file to see the exact formatted size.
- **Line count mode**: switch the badge from file size to text line count.
- **Optional line count tooltips**: keep size badges while adding line counts to the hover tooltip.
- **Bounded reads**: line counting skips files larger than the configured byte limit.
- **Binary guard**: files with NUL bytes in the initial sample are skipped for line counting.
- **Local only**: no telemetry, no network calls, and no workspace writes.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `otakFilemeter.enabled` | `true` | Enables Explorer file metric badges. |
| `otakFilemeter.badgeMetric` | `size` | Use `size` for file size badges or `lines` for line count badges. |
| `otakFilemeter.showLineCountInTooltip` | `false` | Adds line counts to file size tooltips when files are small enough to inspect. |
| `otakFilemeter.maxLineCountBytes` | `1048576` | Maximum file size read for line counting. Set to `0` to disable line counting. |

## Commands

| Command | Description |
| --- | --- |
| `Otak File Meter: Refresh File Meter Badges` | Clears cached metrics and asks VS Code to refresh Explorer decorations. |

## Notes

Explorer decoration badges are intentionally compact because VS Code reserves only a small amount of space for them. For exact values, hover the file.

Line counting reads file contents, so otak-filemeter only does it when line counts are enabled through `otakFilemeter.badgeMetric` or `otakFilemeter.showLineCountInTooltip`.

## Requirements

- VS Code **1.125.0** or newer

## Installation

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-filemeter), or run:

```text
ext install odangoo.otak-filemeter
```

<details>
<summary><strong>Build from source (VSIX)</strong></summary>

```bash
npm install
npm run package
code --install-extension otak-filemeter-0.1.0.vsix
```

Reload VS Code afterwards if the Explorer was already open.

</details>

## Security & Privacy

- **No telemetry**: no analytics, identifiers, or usage tracking.
- **No network calls**: it never uploads file names or file contents.
- **No workspace writes**: it reads metadata, and optionally small file contents, only to decorate the Explorer.
- **Bounded line counting**: large files are skipped by default.

## Related Extensions

More VS Code extensions by [odangoo](https://marketplace.visualstudio.com/publishers/odangoo):

| Extension | Description |
| --- | --- |
| [**otak-paste**](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-paste) | Paste optimized screenshots into Markdown assets |
| [**otak-proxy**](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-proxy) | One-click proxy switching for VS Code, Git, npm, and integrated terminals |
| [**otak-monitor**](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-monitor) | Real-time CPU, memory, and disk usage in the status bar |
| [**otak-committer**](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-committer) | AI-assisted commit messages, pull requests, and issues |
| [**otak-clipboard**](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-clipboard) | Copy a folder or the current tab to your clipboard in two clicks |
| [**otak-clock**](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-clock) | Dual time-zone clock for the status bar |
| [**otak-zen**](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-zen) | A calm, distraction-free Zen mode for VS Code |
| [**otak-lsp**](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-lsp) | Japanese morphological analysis with grammar checks, semantic highlights, and hovers |
| [**otak-usage**](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-usage) | At-a-glance usage statistics for VS Code |

## License

Released under the [MIT License](LICENSE).

<div align="center">
<br>
<sub>Built by <a href="https://github.com/tsuyoshi-otake">tsuyoshi-otake</a> · <a href="https://marketplace.visualstudio.com/items?itemName=odangoo.otak-filemeter">Marketplace</a> · <a href="https://github.com/tsuyoshi-otake/otak-filemeter">GitHub</a> · <a href="https://github.com/tsuyoshi-otake/otak-filemeter/issues">Issues</a></sub>
</div>
