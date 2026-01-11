module.exports = {
  require: ["ts-node/register"],
  spec: ["src/__tests__/**/*.test.ts"],
  ui: "tdd",
  timeout: 10000,
  color: true,
  reporter: "spec",
};
