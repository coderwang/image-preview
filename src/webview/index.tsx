import * as React from 'react';
import { createRoot } from 'react-dom/client';

const vscode = acquireVsCodeApi();

const App: React.FC = () => {

  React.useEffect(() => {
    // 监听来自extension的消息
    window.addEventListener('message', event => {
      const message = event.data;
      console.log('收到的消息:', message);
    });

    // 向extension发送消息请求文件夹路径
    vscode.postMessage({
      command: 'requestFolderPath'
    });
  }, [])

  return (
    <div>
      <h1>Hello from React！</h1>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);