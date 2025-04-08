
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
  const [lastUploadedFile, setLastUploadedFile] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState(105); // Default to A6 width in mm
  const [cardHeight, setCardHeight] = useState(148); // Default to A6 height in mm
  const [selectedFont, setSelectedFont] = useState('auto'); // Default to auto detect
  const [selectedColor, setSelectedColor] = useState('#2D3047');
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [showMetadata, setShowMetadata] = useState(true);
  const [fontSize, setFontSize] = useState(100); // Default font size 100%

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setLastUploadedFile(file.name);
    
    try {
      console.log('Processing file:', file.name);
      const parsedMessages = await parseCSV(file);
      
      if (parsedMessages.length === 0) {
        toast({
          title: "No messages found",
          description: "The file was processed successfully, but no valid messages were found. Please check the file format.",
          variant: "destructive",
        });
      } else {
        setMessages(parsedMessages);
        toast({
          title: "Success",
          description: `Loaded ${parsedMessages.length} messages from "${file.name}"`,
        });
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast({
        title: "Error",
        description: "Failed to parse the file. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMessageUpdate = (id: string, updatedMessage: string) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === id 
          ? { ...message, message: updatedMessage } 
          : message
      )
    );
    
    toast({
      title: "Message updated",
      description: "Your changes have been saved.",
    });
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
              fontSize={fontSize}
              setFontSize={setFontSize}
              onPrint={handlePrint}
            />
          </div>
          
          {/* Right column - Card Preview */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg p-4 mb-4 no-print">
              <h2 className="text-xl font-serif text-navy mb-1">Message Preview</h2>
              <p className="text-sm text-muted-foreground">
                {messages.length > 0 
                  ? `Displaying ${messages.length} cards for printing${messages.length > 0 ? " (Click the pencil icon to edit)" : ""}` 
                  : lastUploadedFile 
                    ? `No valid messages found in "${lastUploadedFile}". Please check the file format.`
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
                    fontSize={fontSize}
                    onMessageUpdate={handleMessageUpdate}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-gray-200 p-8">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-serif text-navy">
                    {lastUploadedFile ? "No Valid Messages Found" : "No Messages Yet"}
                  </h3>
                  <p className="text-muted-foreground">
                    {lastUploadedFile 
                      ? "Your file was processed but no valid messages were found. Make sure your CSV has a 'message' column."
                      : "Upload a CSV file with your message data to get started."}
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
