import * as React from 'react';
import './Snippet.css';

interface Props {
  codeSnippet: string;
}
export default function Snippet({ codeSnippet }: Props) {
  return (
    <div>
      <p className="snippet-text">
        <blockquote>
          <pre>
            <code>{codeSnippet}</code>
          </pre>
        </blockquote>
      </p>
      <input placeholder="Enter Description"></input>
    </div>
  );
}
