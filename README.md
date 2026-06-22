# Code Archaeologist

A powerful, fast, and colorful Node.js CLI tool for exploring, analyzing, and auditing your local file systems and project directories.

Whether you're onboarding to a massive new codebase or just cleaning up an old side project, Code Archaeologist acts as an instant "X-ray" for your code.

## Features

- **Visual Tree View**: Instantly see your project's architecture beautifully mapped out.
- **Lines of Code (LOC) Counter**: Calculates exactly how much code you've written across all text and source files.
- **TODO Scanner**: Automatically hunts down and highlights forgotten `TODO`, `FIXME`, `BUG`, `HACK`, and `NOTE` comments, giving you exact line numbers.
- **package.json Analyzer**: Reads your project's dependencies, dev-dependencies, and scripts instantly.
- **Code Repetitions Tracker**: Detects duplicated logic and repeated lines across your codebase to help you write DRY (Don't Repeat Yourself) code.
- **Cleanup Metrics**: Identifies the largest files, largest folders, smallest files, and entirely empty files so you can clean up bloat.
- **Report Export**: Dump your entire project analysis into a clean, machine-readable `codearch-report.json` file.

## Installation

To use Code Archaeologist locally on your machine:

1. Clone or download this repository.
2. Navigate into the project folder:

   ```bash
   cd "Code Archaeologist"
   ```

3. Install dependencies and link the package globally:

   ```bash
   npm install
   npm link
   ```

## Usage

Once installed, you can run the `codearch` command from anywhere in your terminal!

```bash
# Scan the current directory
codearch .

# Scan a specific folder
codearch src
codearch "C:\Projects\My App"
```

### Options & Flags

| Flag | Description |
|---|---|
| `--tree` | **Show Directory Tree**: Skips the metrics and outputs a beautiful visual tree of your file structure. |
| `--stats` | **Show Project Stats**: (Default) Displays all sizes, LOC, scanners, and repetition metrics. |
| `--export` | **Export JSON**: Generates a `codearch-report.json` file with all the metrics for programmatic use. |
| `--help` | **Help Menu**: Shows the CLI usage guide and options. |

---

*Built with Node.js & JavaScript.*
