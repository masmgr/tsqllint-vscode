const path = require("path");
const { defineConfig } = require("@vscode/test-cli");

const extensionDevelopmentPath = __dirname;
const workspaceFolder = __dirname;
const clientOutTest = "client/out/test";

module.exports = defineConfig([
  {
    label: "integration",
    files: `${clientOutTest}/suite/extension.test.js`,
    extensionDevelopmentPath,
    workspaceFolder,
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
    files: `${clientOutTest}/e2e/suite/e2e.test.js`,
    extensionDevelopmentPath,
    workspaceFolder,
    version: "stable",
    launchArgs: ["--disable-extensions", "--disable-workspace-trust"],
    mocha: {
      ui: "tdd",
      timeout: 120000,
      color: true,
    },
  },
]);
