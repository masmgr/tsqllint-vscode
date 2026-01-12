import { window, TextEditorEdit } from "vscode";

export interface ITextEditor {
  document: { uri: { toString(): string }; version: number };
  edit(callback: (mutator: TextEditorEdit) => void): Thenable<boolean>;
}

export interface IEditorService {
  getActiveEditor(): ITextEditor | undefined;
  showInformationMessage(message: string): void;
  showErrorMessage(message: string): void;
}

export class VSCodeEditorService implements IEditorService {
  getActiveEditor(): ITextEditor | undefined {
    return window.activeTextEditor as ITextEditor | undefined;
  }

  showInformationMessage(message: string): void {
    window.showInformationMessage(message);
  }

  showErrorMessage(message: string): void {
    window.showErrorMessage(message);
  }
}
