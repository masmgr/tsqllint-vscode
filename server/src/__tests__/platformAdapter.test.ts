import * as assert from "assert";
import * as os from "os";
import * as sinon from "sinon";
import { NodePlatformAdapter } from "../platform/PlatformAdapter";

function setProcessArch(arch: string): void {
  Object.defineProperty(process, "arch", {
    value: arch,
    writable: false,
    enumerable: true,
    configurable: true,
  });
}

suite("PlatformAdapter", () => {
  const originalArch = process.arch;

  teardown(() => {
    sinon.restore();
    setProcessArch(originalArch);
  });

  test("should map macOS to osx-x64", () => {
    sinon.stub(os, "type").returns("Darwin");
    const adapter = new NodePlatformAdapter();
    assert.strictEqual(adapter.getPlatform(), "osx-x64");
  });

  test("should map Linux to linux-x64", () => {
    sinon.stub(os, "type").returns("Linux");
    const adapter = new NodePlatformAdapter();
    assert.strictEqual(adapter.getPlatform(), "linux-x64");
  });

  test("should map Windows ia32 to win-x86", () => {
    sinon.stub(os, "type").returns("Windows_NT");
    setProcessArch("ia32");
    const adapter = new NodePlatformAdapter();
    assert.strictEqual(adapter.getPlatform(), "win-x86");
  });

  test("should map Windows x64 to win-x64", () => {
    sinon.stub(os, "type").returns("Windows_NT");
    setProcessArch("x64");
    const adapter = new NodePlatformAdapter();
    assert.strictEqual(adapter.getPlatform(), "win-x64");
  });

  test("should build binary path from platform", () => {
    const adapter = new NodePlatformAdapter();
    const stub = sinon.stub(adapter, "getPlatform").returns("linux-x64");
    const binaryPath = adapter.getBinaryPath("/base");
    assert.strictEqual(binaryPath, "/base/linux-x64/TSQLLint.Console");
    stub.restore();
  });

  test("should return temp directory", () => {
    const tmpStub = sinon.stub(os, "tmpdir").returns("/tmp");
    const adapter = new NodePlatformAdapter();
    assert.strictEqual(adapter.getTempDirectory(), "/tmp");
    tmpStub.restore();
  });
});
