import { Range } from "vscode";
import { LanguageClient } from "vscode-languageclient/node";
import { Range as LSPRange } from "vscode-languageserver-types";

export interface IProtocolConverter {
  toVscodeRange(lspRange: LSPRange): Range;
}

export class VSCodeProtocolConverter implements IProtocolConverter {
  constructor(private client: LanguageClient) {}

  toVscodeRange(lspRange: LSPRange): Range {
    return this.client.protocol2CodeConverter.asRange(lspRange);
  }
}
