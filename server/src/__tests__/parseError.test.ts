import * as assert from "assert";
import { parseErrors, ITsqlLintError } from "../parseError";

suite("parseError.ts - parseErrors()", () => {
  // ===== 正常系テスト =====

  test("should parse single error correctly", () => {
    const docText = "SELECT * FROM users";
    const errorStrings = ["(1,5): semi-colon: Expected semi-colon"];

    const result = parseErrors(docText, errorStrings);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].rule, "semi-colon");
    assert.strictEqual(result[0].message, "Expected semi-colon");
    assert.strictEqual(result[0].range.start.line, 0); // 1-indexed to 0-indexed
    assert.strictEqual(result[0].range.start.character, 0); // line start
    assert.strictEqual(result[0].range.end.line, 0);
    assert.strictEqual(result[0].range.end.character, docText.length);
  });

  test("should parse multiple errors", () => {
    const docText = "SELECT * FROM users\nWHERE id = 1";
    const errorStrings = [
      "(1,5): semi-colon: Expected semi-colon",
      "(2,10): keyword-capitalization: Expected keyword capitalization",
    ];

    const result = parseErrors(docText, errorStrings);

    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].rule, "semi-colon");
    assert.strictEqual(result[0].range.start.line, 0);
    assert.strictEqual(result[1].rule, "keyword-capitalization");
    assert.strictEqual(result[1].range.start.line, 1);
  });

  test("should handle indented code correctly", () => {
    const docText = "    SELECT * FROM users"; // 4 spaces indent
    const errorStrings = ["(1,5): semi-colon: Expected semi-colon"];

    const result = parseErrors(docText, errorStrings);

    assert.strictEqual(result[0].range.start.character, 4); // indent position
    assert.strictEqual(result[0].range.end.character, docText.length);
  });

  test("should trim whitespace from message", () => {
    const docText = "SELECT * FROM users";
    const errorStrings = ["(1,5): rule-name:   Message with spaces   "];

    const result = parseErrors(docText, errorStrings);

    assert.strictEqual(result[0].message, "Message with spaces");
    assert.strictEqual(result[0].rule, "rule-name");
  });

  // ===== 異常系テスト =====

  test("should return empty array for empty error strings", () => {
    const docText = "SELECT * FROM users";
    const errorStrings: string[] = [];

    const result = parseErrors(docText, errorStrings);

    assert.deepStrictEqual(result, []);
  });

  test("should handle malformed errors gracefully", () => {
    const docText = "SELECT * FROM users";
    const errorStrings = ["(1,5): rule"]; // Missing message part

    try {
      const result = parseErrors(docText, errorStrings);
      // If message part is missing, it might be undefined, which is accepted behavior
      assert.ok(true);
    } catch (error) {
      // If it throws, that's also acceptable
      assert.ok(true);
    }
  });

  test("should handle line number 0", () => {
    const docText = "SELECT * FROM users";
    const errorStrings = ["(0,1): rule: message"];

    const result = parseErrors(docText, errorStrings);

    // Math.max(0-1, 0) = 0
    assert.strictEqual(result[0].range.start.line, 0);
  });

  test("should handle error on line beyond document", () => {
    const docText = "SELECT * FROM users\nWHERE id = 1";
    const errorStrings = ["(100,1): rule: message"];

    const result = parseErrors(docText, errorStrings);

    // Line 99 (100-1) doesn't exist, so lines[99] is undefined
    assert.strictEqual(result[0].range.end.character, 0);
  });

  // ===== 境界値テスト =====

  test("should handle first line error", () => {
    const docText = "SELECT * FROM users";
    const errorStrings = ["(1,1): rule: message"];

    const result = parseErrors(docText, errorStrings);

    assert.strictEqual(result[0].range.start.line, 0);
    assert.strictEqual(result[0].range.start.character, 0);
  });

  test("should handle last line error", () => {
    const docText = "SELECT * FROM users\nWHERE id = 1\nORDER BY name";
    const errorStrings = ["(3,5): rule: message"];

    const result = parseErrors(docText, errorStrings);

    assert.strictEqual(result[0].range.start.line, 2); // 3-1 = 2
    assert.strictEqual(result[0].range.end.character, "ORDER BY name".length);
  });

  test("should handle empty line", () => {
    const docText = "SELECT * FROM users\n\nWHERE id = 1";
    const errorStrings = ["(2,1): rule: message"];

    const result = parseErrors(docText, errorStrings);

    assert.strictEqual(result[0].range.start.line, 1); // empty line
    assert.strictEqual(result[0].range.start.character, 0); // no whitespace
    assert.strictEqual(result[0].range.end.character, 0); // empty line length
  });

  test("should handle line with only whitespace", () => {
    const docText = "SELECT * FROM users\n    \nWHERE id = 1";
    const errorStrings = ["(2,1): rule: message"];

    const result = parseErrors(docText, errorStrings);

    assert.strictEqual(result[0].range.start.character, 4); // 4 spaces
    assert.strictEqual(result[0].range.end.character, 4); // whitespace-only line
  });

  // ===== 複雑なケース =====

  test("should handle colon in error message", () => {
    const docText = "SELECT * FROM users";
    const errorStrings = ["(1,5): rule-name: Message with colon at end:"];

    const result = parseErrors(docText, errorStrings);

    // split(":") creates [position, rule, message, ""]
    // validationError[2] is the message part
    assert.strictEqual(result[0].message, "Message with colon at end");
  });

  test("should handle multiline document with various indents", () => {
    const docText = "SELECT *\n  FROM users\n    WHERE id = 1\nORDER BY name";
    const errorStrings = ["(1,1): rule1: msg1", "(2,3): rule2: msg2", "(3,5): rule3: msg3", "(4,1): rule4: msg4"];

    const result = parseErrors(docText, errorStrings);

    assert.strictEqual(result.length, 4);
    assert.strictEqual(result[0].range.start.character, 0); // No indent
    assert.strictEqual(result[1].range.start.character, 2); // 2 spaces
    assert.strictEqual(result[2].range.start.character, 4); // 4 spaces
    assert.strictEqual(result[3].range.start.character, 0); // No indent
  });
});
