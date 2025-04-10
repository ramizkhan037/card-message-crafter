import { MessageRecord } from '@/utils/csvParser';
import React from 'react';

interface MessageCardProps {
  message: MessageRecord;  
  cardWidth: number;
  cardHeight: number;
}

const MessageCard = ({
  message,
  cardWidth,
  cardHeight,
}: MessageCardProps) => {
    // Split the message into words to identify Arabic words
    const words = message.message.split(" ");

    // Function to determine if a word is Arabic or an emoji
    const isArabicWord = (word: string) => {
        // Check if the word contains Arabic characters
        return /[\u0600-\u06FF]/.test(word);
    };



  return (
    <div 
        className="message-card"
        style={{
            width: `${cardWidth}mm`,
            height: `${cardHeight}mm`,
        }}
    >
      <div className="message-content">
        {/* Wrap each word in a span and add the arabic-text class */}
        <p>
          {words.map((word, index) => (
            <span
              key={index}
              className={`${
                isArabicWord(word) ? "arabic-text" : ""              
              } ${
                word.includes("&#x") ? "emoji" : ""
              }`}
            >
              {word}{" "}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};

export default MessageCard;
