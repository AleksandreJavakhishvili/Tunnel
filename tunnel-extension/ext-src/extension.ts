import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('tunnel.run', () => {
      ReactPanel.createOrShow(context);
    }),
  );
}

/**
 * Manages react webview panels
 */
class ReactPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: ReactPanel | undefined;

  private static readonly viewType = 'react';

  private readonly panel: vscode.WebviewPanel;
  private readonly extensionPath: string;
  private disposables: vscode.Disposable[] = [];
  private context: vscode.ExtensionContext;

  public static createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : vscode.ViewColumn.Two;
    // If we already have a panel, show it.
    // Otherwise, create a new panel.
    if (ReactPanel.currentPanel) {
      ReactPanel.currentPanel.panel.reveal(column);
    } else {
      ReactPanel.currentPanel = new ReactPanel(context, column || vscode.ViewColumn.One);
    }
  }

  private constructor(context: vscode.ExtensionContext, column: vscode.ViewColumn) {
    this.context = context;
    this.extensionPath = context.extensionPath;

    // Create and show a new webview panel
    this.panel = vscode.window.createWebviewPanel(ReactPanel.viewType, 'Tunnel', column, {
      // Enable javascript in the webview
      enableScripts: true,

      // And restric the webview to only loading content from our extension's `media` directory.
      localResourceRoots: [vscode.Uri.file(path.join(this.extensionPath, 'out'))],
    });

    // Set the webview's initial html content

    let text = vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection);

    text = text || this.context.globalState.get('code-snippet') || '';

    if (!text) {
      vscode.window.showWarningMessage('Please select the code snippet');
      return;
    }
    this.context.globalState.update('code-snippet', text);

    this.panel.webview.html = this.getHtmlForWebview();
    this.panel.webview.postMessage({
      type: 'code-snippet',
      codeSnippet: text,
    });

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      (command) => {
        switch (command.type) {
          case 'alert':
            vscode.window.showInformationMessage(command.message);
            return;
          case 'init':
            vscode.window.showInformationMessage('Ready');
            return;
          case 'default':
            vscode.window.showErrorMessage(`listener for command type ${command.type} not found`);
            return;
        }
      },
      null,
      this.disposables,
    );

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  public dispose() {
    ReactPanel.currentPanel = undefined;

    // Clean up our resources
    this.panel.dispose();

    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private assetsFile = (name: string) => {
    const file = path.join(this.extensionPath, 'out', name);
    return vscode.Uri.file(file).with({ scheme: 'vscode-resource' }).toString();
  };

  private getHtmlForWebview() {
    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    // <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;">
    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
        <meta name="theme-color" content="#000000">
        <meta http-equiv="Content-Security-Policy" content="default-src self; img-src vscode-resource:; script-src vscode-resource: 'self' 'unsafe-inline'; style-src vscode-resource: 'self' 'unsafe-inline'; "/>
				<title>React App</title>
			</head>

			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>
        <script nonce="${nonce}" src="${this.assetsFile('react.production.min.js')}"></script>
        <script nonce="${nonce}" src="${this.assetsFile('react-dom.production.min.js')}"></script>
        <script>
          const vscode = acquireVsCodeApi();
          window.onload = function() {
            vscode.postMessage({ type: 'init' });
            console.log('Ready to accept data.');
          };
        </script>
        <script nonce="${nonce}" src="${this.assetsFile('main.wv.js')}">
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
