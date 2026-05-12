# b-tools

A personal Node.js CLI tool for git branch automation. Built as a learning project to practice ES Modules, `execa`, and promise-based async/await patterns.

## Commands

### `git-sync`
Fetches all remotes and pulls every local branch that has a remote tracking branch. Returns you to your original branch when done.

### `git-clean`
Shows an interactive checkbox list of all local branches with their remote tracking status. Branches whose remote has been deleted (`[gone]`) are pre-selected. Prompts for confirmation before deleting anything.

---

## Setup

**Install dependencies:**
```bash
pnpm install
```

**Make globally available on your machine:**
```bash
chmod +x bin/cli.js
pnpm link --global
```

---

## Common Commands

**Run a command directly (without global install):**
```bash
node bin/cli.js git-sync
node bin/cli.js git-clean
```

**Run via global install:**
```bash
b-tools git-sync
b-tools git-clean
```

**See all available commands:**
```bash
b-tools --help
```

**Lint the codebase:**
```bash
pnpm lint
```

**Auto-format the codebase:**
```bash
pnpm format
```

---

## Project Structure

```
bin/
  cli.js              Entry point, command registration
src/
  commands/
    gitSync.js        git-sync implementation
    gitClean.js       git-clean implementation
  utils/
    shell.js          execa wrapper (run, runSafe)
```

## Stack

- [commander](https://github.com/tj/commander.js) — CLI argument parsing
- [execa](https://github.com/sindresorhus/execa) — promise-based subprocess execution
- [@inquirer/prompts](https://github.com/SBoudrias/Inquirer.js) — interactive terminal prompts
- [eslint](https://eslint.org) — linting
- [prettier](https://prettier.io) — formatting
