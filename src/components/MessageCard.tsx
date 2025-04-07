import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { MessageRecord } from '@/utils/csvParser';
import { cn } from '@/lib/utils';

interface MessageCardProps {
  message: MessageRecord;
  cardWidth: number;
  cardHeight: number;
  selectedFont: string;
  selectedColor: string;
  textAlignment: 'left' | 'center' | 'right';
  showMetadata: boolean;
}

const containsArabic = (text: string): boolean => {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
};

const MessageCard = ({ 
  message, 
  cardWidth, 
  cardHeight, 
  selectedFont, 
  selectedColor,
  textAlignment,
  showMetadata
}: MessageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const hasArabic = containsArabic(message.message);

  const getFontFamily = () => {
    if (selectedFont !== 'auto') {
      return selectedFont === 'serif' ? 'Playfair Display, serif' : 'Raleway, sans-serif';
    }
    return hasArabic ? '"A Arslan Wessam A", sans-serif' : 'Rockwell-Bold, serif';
  };

  const cardStyle = {
    width: `${cardWidth}mm`,
    height: `${cardHeight}mm`,
    fontSize: calculateFontSize(message.message, cardWidth, cardHeight),
    lineHeight: '1.5',
  };
  
  const textStyle = {
    fontFamily: getFontFamily(),
    color: selectedColor,
    textAlign: textAlignment,
    direction: hasArabic ? 'rtl' : 'ltr',
  };

  return (
    <div className="relative m-2 print-card">
      <Card 
        className={cn(
          "flex flex-col p-6 bg-white card-shadow transition-all duration-200 ease-in-out print:shadow-none print:border-none",
          isHovered && "shadow-lg scale-[1.01]"
        )}
        style={cardStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex-1 flex items-center justify-center">
          <p 
            className={cn(
              "whitespace-pre-wrap break-words",
              hasArabic ? "arabic-text" : "english-text"
            )}
            style={textStyle as React.CSSProperties}
          >
            {message.message}
          </p>
        </div>
        
        {showMetadata && (message.sender || message.recipient) && (
          <div className="mt-4 pt-2 border-t border-gray-100 text-xs text-muted-foreground no-print">
            {message.sender && <p>From: {message.sender}</p>}
            {message.recipient && <p>To: {message.recipient}</p>}
            {message.orderNumber && <p className="text-[10px] mt-1 opacity-50">Order: {message.orderNumber}</p>}
          </div>
        )}
      </Card>
    </div>
  );
};

const calculateFontSize = (message: string, width: number, height: number): string => {
  const area = width * height;
  const messageLength = message.length;
  
  let baseFontSize = Math.sqrt(area) / 10;
  
  if (messageLength > 100) {
    baseFontSize *= 0.8;
  } else if (messageLength > 200) {
    baseFontSize *= 0.7;
  } else if (messageLength > 300) {
    baseFontSize *= 0.6;
  }
  
  baseFontSize = Math.min(Math.max(baseFontSize, 12), 24);
  
  return `${baseFontSize}px`;
};

export default MessageCard;
