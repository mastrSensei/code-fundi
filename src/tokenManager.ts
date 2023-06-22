import * as vscode from "vscode";

const KEY = "fundi_session";

export class TokenManager {
  static globalState: vscode.Memento;
  static workspaceState: vscode.Memento;

  static setToken(token: string) {
    return this.globalState.update(KEY, token);
  }

  static getToken(): string | undefined {
    return this.globalState.get(KEY);
  }

  static setMessages(messages: string) {
    return this.workspaceState.update(KEY, messages);
  }

  static getMessages(): string | undefined {
    return this.workspaceState.get(KEY);
  }
}