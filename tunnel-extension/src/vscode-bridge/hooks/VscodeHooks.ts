import { useEffect, useState } from 'react';
import { vscode, Request, Response, RouteType } from '../VscodeTypes';

interface VscodeResponseHookOnResponse<T extends Response> {
  response: T | undefined;
}
interface VscodeRequestHookResponse<T extends Response> {
  send: (request: Request) => void;
  response: T | undefined;
}
interface VscodeEvent<T extends Response> {
  data: T;
}

export function useVscodeRequest<T extends Response>(): VscodeRequestHookResponse<T> {
  const [response, setResponse] = useState<T>();
  const [request, setRequest] = useState<Request | undefined>();

  useEffect(() => {
    if (request) {
      vscode.postMessage(request);
      window.addEventListener('message', eventHandler(request));

      return () => window.removeEventListener('message', eventHandler(request));
    }
  }, [request]);

  function eventHandler(request: Request) {
    return (event: Event) => {
      const vscodeEvent: VscodeEvent<T> = event as any;
      if (request.checkSum === vscodeEvent.data.checkSum && request.type == vscodeEvent.data.type)
        setResponse(vscodeEvent.data);
    };
  }

  return {
    send: (request: Request) => setRequest(request),
    response: response,
  };
}

export function useVscodeResponse<T extends Response>(type: RouteType): VscodeResponseHookOnResponse<T> {
  const [response, setResponse] = useState<T>();

  useEffect(() => {
    if (type) {
      window.addEventListener('message', eventHandler);

      return () => window.removeEventListener('message', eventHandler);
    }
  }, [type]);

  function eventHandler(event: Event) {
    const vscodeEvent: VscodeEvent<T> = event as any;
    if (type == vscodeEvent.data.type) {
      setResponse(vscodeEvent.data as any);
    }
  }

  return {
    response,
  };
}
