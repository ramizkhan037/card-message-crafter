
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  AlignCenter, 
  AlignLeft, 
  AlignRight,
  Printer,
  Settings,
  FileText,
  Languages,
  Type,
  LineHeight,
  LetterSpacing
} from "lucide-react";

interface CardSettingsProps {
  cardWidth: number;
  setCardWidth: (width: number) => void;
  cardHeight: number;
  setCardHeight: (height: number) => void;
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  textAlignment: 'left' | 'center' | 'right';
  setTextAlignment: (alignment: 'left' | 'center' | 'right') => void;
  showMetadata: boolean;
  setShowMetadata: (show: boolean) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
  letterSpacing: number;
  setLetterSpacing: (spacing: number) => void;
  onPrint: () => void;
}

const CardSettings = ({
  cardWidth,
  setCardWidth,
  cardHeight,
  setCardHeight,
  selectedFont,
  setSelectedFont,
  selectedColor,
  setSelectedColor,
  textAlignment,
  setTextAlignment,
  showMetadata,
  setShowMetadata,
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  letterSpacing,
  setLetterSpacing,
  onPrint
}: CardSettingsProps) => {
  const presetSizes = [
    { name: "A6 Folded", width: 105, height: 148 },
    { name: "A5 Folded", width: 148, height: 210 },
    { name: "Small Square", width: 100, height: 100 },
    { name: "Thank You", width: 90, height: 120 },
  ];

  // Handler for numeric input changes with validation
  const handleNumericChange = (
    value: string, 
    setter: (val: number) => void, 
    min: number, 
    max: number,
    defaultVal: number
  ) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      setter(defaultVal);
    } else if (parsed < min) {
      setter(min);
    } else if (parsed > max) {
      setter(max);
    } else {
      setter(parsed);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Card Settings
        </CardTitle>
        <CardDescription>Customize how your message cards look</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="size">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="size">Size</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="fonts">Fonts</TabsTrigger>
            <TabsTrigger value="print">Print</TabsTrigger>
          </TabsList>
          
          <TabsContent value="size" className="space-y-4">
            <div>
              <Label>Select a preset size</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {presetSizes.map((size) => (
                  <Button
                    key={size.name}
                    variant="outline"
                    size="sm"
                    className={`${
                      cardWidth === size.width && cardHeight === size.height
                        ? 'bg-secondary'
                        : ''
                    }`}
                    onClick={() => {
                      setCardWidth(size.width);
                      setCardHeight(size.height);
                    }}
                  >
                    {size.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Width (mm)</Label>
                  <span className="text-sm">{cardWidth} mm</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Slider
                    value={[cardWidth]}
                    min={50}
                    max={300}
                    step={1}
                    onValueChange={(value) => setCardWidth(value[0])}
                  />
                  <Input
                    type="number"
                    value={cardWidth}
                    onChange={(e) => setCardWidth(Number(e.target.value))}
                    className="w-16"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Height (mm)</Label>
                  <span className="text-sm">{cardHeight} mm</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Slider
                    value={[cardHeight]}
                    min={50}
                    max={300}
                    step={1}
                    onValueChange={(value) => setCardHeight(value[0])}
                  />
                  <Input
                    type="number"
                    value={cardHeight}
                    onChange={(e) => setCardHeight(Number(e.target.value))}
                    className="w-16"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="style" className="space-y-6">
            {/* Typography controls like Adobe Illustrator */}
            <div className="bg-secondary/30 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Type className="h-4 w-4 mr-1.5" />
                Typography Controls
              </h3>
              
              <div className="space-y-4">
                {/* Font Size */}
                <div className="grid grid-cols-5 gap-2 items-center">
                  <Label className="col-span-2">Font Size (%)</Label>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={fontSize}
                      min={70}
                      max={150}
                      step={1}
                      onChange={(e) => handleNumericChange(e.target.value, setFontSize, 70, 150, 100)}
                      className="w-full text-right"
                    />
                  </div>
                  <div className="text-sm">%</div>
                </div>
                
                {/* Line Height */}
                <div className="grid grid-cols-5 gap-2 items-center">
                  <Label className="col-span-2 flex items-center gap-1">
                    <LineHeight className="h-3.5 w-3.5" /> Line Height
                  </Label>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={lineHeight}
                      min={0.8}
                      max={3}
                      step={0.1}
                      onChange={(e) => handleNumericChange(e.target.value, setLineHeight, 0.8, 3, 1.5)}
                      className="w-full text-right"
                    />
                  </div>
                  <div className="text-sm">×</div>
                </div>
                
                {/* Letter Spacing */}
                <div className="grid grid-cols-5 gap-2 items-center">
                  <Label className="col-span-2 flex items-center gap-1">
                    <LetterSpacing className="h-3.5 w-3.5" /> Letter Spacing
                  </Label>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={letterSpacing}
                      min={-2}
                      max={10}
                      step={0.5}
                      onChange={(e) => handleNumericChange(e.target.value, setLetterSpacing, -2, 10, 0)}
                      className="w-full text-right"
                    />
                  </div>
                  <div className="text-sm">px</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="grid grid-cols-6 gap-2">
                {['#000000', '#2D3047', '#D4AF37', '#9DB4C0', '#7B506F', '#1B4965'].map(color => (
                  <div 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 w-full rounded-md cursor-pointer border-2 ${
                      selectedColor === color ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Text Alignment</Label>
              <div className="flex space-x-2">
                <Button 
                  variant={textAlignment === 'left' ? 'default' : 'outline'} 
                  size="icon"
                  onClick={() => setTextAlignment('left')}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant={textAlignment === 'center' ? 'default' : 'outline'} 
                  size="icon"
                  onClick={() => setTextAlignment('center')}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button 
                  variant={textAlignment === 'right' ? 'default' : 'outline'} 
                  size="icon"
                  onClick={() => setTextAlignment('right')}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="show-metadata"
                checked={showMetadata}
                onCheckedChange={setShowMetadata}
              />
              <Label htmlFor="show-metadata">Show sender/recipient info</Label>
            </div>
          </TabsContent>
          
          <TabsContent value="fonts" className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Font Selection
              </Label>
              <RadioGroup 
                value={selectedFont} 
                onValueChange={(value) => setSelectedFont(value)}
                className="grid grid-cols-3 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="auto" id="auto" />
                  <Label htmlFor="auto" className="text-sm">Auto Detect</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="serif" id="serif" />
                  <Label htmlFor="serif" className="font-serif text-sm">Serif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sans" id="sans" />
                  <Label htmlFor="sans" className="font-sans text-sm">Sans-Serif</Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground mt-1">
                Auto detect will use Rockwell Bold for English and A Arslan Wessam A for Arabic
              </p>
            </div>
            
            <div className="bg-secondary/50 p-4 rounded-lg mt-4">
              <div>
                <h3 className="text-base font-medium">Font Information</h3>
                <p className="text-sm text-muted-foreground">
                  This application uses the following fonts:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                  <li><span className="font-medium">Rockwell Bold</span>: Used for English text</li>
                  <li><span className="font-medium">A Arslan Wessam A</span>: Used for Arabic text</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  These fonts are automatically loaded from the public/fonts directory
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="print" className="space-y-4">
            <div className="bg-secondary p-4 rounded-md space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Print Instructions
              </div>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Ensure your printer is properly configured.</li>
                <li>In the print dialog, set margins to "None" or "Minimum".</li>
                <li>Choose "Actual Size" rather than "Fit to Page".</li>
                <li>For multiple cards, select "Multiple pages per sheet" for efficiency.</li>
              </ul>
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={onPrint}
              size="lg"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Cards
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CardSettings;
