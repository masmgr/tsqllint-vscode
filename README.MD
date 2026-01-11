[![Build Status](https://travis-ci.org/nathan-boyd/tsqllint-vscode-extension.svg?branch=master)](https://travis-ci.org/nathan-boyd/tsqllint-vscode-extension)

# TSQLLint VS Code Extension

TSQLLint is a tool for describing, identifying, and reporting on undesirable patterns in TSQL scripts. This extension provides this functionality within VS Code.

## Installation

This extension may be installed from within VS Code or the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=tsqllint.tsqllint) of from the Extensions dialog in VS Code.

## Usage

After installation, this extension will activate when any .sql file is opened within VS Code. Potetial problems will be underlined in red and details will be available by hovering over the underline.

![Usage Example](images/usage-animation.gif?raw=true)

## Creating custom configurations

Configure tsqllint by creating a config file called ".tsqllintrc" in your $HOME directory in OSX or %HOMEPATH% directory in Windows.

Rules may be set to "off", "warning", or "error".

```json
{
    "rules": {
        "concat-strings": "error",
        "conditional-begin-end": "error",
        "cross-database-transaction": "error",
        "data-compression": "error",
        "data-type-length": "error",
        "disallow-cursors": "error",
        "full-text": "error",
        "information-schema": "error",
        "keyword-capitalization": "error",
        "linked-server": "error",
        "multi-table-alias": "error",
        "non-sargable": "error",
        "object-property": "error",
        "print-statement": "error",
        "schema-qualify": "error",
        "select-star": "error",
        "semicolon-termination": "error",
        "set-ansi": "error",
        "set-nocount": "error",
        "set-quoted-identifier": "error",
        "set-transaction-isolation-level": "error",
        "set-variable": "error",
        "upper-lower": "error"
    }
}
```

## Disabling Rules with Inline Comments

To temporarily disable rule warnings in a script, use comments in the following format:

```sql
/* tsqllint-disable */

SELECT * FROM FOO;

/* tsqllint-enable */
```

You can also disable or enable warnings for specific rules:

```sql
/* tsqllint-disable select-star */

SELECT * FROM FOO;

/* tsqllint-enable select-star */
```

To disable warnings for the entire script, place a /* tsqllint-disable */ comment at the top of the file:

```sql
/* tsqllint-disable */

SELECT * FROM FOO;
```

To disable specific rule warnings for the entire script place a comment similar to the following at the top of the file:

```sql
/* tsqllint-disable select-star */

SELECT * FROM FOO;
```

## Testing

This project includes three types of tests:

### Unit Tests
```bash
npm run test:unit
```
- Fast tests for individual components (error parsing, code actions, etc.)
- Uses mocking to avoid external dependencies
- Runs in < 10 seconds

### Integration Tests
```bash
npm run test:integration
```
- Tests VS Code extension infrastructure
- Verifies extension activation, command registration, and configuration
- Runs in < 30 seconds
- Does not require TSQLLint binary

### E2E Tests
```bash
npm run test:e2e
```
- End-to-end tests with actual TSQLLint binary download
- Tests complete linting workflow including binary initialization
- First run: ~2 minutes (includes binary download)
- Subsequent runs: ~30 seconds (uses cached binary)
- **Local execution only** (not included in CI)

#### E2E Test Categories
- Binary download and initialization
- Basic linting flow validation
- Error detection (select-star, semicolon-termination, keyword-capitalization)
- Multiple error detection
- Document change handling
- Code actions (disable rules)
- Inline disable comments

#### Running E2E Tests
```bash
# Standard execution
npm run test:e2e

# Verbose output
npm run test:e2e:verbose

# Clean cache and re-download binary
TSQLLINT_CLEAN_CACHE=true npm run test:e2e
```

### CI Pipeline
```bash
npm run test:ci
```
- Runs unit and integration tests only
- Completes in < 60 seconds
- No external binary downloads required

## Plugins

You can extend the base functionality of TSQLLint by creating a custom plugin. TSQLLint plugins are .Net assemblies that implement the IPlugin interface from TSQLLint.Common.

Details on plugin development may be found in the [TSQLLint](https://github.com/tsqllint/tsqllint#plugins) documentation
