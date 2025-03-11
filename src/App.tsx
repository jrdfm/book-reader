import { useState } from 'react';
import { BookReaderProvider, useBookReader } from './context/BookReaderContext';
import BookReader from './components/BookReader';
import { parseFile } from './services/fileService';

function BookReaderApp() {
  const [file, setFile] = useState<File | null>(null);
  const { dispatch } = useBookReader();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      try {
        const content = await parseFile(uploadedFile);
        dispatch({ type: 'SET_CONTENT', payload: content });
        setFile(uploadedFile);
      } catch (error) {
        console.error('Error parsing file:', error);
        // TODO: Add error handling UI
      }
    }
  };

  return (
    <>
      {!file ? (
        <div className="min-h-screen bg-[#FAF4E8] flex flex-col items-center justify-center">
          <h1 className="text-2xl mb-4 text-[#2B2B2B]">Welcome to BookReader</h1>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".txt,.epub,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="px-4 py-2 bg-[#e5decf] hover:bg-[#d8cfc0] text-[#2B2B2B] rounded transition-colors">
              Upload a Book
            </span>
          </label>
        </div>
      ) : (
        <div className="min-h-screen bg-[#FAF4E8]">
          <main className="container mx-auto px-4 py-8">
            <BookReader file={file} />
          </main>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <BookReaderProvider>
      <BookReaderApp />
    </BookReaderProvider>
  );
}

export default App;
