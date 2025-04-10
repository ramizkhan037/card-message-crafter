
import { useState } from 'react';
import './App.css';
import MessageCardsContainer from './components/MessageCardsContainer';
import { Toaster } from './components/ui/toaster';

function App() {
  const [foldedCard, setFoldedCard] = useState<boolean>(true); // Default to true for folded card

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm py-6 mb-6 no-print">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-slate-800">Message Cards Studio</h1>
          <p className="text-slate-500 mt-1">Create beautiful message cards for your customers</p>
        </div>
      </header>
      
      <div className="container mx-auto px-4 pb-12">
        <MessageCardsContainer 
          foldedCard={foldedCard} 
          setFoldedCard={setFoldedCard} 
        />
      </div>
      
      <footer className="bg-slate-800 text-white py-6 mt-8 no-print">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-300">&copy; {new Date().getFullYear()} Message Cards Studio | All rights reserved</p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

export default App;
