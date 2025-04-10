import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { MessageRecord } from '@/utils/csvParser';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Pencil, 
  Check, 
  X, 
  Bug, 
  FileWarning, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw,
  Smile
} from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

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
  onMessageUpdate?: (id: string, updatedMessage: string, styleData?: any) => void;
  isFolded?: boolean;
  foldPosition?: 'top' | 'bottom';
  pairIndex?: number;
}

// Enhanced MessageRecord with style data
interface EnhancedMessageRecord extends MessageRecord {
  styleData?: {
    wordStyles: Record<string, { fontSize: number }>;
  };
}

// Check if text contains Arabic characters
const containsArabic = (text: string): boolean => {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
};

// Check if a character is an emoji
const isEmoji = (text: string): boolean => {
  // Basic emoji detection regex (can be improved)
  const emojiPattern = /[\p{Emoji}]/u;
  return emojiPattern.test(text);
};

// Split text into words and emojis for styling
const splitIntoWords = (text: string): string[] => {
  // First, replace spaces with special marker to preserve them
  const withMarkedSpaces = text.replace(/\s+/g, ' §SPACE§ ');
  
  // Split by spaces
  const segments = withMarkedSpaces.split(' ');
  
  // Process each segment to separate emojis from text
  const result: string[] = [];
  
  for (const segment of segments) {
    if (segment === '§SPACE§') {
      result.push(' ');
      continue;
    }
    
    if (!segment) continue;
    
    // Check if the segment contains emojis
    if (isEmoji(segment)) {
      // For segments with emojis, treat each character individually
      // This allows styling individual emojis
      [...segment].forEach(char => {
        if (char.trim()) result.push(char);
      });
    } else {
      // For regular words, keep them as is
      result.push(segment);
    }
  }
  
  return result.filter(segment => segment.trim() !== '');
};

