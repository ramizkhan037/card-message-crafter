
import { useState } from 'react';
import './App.css';
import MessageCard from './components/MessageCard';
import CardSettings from './components/CardSettings';
import FileUploader from './components/FileUploader';
import { MessageRecord } from './utils/csvParser';
import { Toaster } from './components/ui/toaster';

function App() {
  const [cardWidth, setCardWidth] = useState(105);
  const [cardHeight, setCardHeight] = useState(148);
  const [selectedFont, setSelectedFont] = useState<string>('auto');
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(100);
  const [lineHeight, setLineHeight] = useState<number>(1.5);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [messages, setMessages] = useState<MessageRecord[]>([]);

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold">Customizable Message Cards</h1>
          <p className="text-muted-foreground mt-2">Create, customize, and print your message cards</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
          <div className="space-y-6">
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
              />
              
              {messages.length === 0 && (
                <div className="mt-4">
                  <FileUploader onUpload={handleMessagesUpload} />
                </div>
              )}
            </div>
          </div>
          
          <div>
            {messages.length > 0 ? (
              <>
                <div className="no-print mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-medium">Your Message Cards</h2>
                  <div className="flex gap-2">
                    <FileUploader onUpload={handleMessagesUpload} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {messages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      cardWidth={cardWidth}
                      cardHeight={cardHeight}
                      selectedFont={selectedFont}
                      selectedColor={selectedColor}
                      textAlignment={textAlignment}
                      showMetadata={showMetadata}
                      fontSize={fontSize}
                      lineHeight={lineHeight}
                      letterSpacing={letterSpacing}
                      onMessageUpdate={handleMessageUpdate}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-secondary/30 rounded-lg p-8 text-center">
                <h2 className="text-xl font-medium mb-4">No Message Cards Yet</h2>
                <p className="text-muted-foreground mb-6">
                  Upload a CSV file to get started. The file should contain columns for 'message', 'sender', and 'recipient'.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
