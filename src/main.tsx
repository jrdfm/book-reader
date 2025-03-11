import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BookReaderProvider } from './context/BookReaderContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BookReaderProvider>
      <App />
    </BookReaderProvider>
  </React.StrictMode>
);
