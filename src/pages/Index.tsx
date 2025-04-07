
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import FileUploader from '@/components/FileUploader';
import MessageCard from '@/components/MessageCard';
import CardSettings from '@/components/CardSettings';
import { parseCSV, MessageRecord } from '@/utils/csvParser';

const Index = () => {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cardWidth, setCardWidth] = useState(105); // Default to A6 width in mm
  const [cardHeight, setCardHeight] = useState(148); // Default to A6 height in mm
  const [selectedFont, setSelectedFont] = useState('serif');
  const [selectedColor, setSelectedColor] = useState('#2D3047');
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [showMetadata, setShowMetadata] = useState(true);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const parsedMessages = await parseCSV(file);
      setMessages(parsedMessages);
      toast({
        title: "Success",
        description: `Loaded ${parsedMessages.length} messages from the CSV file.`,
      });
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast({
        title: "Error",
        description: "Failed to parse the CSV file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white shadow-sm py-4 mb-8 no-print">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-serif text-navy font-semibold">Card Message Crafter</h1>
          <p className="text-softBlue mt-1">Import, format, and print customer gift messages</p>
        </div>
      </header>
      
      <main className="container pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Controls */}
          <div className="space-y-6 no-print">
            <FileUploader onFileUploaded={handleFileUpload} isLoading={isLoading} />
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
              onPrint={handlePrint}
            />
          </div>
          
          {/* Right column - Card Preview */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg p-4 mb-4 no-print">
              <h2 className="text-xl font-serif text-navy mb-1">Message Preview</h2>
              <p className="text-sm text-muted-foreground">
                {messages.length > 0 
                  ? `Displaying ${messages.length} cards for printing` 
                  : "Upload a CSV file to see your message cards"}
              </p>
            </div>
            
            {messages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-gray-200 p-8">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-serif text-navy">No Messages Yet</h3>
                  <p className="text-muted-foreground">
                    Upload a CSV file with your message data to get started.
                  </p>
                  <p className="text-xs text-muted-foreground mt-8">
                    Your CSV should have columns for message, sender, recipient, and other optional fields.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-navy text-white py-4 mt-8 no-print">
        <div className="container text-center text-xs md:text-sm">
          <p>&copy; {new Date().getFullYear()} Card Message Crafter | Print custom gift messages with ease</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
