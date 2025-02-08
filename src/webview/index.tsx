import * as React from 'react';
import { createRoot } from 'react-dom/client';

const App: React.FC = () => {
  return (
    <div>
      <h1>Hello from React！</h1>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);