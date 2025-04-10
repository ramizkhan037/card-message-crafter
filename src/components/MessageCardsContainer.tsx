
import { useState, useEffect } from 'react';
import MessageCard from './MessageCard';
import FileUploader from './FileUploader';
import CardSettings from './CardSettings';
import { MessageRecord } from '@/utils/csvParser';
import { toast } from '@/hooks/use-toast';

// Enhanced MessageRecord interface with style data
interface EnhancedMessageRecord extends MessageRecord {
  styleData?: {
    wordStyles: Record<string, { fontSize: number }>;
  };
}

interface MessageCardsContainerProps {
  foldedCard?: boolean;
  setFoldedCard?: (folded: boolean) => void;
  initialMessages?: MessageRecord[];
  onMessagesUpdate?: (messages: MessageRecord[]) => void;
}

const MessageCardsContainer = ({ 
  foldedCard = true, 
  setFoldedCard,
  initialMessages = [],
  onMessagesUpdate
}: MessageCardsContainerProps) => {
  // State for card settings
  const [cardWidth, setCardWidth] = useState(95);
  const [cardHeight, setCardHeight] = useState(190);
  const [selectedFont, setSelectedFont] = useState('auto');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [showMetadata, setShowMetadata] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  
  // State for messages with enhanced type
  const [messages, setMessages] = useState<EnhancedMessageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load initial messages or from localStorage
  useEffect(() => {
    console.log('MessageCardsContainer: initialMessages passed in:', initialMessages);
    
    if (initialMessages && initialMessages.length > 0) {
      console.log('Using initialMessages:', initialMessages);
      setMessages(initialMessages as EnhancedMessageRecord[]);
    } else {
      // Try loading from localStorage if no initialMessages provided
      const savedMessages = localStorage.getItem('cardMessages');
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          console.log('Loaded messages from localStorage:', parsedMessages);
          setMessages(parsedMessages);
        } catch (error) {
          console.error('Error loading saved messages:', error);
          toast({
            title: "Error",
            description: "Failed to load saved messages",
            variant: "destructive",
          });
        }
      }
    }
  }, [initialMessages]);
  
  // Update parent component when messages change
  useEffect(() => {
    if (onMessagesUpdate && messages.length > 0) {
      console.log('MessageCardsContainer: Updating parent with messages:', messages.length);
      onMessagesUpdate(messages);
    }
    
    // Save to localStorage whenever messages change
    if (messages.length > 0) {
      console.log('Saving messages to localStorage:', messages.length);
      localStorage.setItem('cardMessages', JSON.stringify(messages));
    }
  }, [messages, onMessagesUpdate]);
  
  // Handle file upload
  const handleMessagesUpload = (uploadedMessages: MessageRecord[]) => {
    console.log('Received messages in container:', uploadedMessages);
    
    if (!uploadedMessages || uploadedMessages.length === 0) {
      toast({
        title: "Error",
        description: "No messages were found in the uploaded file",
        variant: "destructive",
      });
      return;
    }
    
    // Convert to enhanced message records
    const enhancedMessages: EnhancedMessageRecord[] = uploadedMessages.map(msg => ({
      ...msg,
      styleData: {
        wordStyles: {}
      }
    }));
    
    console.log('Enhanced messages to set:', enhancedMessages);
    setMessages(enhancedMessages);
    
    // Save to localStorage
    localStorage.setItem('cardMessages', JSON.stringify(enhancedMessages));
    
    toast({
      title: "Messages uploaded",
      description: `${uploadedMessages.length} messages have been loaded successfully.`,
    });
  };
  
  // Handle message update with style data
  const handleMessageUpdate = (id: string, updatedMessage: string, styleData?: any) => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === id) {
        return {
          ...msg,
          message: updatedMessage,
          styleData: styleData || msg.styleData
        };
      }
      return msg;
    });
    
    setMessages(updatedMessages);
    
    // Save to localStorage
    localStorage.setItem('cardMessages', JSON.stringify(updatedMessages));
    
    toast({
      title: "Message updated",
      description: "Your changes have been saved successfully.",
    });
  };
  
  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };
  
  console.log('Current messages in state:', messages); // Debug current message state
  
  return (
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
          
          <div className="mt-6">
            <FileUploader onUpload={handleMessagesUpload} isLoading={isLoading} />
          </div>
        </div>
      </div>
      
      <div>
        {messages && messages.length > 0 ? (
          <>
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6 no-print">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-medium text-slate-800">Your Message Cards</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Displaying {messages.length} cards for printing
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`grid grid-cols-1 ${foldedCard ? 'folded-cards-grid' : 'md:grid-cols-2 xl:grid-cols-3'} gap-6`}>
              {messages.map((message, index) => {
                console.log(`Rendering message ${index}:`, message);
                return (
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
                );
              })}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-slate-200">
            <h2 className="text-xl font-medium text-slate-800 mb-3">No Message Cards Yet</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Upload a CSV file to get started. The file should contain columns for 'message', 'sender', and 'recipient'.
            </p>
            <button 
              onClick={() => import('@/utils/csvParser').then(({ downloadSampleCSV }) => downloadSampleCSV())} 
              className="text-blue-500 underline text-sm mb-4"
            >
              Download a sample CSV file
            </button>
            <img 
              src="/placeholder.svg" 
              alt="Upload illustration" 
              className="w-32 h-32 mx-auto opacity-50" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageCardsContainer;
