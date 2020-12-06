export type RouteType = 'code-snippet' | 'alert';

export interface CodeSnippetResponse {
  type: 'code-snippet';
  codeSnippet: string;
  checkSum?: string;
}

interface AlertRequest {
  type: 'alert';
  checkSum: string;
  message: string;
}
interface AlertResponse {
  type: 'alert';
  checkSum: string;
  data: any;
}

export type Response = AlertResponse | CodeSnippetResponse;
export type Request = AlertRequest;

export interface Vscode {
  postMessage(message: Request): void;
}
export declare const vscode: Vscode;
