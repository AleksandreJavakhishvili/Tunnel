import * as React from 'react';
import { useEffect, useState } from 'react';
import './App.css';
import logo from './logo.svg';
import Snippet from './snippet/Snippet';
import { useVscodeResponse } from './vscode-bridge/hooks/VscodeHooks';
import { CodeSnippetResponse, vscode } from './vscode-bridge/VscodeTypes';

function App() {
  const [title, setTitle] = useState('');
  const { response } = useVscodeResponse<CodeSnippetResponse>('code-snippet');

  useEffect(() => {
    if (response) {
      console.log('useEffect', response);
    }
  }, [response]);

  useEffect(() => {
    console.log('vscode', vscode);
    if (vscode) {
      setTitle(JSON.stringify(vscode));
      // sendCommand({
      //   checkSum: 'test',
      //   type: 'alert',
      //   message: 'test alert command',
      // });
      // vscode.postMessage({ type: 'alert', message: 'Test alert command' });
    }
    setTitle('Welcome to tunnel123');
  }, []);

  return (
    <div>
      <Snippet codeSnippet={(response && response.codeSnippet) || ''}></Snippet>
    </div>
  );
}

export default App;