const MessageCard = ({ 
  message: initialMessage, 
  cardWidth, 
  cardHeight, 
  selectedFont, 
  selectedColor,
  textAlignment,
  showMetadata,
  fontSize: globalFontSize,
  lineHeight,
  letterSpacing,
  onMessageUpdate,
  isFolded,
  foldPosition,
  pairIndex
}: MessageCardProps) => {
  // Cast to enhanced message to access style data
  const message = initialMessage as EnhancedMessageRecord;
  
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message.message);
  const [debugFont, setDebugFont] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Add state for word styles
  const [wordStyles, setWordStyles] = useState<Record<string, { fontSize: number }>>(
    message.styleData?.wordStyles || {}
  );
  
  // State to track currently selected word for styling
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [wordSegments, setWordSegments] = useState<string[]>([]);
  
  // Update word segments when message changes
  useEffect(() => {
    setWordSegments(splitIntoWords(editedMessage));
  }, [editedMessage]);
  
  // Load saved styles when message changes
  useEffect(() => {
    if (message.styleData?.wordStyles) {
      setWordStyles(message.styleData.wordStyles);
    } else {
      setWordStyles({});
    }
  }, [message]);
  
  const hasArabic = containsArabic(message.message);
  const { rockwellLoaded, arslanLoaded } = checkFontLoading();

  const getFontClass = () => {
    if (debugFont === 'rockwell') {
      return "font-debug-rockwell";
    } else if (debugFont === 'arslan') {
      return "font-debug-arslan";
    } else if (selectedFont === 'auto') {
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
    fontSize: calculateFontSize(message.message, cardWidth, cardHeight, globalFontSize),
    lineHeight: lineHeight.toString(),
  };
  
  const textStyle = {
    color: debugFont ? 'inherit' : selectedColor,
    textAlign: textAlignment,
    letterSpacing: `${letterSpacing}px`,
    direction: hasArabic && !containsArabic(editedMessage.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '')) ? 'rtl' : 'ltr',
  };

  // Modified save function to include word styles
  const handleSave = () => {
    if (onMessageUpdate) {
      onMessageUpdate(message.id, editedMessage, { wordStyles });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMessage(message.message);
    // Reset to saved styles
    setWordStyles(message.styleData?.wordStyles || {});
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

  // Function to get style for a word based on index
  const getWordStyle = (wordIndex: number, baseSize: string) => {
    const word = wordSegments[wordIndex];
    if (!word) return { fontSize: baseSize };
    
    const wordKey = `${wordIndex}-${word}`;
    const style = wordStyles[wordKey];
    
    if (!style) return { fontSize: baseSize };
    
    // Convert base size to number for scaling
    let baseSizeNum = parseFloat(baseSize);
    if (isNaN(baseSizeNum)) baseSizeNum = 16; // Fallback size
    
    // Scale the base size by the word's font size percentage
    const scaledSize = baseSizeNum * (style.fontSize / 100);
    
    return { 
      fontSize: `${scaledSize}px`,
      display: 'inline-block', 
    };
  };

  // Function to set font size for selected word
  const setSelectedWordFontSize = (sizePercent: number) => {
    if (selectedWordIndex === null || selectedWordIndex >= wordSegments.length) return;
    
    const word = wordSegments[selectedWordIndex];
    const wordKey = `${selectedWordIndex}-${word}`;
    
    setWordStyles(prev => ({
      ...prev,
      [wordKey]: {
        ...(prev[wordKey] || {}),
        fontSize: sizePercent
      }
    }));
  };

  // Function to render styled words
  const renderStyledWords = () => {
    const baseSize = calculateFontSize(message.message, cardWidth, cardHeight, globalFontSize);
    
    return (
      <div className={cn("whitespace-pre-wrap break-words", getFontClass())} style={textStyle as React.CSSProperties}>
        {wordSegments.map((word, index) => {
          const isSelected = selectedWordIndex === index && isEditing;
          
          // Special styling for emojis
          const isEmojiWord = isEmoji(word);
          
          return (
            <span
              key={`${index}-${word}`}
              style={getWordStyle(index, baseSize)}
              className={cn(
                "transition-all duration-100",
                isSelected && "word-selected",
                isEmojiWord && "emoji-text" // Add a class for emojis
              )}
              onClick={isEditing ? () => setSelectedWordIndex(index) : undefined}
            >
              {word}
              {word === ' ' ? '\u00A0' : ''}
            </span>
          );
        })}
      </div>
    );
  };

  // Styling toolbar for the selected word
  const renderStylingToolbar = () => {
    if (selectedWordIndex === null || !isEditing) return null;
    
    const word = wordSegments[selectedWordIndex];
    if (!word) return null;
    
    const wordKey = `${selectedWordIndex}-${word}`;
    const currentSize = wordStyles[wordKey]?.fontSize || 100;
    
    return (
      <div className="absolute bottom-4 left-4 right-4 bg-background border rounded-md p-2 shadow-md z-10 no-print styling-toolbar">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            {isEmoji(word) ? "Emoji Size:" : "Word Size:"}
            <span className="ml-2 px-2 py-0.5 bg-secondary rounded text-xs">{word}</span>
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedWordIndex(null)}
            className="h-7 w-7 p-0"
          >
            <X size={14} />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setSelectedWordFontSize(Math.max(50, currentSize - 10))}
          >
            <ZoomOut size={14} />
          </Button>
          
          <div className="flex-1">
            <Slider
              value={[currentSize]}
              min={50}
              max={200}
              step={5}
              onValueChange={(value) => setSelectedWordFontSize(value[0])}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setSelectedWordFontSize(Math.min(200, currentSize + 10))}
          >
            <ZoomIn size={14} />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 w-7 p-0 ml-2"
            onClick={() => setSelectedWordFontSize(100)}
            title="Reset to default size"
          >
            <RefreshCw size={14} />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-1.5 text-center">
          {currentSize}% of base size
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "print-card",
      isFolded && `folded-card folded-card-${foldPosition}`,
      isFolded && pairIndex !== undefined && `folded-pair-${pairIndex}`
    )}>
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
              {renderStyledWords()}
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
                  "flex-1 resize-none border-none focus-visible:ring-0 p-0 mb-4",
                  getFontClass()
                )}
                style={{
                  ...textStyle as React.CSSProperties,
                  fontSize: `calc(${calculateFontSize(message.message, cardWidth, cardHeight, globalFontSize)} * 0.9)`,
                  minHeight: '80px'
                }}
              />
              
              {/* Word styling view */}
              <div className="border rounded-md p-2 mb-4">
                <div className="text-sm font-medium mb-2 flex items-center">
                  <Smile size={16} className="mr-2" />
                  Word & Emoji Sizing
                  <span className="text-xs text-muted-foreground ml-2">
                    (Click any word or emoji to adjust its size)
                  </span>
                </div>
                <div className="p-2 border rounded min-h-20 bg-background/50">
                  {renderStyledWords()}
                </div>
              </div>
              
              {renderStylingToolbar()}
              
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
              
              <span>Word styles:</span>
              <span>{Object.keys(wordStyles).length} words styled</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// Font size calculation function (unchanged)
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

// Font loading check function (unchanged)
const checkFontLoading = (): { rockwellLoaded: boolean, arslanLoaded: boolean } => {
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

export default MessageCard;
