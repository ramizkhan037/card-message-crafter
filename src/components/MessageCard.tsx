
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { MessageRecord } from '@/utils/csvParser';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X, Bug, FileWarning } from 'lucide-react';

interface MessageCardProps {
  message: MessageRecord;
  cardWidth: number;
  cardHeight: number;
  selectedFont: string;
  selectedColor: string;
  textAlignment: 'left' | 'center' | 'right';
  showMetadata: boolean;
  fontSize: number;
  onMessageUpdate?: (id: string, updatedMessage: string) => void;
}

const containsArabic = (text: string): boolean => {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
};

// Check if fonts are loaded
const checkFontLoading = (): { rockwellLoaded: boolean, arslanLoaded: boolean } => {
  // This is not 100% accurate but can help with debugging
  let rockwellLoaded = false;
  let arslanLoaded = false;
  
  document.fonts.forEach(font => {
    if (font.family.includes('Rockwell') && font.loaded) {
      rockwellLoaded = true;
    }
    if ((font.family.includes('Arslan') || font.family.includes('AArslan')) && font.loaded) {
      arslanLoaded = true;
    }
  });
  
  return { rockwellLoaded, arslanLoaded };
};

const MessageCard = ({ 
  message, 
  cardWidth, 
  cardHeight, 
  selectedFont, 
  selectedColor,
  textAlignment,
  showMetadata,
  fontSize,
  onMessageUpdate
}: MessageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message.message);
  const [debugFont, setDebugFont] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  const hasArabic = containsArabic(message.message);
  const { rockwellLoaded, arslanLoaded } = checkFontLoading();

  const getFontClass = () => {
    if (debugFont === 'rockwell') {
      return "font-debug-rockwell";
    } else if (debugFont === 'arslan') {
      return "font-debug-arslan";
    } else if (selectedFont === 'auto') {
      return hasArabic ? "arabic-text" : "english-text";
    } else {
      return selectedFont === 'serif' ? "font-serif" : "font-sans";
    }
  };

  const cardStyle = {
    width: `${cardWidth}mm`,
    height: `${cardHeight}mm`,
    fontSize: calculateFontSize(message.message, cardWidth, cardHeight, fontSize),
    lineHeight: '1.5',
  };
  
  const textStyle = {
    color: debugFont ? 'inherit' : selectedColor,
    textAlign: textAlignment,
    direction: hasArabic ? 'rtl' : 'ltr',
  };

  const handleSave = () => {
    if (onMessageUpdate) {
      onMessageUpdate(message.id, editedMessage);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMessage(message.message);
    setIsEditing(false);
  };
  
  const toggleDebugFont = () => {
    if (!debugFont) {
      setDebugFont('rockwell');
    } else if (debugFont === 'rockwell') {
      setDebugFont('arslan');
    } else {
      setDebugFont(null);
    }
  };
  
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
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
        {!isEditing ? (
          <>
            <div className="flex-1 flex items-center justify-center">
              <p 
                className={cn(
                  "whitespace-pre-wrap break-words",
                  getFontClass()
                )}
                style={textStyle as React.CSSProperties}
              >
                {editedMessage}
              </p>
            </div>
            
            {onMessageUpdate && isHovered && (
              <div className="absolute top-2 right-2 flex gap-2 no-print">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="p-1 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil size={14} />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "p-1 h-8 w-8 rounded-full opacity-70 hover:opacity-100",
                    debugFont && "bg-muted"
                  )}
                  onClick={toggleDebugFont}
                  title="Toggle font debugging (cycle through different fonts)"
                >
                  <Bug size={14} />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "p-1 h-8 w-8 rounded-full opacity-70 hover:opacity-100",
                    showDebugInfo && "bg-muted"
                  )}
                  onClick={toggleDebugInfo}
                  title="Toggle font loading status"
                >
                  <FileWarning size={14} />
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex-1 flex flex-col">
              <Textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className={cn(
                  "flex-1 resize-none border-none focus-visible:ring-0 p-0",
                  getFontClass()
                )}
                style={{
                  ...textStyle as React.CSSProperties,
                  fontSize: `calc(${calculateFontSize(message.message, cardWidth, cardHeight, fontSize)} * 0.9)`,
                  minHeight: '80px'
                }}
              />
              <div className="flex justify-end gap-2 mt-2 no-print">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X size={14} className="mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Check size={14} className="mr-1" /> Save
                </Button>
              </div>
            </div>
          </>
        )}
        
        {showMetadata && (message.sender || message.recipient) && !isEditing && (
          <div className="mt-4 pt-2 border-t border-gray-100 text-xs text-muted-foreground no-print">
            {message.sender && <p>From: {message.sender}</p>}
            {message.recipient && <p>To: {message.recipient}</p>}
            {message.orderNumber && <p className="text-[10px] mt-1 opacity-50">Order: {message.orderNumber}</p>}
            {debugFont && (
              <p className="text-[10px] mt-1 font-bold">
                Font debug: {debugFont === 'rockwell' ? 'Rockwell Bold' : 'A Arslan Wessam A'}
              </p>
            )}
          </div>
        )}
        
        {showDebugInfo && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-2 no-print">
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              <span>Font type:</span>
              <span>{hasArabic ? 'Arabic detected' : 'English'}</span>
              
              <span>Selected font:</span>
              <span>{selectedFont}</span>
              
              <span>Rockwell loaded:</span>
              <span className={rockwellLoaded ? 'text-green-400' : 'text-red-400'}>
                {rockwellLoaded ? 'Yes' : 'No'}
              </span>
              
              <span>Arslan loaded:</span>
              <span className={arslanLoaded ? 'text-green-400' : 'text-red-400'}>
                {arslanLoaded ? 'Yes' : 'No'}
              </span>
              
              <span>Font class:</span>
              <span>{getFontClass()}</span>
              
              <span>Card size:</span>
              <span>{cardWidth}×{cardHeight}mm</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

const calculateFontSize = (message: string, width: number, height: number, fontSizePercentage: number = 100): string => {
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
  
  // Apply font size adjustment
  baseFontSize = baseFontSize * (fontSizePercentage / 100);
  
  baseFontSize = Math.min(Math.max(baseFontSize, 12), 24);
  
  return `${baseFontSize}px`;
};

export default MessageCard;
