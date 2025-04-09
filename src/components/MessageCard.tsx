
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
  lineHeight: number;
  letterSpacing: number;
  onMessageUpdate?: (id: string, updatedMessage: string) => void;
}

// Check if text contains Arabic characters
const containsArabic = (text: string): boolean => {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
};

// Process mixed text to properly handle Arabic and English segments
const processTextWithMixedLanguages = (text: string): JSX.Element => {
  // Split text into segments that need to be rendered separately
  const segments = [];
  let currentSegment = '';
  let currentType = null;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const isArabicChar = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(char);
    
    if (currentType === null) {
      // First character
      currentType = isArabicChar ? 'arabic' : 'english';
      currentSegment += char;
    } else if ((currentType === 'arabic' && isArabicChar) || (currentType === 'english' && !isArabicChar)) {
      // Same language, add to current segment
      currentSegment += char;
    } else {
      // Language change, push current segment and start new one
      segments.push({ type: currentType, text: currentSegment });
      currentSegment = char;
      currentType = isArabicChar ? 'arabic' : 'english';
    }
  }
  
  // Push the last segment
  if (currentSegment) {
    segments.push({ type: currentType, text: currentSegment });
  }
  
  return (
    <>
      {segments.map((segment, index) => {
        // Only add a space between different language segments
        // Don't add spaces between segments of the same language
        const needsSpace = index > 0 && 
          segments[index-1].type !== segment.type && 
          !segment.text.startsWith(' ') && 
          !segments[index-1].text.endsWith(' ');
        
        return (
          <span 
            key={index} 
            className={segment.type === 'arabic' ? 'arabic-text' : 'english-text'}
            dir={segment.type === 'arabic' ? 'rtl' : 'ltr'}
            style={{ 
              display: 'inline-block',
              marginLeft: needsSpace && segment.type === 'english' ? '0.35em' : 0,
              marginRight: needsSpace && segment.type === 'arabic' ? '0.35em' : 0
            }}
          >
            {segment.text}
          </span>
        );
      })}
    </>
  );
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
  lineHeight,
  letterSpacing,
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
      // For mixed text, we'll use special rendering instead of a single class
      if (hasArabic) {
        return ""; // Empty class as we'll apply classes per text segment
      } else {
        return "english-text";
      }
    } else {
      return selectedFont === 'serif' ? "font-serif" : "font-sans";
    }
  };

  const cardStyle = {
    width: `${cardWidth}mm`,
    height: `${cardHeight}mm`,
    fontSize: calculateFontSize(message.message, cardWidth, cardHeight, fontSize),
    lineHeight: lineHeight.toString(),
  };
  
  const textStyle = {
    color: debugFont ? 'inherit' : selectedColor,
    textAlign: textAlignment,
    letterSpacing: `${letterSpacing}px`,
    // For Arabic content, set the base direction
    direction: hasArabic && !containsArabic(editedMessage.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '')) ? 'rtl' : 'ltr',
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

  // Render the message content based on whether it has mixed languages
  const renderMessageContent = () => {
    // If using debug font or not auto mode, just render as text
    if (debugFont || selectedFont !== 'auto') {
      return editedMessage;
    }
    
    // Check if text contains both Arabic and non-Arabic characters
    const hasEnglish = editedMessage.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '').trim().length > 0;
    
    if (hasArabic && hasEnglish) {
      // Mixed language content
      return processTextWithMixedLanguages(editedMessage);
    } else if (hasArabic) {
      // Arabic-only content
      return <span className="arabic-text" dir="rtl">{editedMessage}</span>;
    } else {
      // English-only content
      return <span className="english-text" dir="ltr">{editedMessage}</span>;
    }
  };

  return (
    <div className="print-card">
      <Card 
        className={cn(
          "flex flex-col p-6 bg-white transition-all duration-200 ease-in-out print:shadow-none print:border-none card-shadow",
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
                {renderMessageContent()}
              </p>
            </div>
            
            {onMessageUpdate && isHovered && (
              <div className="absolute top-2 right-2 flex gap-2 no-print">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="p-1 h-8 w-8 rounded-full bg-white/90 shadow-sm hover:bg-white"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil size={14} />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "p-1 h-8 w-8 rounded-full bg-white/90 shadow-sm hover:bg-white",
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
                    "p-1 h-8 w-8 rounded-full bg-white/90 shadow-sm hover:bg-white",
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
              <div className="flex justify-end gap-2 mt-4 no-print">
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
          <div className="mt-4 pt-2 border-t border-slate-100 text-xs text-slate-500 no-print">
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
              <span>
                {hasArabic 
                  ? containsArabic(editedMessage.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '')) 
                    ? 'Arabic only' 
                    : 'Mixed languages'
                  : 'English only'}
              </span>
              
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
              <span>{getFontClass() || 'Mixed fonts'}</span>
              
              <span>Card size:</span>
              <span>{cardWidth}×{cardHeight}mm</span>
              
              <span>Line height:</span>
              <span>{lineHeight}</span>
              
              <span>Letter spacing:</span>
              <span>{letterSpacing}px</span>
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
