"use strict";

import * as fs from "fs";
import { NodePlatformAdapter } from "./platform/PlatformAdapter";
// tslint:disable-next-line:no-var-requires
const https = require("follow-redirects").https;
// tslint:disable-next-line:no-var-requires
const decompress = require("decompress");
// tslint:disable-next-line:no-var-requires
const decompressTargz = require("decompress-targz");

export default class TSQLLintRuntimeHelper {
  private platformAdapter: NodePlatformAdapter = new NodePlatformAdapter();
  public static DownloadRuntime(installDirectory: string): Promise<string> {
    const urlBase: string = `https://github.com/tsqllint/tsqllint/releases/download/${this._tsqllintVersion}`;
    const downloadUrl: string = `${urlBase}/${TSQLLintRuntimeHelper._runTime}.tgz`;
    const downloadFilePath: string = `${installDirectory}/${TSQLLintRuntimeHelper._runTime}.tgz`;
    const downloadPath: string = `${installDirectory}/${TSQLLintRuntimeHelper._runTime}.tgz`;

    return new Promise((resolve, reject) => {
      console.log(`Installing TSQLLint Runtime: ${downloadUrl}`);
      if (!fs.existsSync(installDirectory)) {
        fs.mkdirSync(installDirectory);
      }
      const file = fs.createWriteStream(downloadFilePath);
      https
        .get(downloadUrl, (response: any) => {
          const length = Number(response.headers["content-length"]);
          response.pipe(file);
          process.stdout.write("Downloading...");

          if (!isNaN(length)) {
            process.stdout.write(" [");
            const max = 60;
            let char = 0;
            let bytes = 0;
            response.on("data", (chunk: Buffer) => {
              bytes += chunk.length;
              const fill = Math.ceil((bytes / length) * max);
              for (let i = char; i < fill; i++) {
                process.stdout.write("=");
              }
              char = fill;
            });
            response.on("end", () => process.stdout.write("]\n"));
          }
          file.on("finish", () => {
            file.close();
            resolve(downloadPath);
          });
        })
        .on("response", (res: any) => {
          if (res.statusCode !== 200) {
            fs.unlink(downloadPath, () => {});
            return reject(
              new Error(`There was a problem downloading the TSQLLint Runtime. Reload VS Code to try again`)
            );
          }
        })
        .on("error", (err: Error) => {
          fs.unlink(downloadPath, () => {});
          reject(err);
        });
    });
  }

  private static _tsqllintVersion: string = "v1.16.0";
  private static _applicationRootDirectory: string;
  private static _runTime: string;
  private static _tsqllintToolsPath: string;

  constructor(applicationRootDirectory: string) {
    TSQLLintRuntimeHelper._applicationRootDirectory = applicationRootDirectory;
    TSQLLintRuntimeHelper._runTime = this.platformAdapter.getPlatform();
  }

  public async TSQLLintRuntime(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (TSQLLintRuntimeHelper._tsqllintToolsPath) {
        return resolve(TSQLLintRuntimeHelper._tsqllintToolsPath);
      }

      const tsqllintInstallDirectory: string = `${TSQLLintRuntimeHelper._applicationRootDirectory}/tsqllint`;
      if (fs.existsSync(`${tsqllintInstallDirectory}/${TSQLLintRuntimeHelper._runTime}`)) {
        TSQLLintRuntimeHelper._tsqllintToolsPath = tsqllintInstallDirectory;
        return resolve(TSQLLintRuntimeHelper._tsqllintToolsPath);
      }

      const download: Promise<string> = TSQLLintRuntimeHelper.DownloadRuntime(tsqllintInstallDirectory);

      download
        .then((path: string) => this.UnzipRuntime(path, tsqllintInstallDirectory))
        .then((installDir: string) => {
          console.log("Installation of TSQLLint Runtime Complete");
          return resolve(installDir);
        })
        .catch((error: Error) => reject(error));
    });
  }

  private UnzipRuntime(path: string, tsqllintInstallDirectory: string) {
    return new Promise((resolve, reject) => {
      decompress(path, `${tsqllintInstallDirectory}`, {
        plugins: [decompressTargz()],
      })
        .then(() => {
          TSQLLintRuntimeHelper._tsqllintToolsPath = tsqllintInstallDirectory;
          return resolve(tsqllintInstallDirectory);
        })
        .catch((err: Error) => {
          reject(err);
        });
    });
  }
}
