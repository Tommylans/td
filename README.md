# td (TODO Tracker)

Have you ever been working on a project and wanted to quickly see all the TODOs and FIXMEs in your current changes, without the noise of every single TODO in the entire codebase? I've been searching for this for almost a year and never found a good solution - so I built one! This tool specifically shows TODOs and FIXMEs only in your unstaged/staged changes and new files, making it perfect for managing tasks during active development.

A terminal-based TODO tracker that helps you monitor and manage TODOs in your git repository. It provides a beautiful terminal user interface (TUI) to view and navigate through TODOs and FIXMEs in your changed files.

## Features

- 🔍 Tracks TODOs in both staged/unstaged changes and untracked files
- 🎨 Beautiful terminal UI with syntax highlighting
- 🖱️ Mouse and keyboard navigation support
- 🔗 Quick file opening at the exact TODO location
- 🎯 Supports both TODO: and FIXME: comments
- 🔄 Real-time refresh capability

## Installation

Make sure you have [Bun](https://bun.sh) installed on your system, then:

```bash
# Clone the repository
git clone [your-repo-url]
cd td

# Install dependencies
bun install
```

## Usage

Run the application:
```bash
bun start
```

For development with auto-reload:
```bash
bun dev
```

### Controls

- Use **↑** and **↓** arrow keys or mouse to navigate through TODOs
- Press **Enter** or click to open a file at the TODO location
- Press **r** to refresh the TODO list
- Press **q**, **Escape**, or **Ctrl+C** to exit

## Development

Build the project:
```bash
bun run build
```

Format code:
```bash
bun run format
```

## Dependencies

- [blessed](https://github.com/chjj/blessed) - Terminal UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety and modern JavaScript features
- [Biome](https://biomejs.dev/) - Code formatting and linting

## Requirements

- [Bun](https://bun.sh) runtime
- Git repository
- Terminal that supports colors and basic mouse events

## Global Usage

To use `td` from any directory on your system, you can set up an alias. Choose one of the following methods based on your shell:

### For Bash/Zsh users
Add this line to your `~/.bashrc` or `~/.zshrc`:
```bash
alias td='(cd /path/to/td && bun start)'
```

The parentheses `(...)` create a subshell, so the directory change only happens temporarily and doesn't affect your current working directory.

After adding the alias:
1. Replace `/path/to/td` with the actual path where you cloned the repository
2. Reload your shell configuration:
   - Bash: `source ~/.bashrc`
   - Zsh: `source ~/.zshrc`

Now you can simply type `td` in any directory to launch the TODO tracker, and it will scan the TODOs in your current directory!

## License

MIT License

Copyright (c) 2024 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
