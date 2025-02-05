import { exec } from 'node:child_process'
import * as fs from 'node:fs'
import { promisify } from 'node:util'
import * as blessed from 'blessed'

const execPromise = promisify(exec)

interface TodoEntry {
  file: string
  line: number
  content: string
}

const prefixes = ['TODO:', 'FIXME:']

/**
 * Extracts TODO entries from the diff of tracked files using `git diff -U0`.
 * It only considers the changed lines.
 */
async function getDiffTodos(): Promise<TodoEntry[]> {
  try {
    const { stdout } = await execPromise('git diff -U0')
    const lines = stdout.split('\n')
    let currentFile = ''
    let currentLineNumber = 0
    const todos: TodoEntry[] = []
    const fileHeaderRegex = /^diff --git a\/.+ b\/(.+)$/
    const hunkHeaderRegex = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/

    for (const line of lines) {
      const fileHeaderMatch = fileHeaderRegex.exec(line)
      const hunkHeaderMatch = hunkHeaderRegex.exec(line)

      if (fileHeaderMatch) {
        currentFile = fileHeaderMatch[1]
      } else if (hunkHeaderMatch) {
        currentLineNumber = Number.parseInt(hunkHeaderMatch[1], 10)
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        const content = line.slice(1).trim()
        if (prefixes.some((prefix) => content.includes(prefix))) {
          todos.push({
            file: currentFile,
            line: currentLineNumber,
            content,
          })
        }
        currentLineNumber++
      } else if (!line.startsWith('-') && !line.startsWith('@@') && !line.startsWith('---')) {
        currentLineNumber++
      }
    }
    return todos
  } catch (error) {
    console.error('Error running git diff:', error)
    return []
  }
}

/**
 * Scans newly created (untracked) files for TODO comments.
 * Since the file is new, we scan the entire file.
 */
async function getUntrackedTodos(): Promise<TodoEntry[]> {
  try {
    const { stdout } = await execPromise('git ls-files --others --exclude-standard')
    const files = stdout.split('\n').filter((line) => line.trim() !== '')
    const todos: TodoEntry[] = []

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8')
        const fileLines = content.split('\n')
        fileLines.forEach((lineContent, idx) => {
          if (prefixes.some((prefix) => lineContent.includes(prefix))) {
            todos.push({
              file,
              line: idx + 1,
              content: lineContent.trim(),
            })
          }
        })
      } catch (err) {
        console.error(`Error reading untracked file ${file}:`, err)
      }
    }
    return todos
  } catch (error) {
    console.error('Error listing untracked files:', error)
    return []
  }
}

/**
 * Combines the TODOs from both tracked (via diff) and untracked files.
 */
async function getChangedTodos(): Promise<TodoEntry[]> {
  const diffTodos = await getDiffTodos()
  const untrackedTodos = await getUntrackedTodos()
  return diffTodos.concat(untrackedTodos)
}

/**
 * Opens a file at a specific line using Cursor.
 * Modify the command if you use a different editor.
 */
function openFileAtLine(file: string, line: number) {
  const command = `cursor -g ${file}:${line}`
  exec(command, (err) => {
    if (err) {
      console.error('Error opening file:', err)
    }
  })
}

/**
 * Refreshes the blessed list with the latest changed TODO entries.
 */
async function refreshList(list: blessed.Widgets.ListElement) {
  list.setItems(['Loading todos...'])
  list.screen.render()
  const todos = await getChangedTodos()
  if (todos.length === 0) {
    list.setItems(['No changed TODOs found.'])
  } else {
    // Use blessed markup for colored output with different colors for TODO and FIXME
    const items = todos.map((todo) => {
      const content = todo.content
      let coloredContent = `{blue-fg}${content}{/blue-fg}`

      // Replace TODO: with yellow highlight
      if (content.includes('TODO:')) {
        coloredContent = coloredContent.replace('TODO:', '{yellow-fg}TODO:{/yellow-fg}')
      }
      // Replace FIXME: with red highlight
      if (content.includes('FIXME:')) {
        coloredContent = coloredContent.replace('FIXME:', '{red-fg}FIXME:{/red-fg}')
      }

      const filename = todo.file.split('/').pop()

      return `{green-fg}${filename}{/green-fg}:{yellow-fg}${todo.line}{/yellow-fg} - ${coloredContent}`
    })
    list.setItems(items)
  }
  list.screen.render()
}

/**
 * Creates the TUI using blessed.
 * - Press **r** to refresh the TODO list.
 * - Press **q**, **Escape** or **Ctrl+C** to exit.
 * - Selecting an item opens the file at the specified line.
 */
function createTUI() {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'TODOs',
  })

  const list = blessed.list({
    parent: screen,
    label: ' TODOs ',
    width: '100%',
    height: '100%',
    keys: true,
    mouse: true,
    border: 'line',
    // Enable tags for blessed markup
    tags: true,
    style: {
      selected: {
        bg: 'blue',
      },
    },
  })

  list.focus()

  // Bind refresh key.
  screen.key(['r', 'R'], async () => {
    await refreshList(list)
  })

  // Bind quit keys.
  screen.key(['escape', 'q', 'C-c'], () => process.exit(0))

  // When an item is selected, open the corresponding file.
  list.on('select', async (_item, index) => {
    // Re-run the combined diff to get the latest TODOs (could be optimized by caching).
    const todos = await getChangedTodos()
    if (todos[index]) {
      openFileAtLine(todos[index].file, todos[index].line)
    }
  })

  // Do an initial refresh.
  refreshList(list)

  screen.render()
}

createTUI()
