const { defineConfig } = require("@vscode/test-cli");

module.exports = defineConfig([
  {
    label: "integration",
    files: "client/out/test/suite/**/*.test.js",
    version: "stable",
    launchArgs: ["--disable-extensions", "--disable-workspace-trust"],
    mocha: {
      ui: "tdd",
      timeout: 20000,
      color: true,
    },
  },
  {
    label: "e2e",
    files: "client/out/test/e2e/**/*.test.js",
    version: "stable",
    launchArgs: ["--disable-extensions", "--disable-workspace-trust"],
    mocha: {
      ui: "tdd",
      timeout: 120000,
      color: true,
    },
  },
]);
