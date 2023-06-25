import * as vscode from "vscode";

const SESSION_KEY = "fundi_session";
const MESSAGES_KEY = "fundi_messages";

export class TokenManager {
  static globalState: vscode.Memento;
  static workspaceState: vscode.Memento;

  static setToken(token: string) {
    return this.globalState.update(SESSION_KEY, token);
  }

  static getToken(): string | undefined {
    return this.globalState.get(SESSION_KEY);
  }

  static setMessages(messages: string) {
    return this.workspaceState.update(MESSAGES_KEY, messages);
  }

  static getMessages(): string | undefined {
    console.log(this.workspaceState.get(MESSAGES_KEY));
    return this.workspaceState.get(MESSAGES_KEY);
  }
}