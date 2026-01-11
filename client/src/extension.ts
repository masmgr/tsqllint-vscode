"use strict";

import * as path from "path";
import { workspace, ExtensionContext, commands, TextEditor } from "vscode";
import { LanguageClientOptions } from "vscode-languageclient/node";
import { ILanguageServerManager, VSCodeLanguageServerManager } from "./lsp/LanguageServerManager";

let serverManager: ILanguageServerManager;

export async function activate(context: ExtensionContext) {
  const serverModule = context.asAbsolutePath(path.join("server", "out", "server.js"));

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "sql" }],
    synchronize: {
      configurationSection: "tsqlLint",
      fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
    },
  };

  serverManager = new VSCodeLanguageServerManager(serverModule, clientOptions);

  const fix = async (editor: TextEditor) => {
    await serverManager.sendFixNotification(editor.document.uri.toString());
  };

  context.subscriptions.push(commands.registerTextEditorCommand("tsqlLint.fix", fix));

  await serverManager.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!serverManager) {
    return undefined;
  }
  return serverManager.stop();
}
