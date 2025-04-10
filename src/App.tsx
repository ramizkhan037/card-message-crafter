
import { useState } from 'react';
import './App.css';
import MessageCard from './components/MessageCard';
import CardSettings from './components/CardSettings';
import FileUploader from './components/FileUploader';
import { MessageRecord } from './utils/csvParser';
import { Toaster } from './components/ui/toaster';
import { Separator } from './components/ui/separator';

function App() {
  const [cardWidth, setCardWidth] = useState(95); // New default width
  const [cardHeight, setCardHeight] = useState(190); // New default height
  const [selectedFont, setSelectedFont] = useState<string>('auto');
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(100);
  const [lineHeight, setLineHeight] = useState<number>(1.5);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [foldedCard, setFoldedCard] = useState<boolean>(true); // Default to true for folded card

  const handleMessagesUpload = (uploadedMessages: MessageRecord[]) => {
    setMessages(uploadedMessages);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMessageUpdate = (id: string, updatedMessage: string) => {
    const updatedMessages = messages.map(msg => 
      msg.id === id ? { ...msg, message: updatedMessage } : msg
    );
    setMessages(updatedMessages);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm py-6 mb-6 no-print">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-slate-800">Message Cards Studio</h1>
          <p className="text-slate-500 mt-1">Create beautiful message cards for your customers</p>
        </div>
      </header>
      
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
          <div className="space-y-6 no-print">
            <div className="sticky top-4">
              <CardSettings 
                cardWidth={cardWidth}
                setCardWidth={setCardWidth}
                cardHeight={cardHeight}
                setCardHeight={setCardHeight}
                selectedFont={selectedFont}
                setSelectedFont={setSelectedFont}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                textAlignment={textAlignment}
                setTextAlignment={setTextAlignment}
                showMetadata={showMetadata}
                setShowMetadata={setShowMetadata}
                fontSize={fontSize}
                setFontSize={setFontSize}
                lineHeight={lineHeight}
                setLineHeight={setLineHeight}
                letterSpacing={letterSpacing}
                setLetterSpacing={setLetterSpacing}
                onPrint={handlePrint}
                foldedCard={foldedCard}
                setFoldedCard={setFoldedCard}
              />
              
              {messages.length === 0 && (
                <div className="mt-6">
                  <FileUploader onUpload={handleMessagesUpload} />
                </div>
              )}
            </div>
          </div>
          
          <div>
            {messages.length > 0 ? (
              <>
                <div className="bg-white rounded-lg p-6 shadow-sm mb-6 no-print">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-medium text-slate-800">Your Message Cards</h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Displaying {messages.length} cards for printing
                      </p>
                    </div>
                    <FileUploader onUpload={handleMessagesUpload} />
                  </div>
                </div>
                
                <div className={`grid grid-cols-1 ${foldedCard ? 'folded-cards-grid' : 'md:grid-cols-2 xl:grid-cols-3'} gap-6`}>
                  {messages.map((message, index) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      cardWidth={cardWidth}
                      cardHeight={foldedCard ? cardHeight / 2 : cardHeight}
                      selectedFont={selectedFont}
                      selectedColor={selectedColor}
                      textAlignment={textAlignment}
                      showMetadata={showMetadata}
                      fontSize={fontSize}
                      lineHeight={lineHeight}
                      letterSpacing={letterSpacing}
                      onMessageUpdate={handleMessageUpdate}
                      isFolded={foldedCard}
                      foldPosition={foldedCard ? (index % 2 === 0 ? 'top' : 'bottom') : undefined}
                      pairIndex={foldedCard ? Math.floor(index / 2) : undefined}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-slate-200">
                <h2 className="text-xl font-medium text-slate-800 mb-3">No Message Cards Yet</h2>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Upload a CSV file to get started. The file should contain columns for 'message', 'sender', and 'recipient'.
                </p>
                <img 
                  src="/placeholder.svg" 
                  alt="Upload illustration" 
                  className="w-32 h-32 mx-auto opacity-50" 
                />
              </div>
            )}
          </div>
        </div>
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
