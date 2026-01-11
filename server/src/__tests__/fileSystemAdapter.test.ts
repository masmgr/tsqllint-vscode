import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { NodeFileSystemAdapter } from "../platform/FileSystemAdapter";

suite("FileSystemAdapter", () => {
  test("should create, write, read, and delete a file", async () => {
    const adapter = new NodeFileSystemAdapter();
    const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "tsqllint-test-"));
    const filePath = path.join(tempDir, "sample.txt");

    await adapter.writeFile(filePath, "hello");
    assert.strictEqual(await adapter.exists(filePath), true);

    const content = await adapter.readFile(filePath);
    assert.strictEqual(content, "hello");

    await adapter.deleteFile(filePath);
    assert.strictEqual(await adapter.exists(filePath), false);

    await fs.promises.rm(tempDir, { recursive: true, force: true });
  });

  test("should create directories recursively", async () => {
    const adapter = new NodeFileSystemAdapter();
    const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "tsqllint-test-"));
    const nestedDir = path.join(tempDir, "nested", "path");

    await adapter.createDirectory(nestedDir);
    const stat = await fs.promises.stat(nestedDir);
    assert.strictEqual(stat.isDirectory(), true);

    await fs.promises.rm(tempDir, { recursive: true, force: true });
  });
});
