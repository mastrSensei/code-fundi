import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import { TokenManager } from "./TokenManager";
// import { oAuth } from "./oAuth";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        case "authenticate": {
          if (!data.value) {
            return;
          }
          const token = data.value;
          // Save the token to the globalState
          await TokenManager.setToken(token);
          vscode.window.showInformationMessage(`Login successful`);
          break;
        }
        case "oAuthenticate": {
          // Reset the token in the globalState
          const provider = data.value;
          // const token = await oAuth(provider);
          // Save the token to the globalState
          // await TokenManager.setToken(token);
          vscode.window.showInformationMessage(`Login successful`);
          break;
        }
        case "tokenFetch": {
          // Get the token from the globalState
          const token = await TokenManager.getToken();
          const responseMessage = { type: 'tokenFetchResponse', value: token };
          webviewView.webview.postMessage(responseMessage);
          break;
        }
        case "saveMessages": {
          if (!data.value) {
            return;
          }
          const messages = data.value;
          // Save the token to the globalState
          await TokenManager.setMessages(messages);
          break;
        }
        case "getMessages": {
          // Get the token from the globalState
          const messages = await TokenManager.getMessages();
          const messageResponseMessage = { type: 'getMessagesResponse', value: messages };
          webviewView.webview.postMessage(messageResponseMessage);
          break;
        }
        case "signOut": {
          // Reset the token in the globalState
          await TokenManager.setToken("");
          await TokenManager.setMessages("");
          this.reloadWebview(); // Reload the webview
          vscode.window.showInformationMessage(`Logout successful`);
          break;
        }
        
        // case "tokens": {
        //   await Util.globalState.update(accessTokenKey, data.accessToken);
        //   await Util.globalState.update(refreshTokenKey, data.refreshToken);
        //   break;
        // }
      }
    });
  }

  private reloadWebview() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    }
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/SideBar.js")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    // Get Theme
    const theme = vscode.workspace.getConfiguration().get('myExtension.theme');

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${
      webview.cspSource
    }; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <script nonce="${nonce}">
          const tsvscode = acquireVsCodeApi();
            const theme = '${theme}';
            new App({
              target: document.querySelector('#app'),
              props: {
                theme
              }
            });
        </script>
			</head>
      <body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}