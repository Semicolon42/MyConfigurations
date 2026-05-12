# MyConfigurations

Personal collection of configs, scripts, and tools to streamline my development environment.

## Contents

### `terminal/`
Shell configuration files (`.zshrc` / `.bash_profile`) and iTerm2 setup notes for macOS. Covers natural text editing keybindings, unlimited scrollback, and session directory persistence.

### `git/`
Git aliases in `git_alias.md` — shortcuts for common workflows like `git up` (fetch + rebase all tracking branches).

### `gamemaker/`
Reusable GML scripts for GameMaker projects.

### `brendan-tool/`
A personal Node.js CLI (`b-tools`) for git branch automation. See [`b-tool/README.md`](brendan-tool/README.md) for installation and usage.

**Quick start:**
```bash
cd b-tools && pnpm install && pnpm link --global
b-tools --help
```
