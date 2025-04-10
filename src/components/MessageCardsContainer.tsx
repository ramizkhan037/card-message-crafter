import { useState } from 'react';
import MessageCard from './MessageCard';
import FileUploader from './FileUploader';
import { MessageRecord } from '@/utils/csvParser';
import { Button } from '@/components/ui/button';

const MessageCardsContainer = () => {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const cardWidth = 95;
  const cardHeight = 189.999;

  const handleMessagesUpload = (uploadedMessages: MessageRecord[]) => {
    setMessages(uploadedMessages);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div>
      <FileUploader onUpload={handleMessagesUpload} />
      {messages && messages.length > 0 && (
        <Button onClick={handlePrint}>Print Cards</Button>
      )}
      <div>
        {messages && messages.length > 0 ? (
          <div className="message-cards-list">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
              />
            ))}
          </div>
        ) : (
          <div>
            <h2>No Message Cards Yet</h2>
            <p>Upload a CSV file to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageCardsContainer;
