# Code Archaeologist

A powerful Node.js CLI tool for exploring, analyzing, and auditing your local file systems and project directories.

## Features Currently Available

- **Directory Analysis**: Scan any directory to get a detailed breakdown of its contents.
- **Largest & Smallest Files**: Quickly identify massive files or empty/unnecessary ones.
- **Size Metrics**: See total sizes, largest folders, and file type distribution.
- **Beautiful CLI**: Enjoy a colorful, well-formatted terminal output.

## Installation

To use Code Archaeologist locally on your machine during development:

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

# Show the help menu
codearch --help
```

---

*Built with Node.js & JavaScript.*
