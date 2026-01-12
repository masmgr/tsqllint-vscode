import { spawn, ChildProcess } from "child_process";

export interface IBinaryExecutor {
  execute(binaryPath: string, args: string[], timeoutMs?: number): Promise<string[]>;
}

export class NodeBinaryExecutor implements IBinaryExecutor {
  private readonly DEFAULT_TIMEOUT_MS = 30000; // 30 seconds

  async execute(binaryPath: string, args: string[], timeoutMs?: number): Promise<string[]> {
    const timeout = timeoutMs ?? this.DEFAULT_TIMEOUT_MS;

    return new Promise((resolve, reject) => {
      let childProcess: ChildProcess;
      let isResolved = false;

      try {
        childProcess = spawn(binaryPath, args);
      } catch (error) {
        reject(error);
        return;
      }

      const timeoutHandle = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          childProcess.kill();
          reject(new Error(`Binary execution timed out after ${timeout}ms`));
        }
      }, timeout);

      let result = "";

      childProcess.stdout?.on("data", (data: Buffer) => {
        result += data.toString();
      });

      childProcess.stderr?.on("data", (data: Buffer) => {
        console.log(`stderr: ${data.toString()}`);
      });

      childProcess.on("close", () => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeoutHandle);

          const lines = result.split("\n");
          const resultsArr: string[] = [];

          lines.forEach(element => {
            const index = element.indexOf("(");
            if (index > 0) {
              resultsArr.push(element.substring(index, element.length - 1));
            }
          });

          resolve(resultsArr);
        }
      });

      childProcess.on("error", error => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeoutHandle);
          reject(error);
        }
      });
    });
  }
}
