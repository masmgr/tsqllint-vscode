# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VS Code extension that integrates TSQLLint (a T-SQL linter) into VS Code. The extension uses the Language Server Protocol (LSP) with a client-server architecture.

## Build and Development Commands

```bash
# Install dependencies for all packages
npm run postinstall

# Compile both client and server
npm run compile

# Compile individual components
npm run compile:client
npm run compile:server

# Watch mode for development
npm run watch:client
npm run watch:server

# Lint the codebase
npm run lint

# Build for VS Code marketplace
npm run vscode:prepublish
```

## Architecture

### Client-Server Architecture

This extension follows the Language Server Protocol pattern with two separate modules:

**Client** ([client/src/extension.ts](client/src/extension.ts))
- Entry point: `activate()` function
- Initializes the Language Server Client
- Registers commands: `tsqlLint.fix` (auto-fix command)
- Handles communication between VS Code and the language server
- Applies text edits received from the server via the `_tsql-lint.change` command

**Server** ([server/src/server.ts](server/src/server.ts))
- Runs as a separate process communicating via IPC
- Handles document validation by spawning TSQLLint.Console
- Manages diagnostics and code actions
- Processes fix requests (`fix` notification)
- Implements auto-fix on save when `tsqlLint.autoFixOnSave` is enabled

### Key Server Components

**TSQLLintToolsHelper** ([server/src/TSQLLintToolsHelper.ts](server/src/TSQLLintToolsHelper.ts))
- Downloads and manages the TSQLLint runtime binaries (v1.11.0)
- Platform detection: macOS (osx-x64), Linux (linux-x64), Windows (win-x86, win-x64)
- Downloads from GitHub releases on first use
- Caches binaries in `<extension-root>/tsqllint/`

**Validation Flow** ([server/src/server.ts](server/src/server.ts))
1. Creates temporary file from document content (`TempFilePath()`)
2. Spawns platform-specific TSQLLint.Console binary via `LintBuffer()`
3. Parses stdout for error messages (`parseErrors()` from [server/src/parseError.ts](server/src/parseError.ts))
4. Converts errors to VS Code diagnostics
5. Sends diagnostics back to client
6. Cleans up temporary file

**Commands** ([server/src/commands.ts](server/src/commands.ts))
- Generates code actions for each diagnostic
- Creates "Disable rule for this line" actions (wraps with `/* tsqllint-disable rulename */`)
- Creates "Disable rule for this file" actions (adds comment at top of file)
- Code actions are triggered when user clicks on diagnostics

**Error Parsing** ([server/src/parseError.ts](server/src/parseError.ts))
- Parses TSQLLint output format: `(line,col): rule: message`
- Converts to LSP Range objects
- Highlights entire line from first non-whitespace to end

### Configuration

Extension contributes two settings:
- `tsqlLint.trace.server`: Debug LSP communication (off/messages/verbose)
- `tsqlLint.autoFixOnSave`: Auto-fix errors on save (default: false)

Command: `tsqlLint.fix` - Manually trigger auto-fix
- Keybinding: Ctrl+Alt+F (Windows/Linux), Shift+Cmd+F (macOS)

### Build Output

TypeScript compiles to:
- `client/out/` - Client code
- `server/out/` - Server code (specifically `server/out/server.js` is the entry point)

Both use ES2020 target with CommonJS modules.

## Important Implementation Details

### Text Edits (server.ts:71-80)

When applying workspace edits, use `{ uri, version }` identifier format instead of passing the full TextDocument object to `TextDocumentEdit.create()`. Passing TextDocument will cause vague "Unknown workspace edit change received" errors.

### Platform-Specific Binary Spawning

The server spawns different TSQLLint.Console binaries based on platform detection in `LintBuffer()`. On Windows, it also detects process architecture (ia32 vs x64).

### Auto-Fix Flow

