
import { useState } from 'react';
import MessageCard from './MessageCard';
import FileUploader from './FileUploader';
import { MessageRecord } from '@/utils/csvParser';

const MessageCardsContainer = () => {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  
  // Handle file upload
  const handleMessagesUpload = (uploadedMessages: MessageRecord[]) => {
    setMessages(uploadedMessages);
  };
  
  return (
    <div className="grid grid-cols-1 gap-8">
      <FileUploader onUpload={handleMessagesUpload} />
      
      <div>
        {messages && messages.length > 0 ? (
          <>
          <div className="grid grid-cols-1 gap-6">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
              />
            ))}
          </div>
          {/* <div className={`grid grid-cols-1 ${foldedCard ? 'folded-cards-grid' : 'md:grid-cols-2 xl:grid-cols-3'} gap-6`}>
              {messages.map((message, index) => { */}
                {/*  console.log(`MessageCardsContainer: messages.map is being called. Number of messages: ${messages.length}`); */}
                {/* 
                return (
                  <MessageCard
                    key={message.id}
                    message={message}
                    cardWidth={cardWidth}
                    cardHeight={foldedCard ? cardHeight / 2 : cardHeight}
                    selectedFont={selectedFont}
                    
                  />
                );
              })}
            </div> */}
          </>
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
