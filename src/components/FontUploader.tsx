
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, Upload } from 'lucide-react';

const FontUploader = () => {
  const [rockwellUploaded, setRockwellUploaded] = useState(false);
  const [arslanUploaded, setArslanUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // This function is just for demonstration - actual font conversion requires server-side processing
  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>, fontType: 'rockwell' | 'arslan') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if it's a TTF file
    if (!file.name.toLowerCase().endsWith('.ttf')) {
      setError(`Please upload a TrueType font (.ttf) file for ${fontType === 'rockwell' ? 'Rockwell Bold' : 'A Arslan Wessam A'}`);
      return;
    }

    // This would normally upload and convert the font, but we'll simulate success
    setTimeout(() => {
      if (fontType === 'rockwell') {
        setRockwellUploaded(true);
      } else {
        setArslanUploaded(true);
      }
      
      setMessage(`${file.name} uploaded successfully. Note: Since font conversion requires server-side processing, you'll still need to convert this TTF to WOFF/WOFF2 manually using an online converter.`);
      setError(null);
      
      // Reset the file input
      e.target.value = '';
    }, 500);
  };

  const renderFontStatus = (uploaded: boolean, fontName: string) => (
    <div className="flex items-center gap-1.5 text-sm">
      {uploaded ? (
        <>
          <Check size={16} className="text-green-500" />
          <span className="text-green-700">{fontName} file selected</span>
        </>
      ) : (
        <span className="text-muted-foreground">No {fontName} file selected</span>
      )}
    </div>
  );

  return (
    <div className="space-y-4 bg-secondary/50 p-4 rounded-lg">
      <div>
        <h3 className="text-base font-medium">Font Uploader</h3>
        <p className="text-sm text-muted-foreground">
          Upload your TTF fonts to use with the card message crafter
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="rockwell-upload">Upload Rockwell Bold (TTF)</Label>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => document.getElementById('rockwell-upload')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Rockwell Bold file
            </Button>
            <input
              id="rockwell-upload"
              type="file"
              accept=".ttf"
              className="hidden"
              onChange={(e) => handleFontUpload(e, 'rockwell')}
            />
          </div>
          {renderFontStatus(rockwellUploaded, 'Rockwell Bold')}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="arslan-upload">Upload A Arslan Wessam A (TTF)</Label>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              className="w-full justify-start"
              onClick={() => document.getElementById('arslan-upload')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose A Arslan Wessam A file
            </Button>
            <input
              id="arslan-upload"
              type="file"
              accept=".ttf"
              className="hidden"
              onChange={(e) => handleFontUpload(e, 'arslan')}
            />
          </div>
          {renderFontStatus(arslanUploaded, 'A Arslan Wessam A')}
        </div>
      </div>

      <div className="text-sm p-3 bg-muted/50 rounded border border-border mt-4">
        <p className="font-medium mb-1">Important Note About Font Conversion:</p>
        <p className="text-muted-foreground">
          This tool only allows you to select TTF files, but the application requires WOFF/WOFF2 formats. 
          After selecting your fonts, you still need to:
        </p>
        <ol className="list-decimal pl-5 mt-2 space-y-1 text-muted-foreground">
          <li>Convert your files using an online converter like <a href="https://transfonter.org/" target="_blank" className="underline text-primary">Transfonter</a> or <a href="https://www.fontsquirrel.com/tools/webfont-generator" target="_blank" className="underline text-primary">Font Squirrel</a></li>
          <li>Download the converted WOFF/WOFF2 files</li>
          <li>Rename them to <strong>exactly</strong>: Rockwell-Bold.woff, Rockwell-Bold.woff2, AArslanWessamA.woff, and AArslanWessamA.woff2</li>
          <li>Place them in the project's public/fonts directory</li>
        </ol>
      </div>
    </div>
  );
};

export default FontUploader;