When fix is requested (manual or on save):
1. `LintBuffer()` is called with `-x` flag
2. TSQLLint modifies the temporary file in-place
3. Server reads the fixed content from temp file
4. Returns entire document replacement as TextEdit (lines 0-10000)
5. Applied via workspace edit or willSaveWaitUntil

### Code Style

- ESLint configured with TypeScript ESLint plugin
- 2-space indentation
- Double quotes for strings
- Semicolons required
- Prefer arrow functions
- Max line length: 120 characters

## Testing

### Test Categories

#### Unit Tests (`npm run test:unit`)
- **Location:** `server/src/__tests__/*.test.ts`
- **Framework:** Mocha (TDD interface)
- **Characteristics:**
  - Fast, isolated tests with mocking (Sinon)
  - No external dependencies or binary downloads
  - Runs in < 10 seconds
  - No VS Code environment required
- **Test Files:**
  - `parseError.test.ts` - Error parsing logic (T-SQL output format parsing)
  - `commands.test.ts` - Code action generation (disable rules, edit formatting)
  - `TSQLLintToolsHelper.test.ts` - Platform detection and download logic (all network calls mocked)
  - `smoke.test.ts` - Basic sanity checks

#### Integration Tests (`npm run test:integration`)
- **Location:** `client/src/test/suite/*.test.ts`
- **Framework:** Mocha with VS Code Test API
- **Characteristics:**
  - Tests VS Code extension infrastructure
  - Requires VS Code test environment (vscode-test)
  - No TSQLLint binary required
  - Uses xvfb on Linux/CI environments
- **Test Files:**
  - `extension.test.ts` - Extension activation, command registration, configuration handling

#### CI Tests (`npm run test:ci`)
- Runs both unit and integration tests
- All tests complete in < 30 seconds
- No binary downloads required
- Runs in CI/CD pipeline (GitHub Actions)

### Running Tests

```bash
# Run all CI tests (unit + integration)
npm test
npm run test:ci

# Run only unit tests (fast, no VS Code)
npm run test:unit
npm run test:unit:watch       # Watch mode for development

# Run only integration tests (VS Code environment)
npm run test:integration

# Legacy aliases (backwards compatible)
npm run test:server           # Alias for test:unit
npm run test:server:watch     # Alias for test:unit:watch
npm run test:smoke            # Alias for test:integration
npm run test:all              # Alias for test:ci
```

### Test Configuration

**Server Tests** ([server/.mocharc.js](server/.mocharc.js))
- Uses Mocha with TDD interface (suite/test)
- Timeout: 10 seconds
- Reporter: spec (verbose output)
- Test discovery: `out/__tests__/*.test.js` (compiled from TypeScript)

**Client Tests** ([.vscode-test.js](.vscode-test.js))
- Uses VS Code Test CLI with Mocha
- Timeout: 20 seconds
- Launches VS Code with disabled extensions
- Test discovery: `client/out/test/**/*.test.js` (compiled from TypeScript)

### Test Dependencies

- **Mocha:** Test framework (10.8.2)
- **Sinon:** Mocking and stubbing (19.0.2)
- **VS Code Test CLI:** Client test runner (0.0.10)
- **VS Code Test Electron:** VS Code test environment (2.4.1)

### Adding New Tests

1. **Unit Tests:** Create `.test.ts` file in `server/src/__tests__/` directory
   - Use Mocha TDD interface (`suite()`, `test()`, `setup()`, `teardown()`)
   - Use Sinon for mocking external dependencies
   - Keep tests fast and isolated

2. **Integration Tests:** Create `.test.ts` file in `client/src/test/suite/` directory
   - Use VS Code API for testing extension behavior
   - Use Mocha TDD interface
   - Keep timeout reasonable (20-30 seconds max per test)

### Notes on Test Design

- **No TSQLLint binary downloads in CI:** All download/network operations are mocked using Sinon
- **No platform-specific CI tests:** Server tests mock platform detection to be OS-independent
- **Full coverage without external dependencies:** Tests focus on logic and integration patterns, not on external tool functionality
