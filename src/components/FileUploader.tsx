
import { useState } from 'react';
import { Upload, FileDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { downloadSampleCSV, parseCSV, MessageRecord } from '@/utils/csvParser';

interface FileUploaderProps {
  onUpload: (messages: MessageRecord[]) => void;
  isLoading?: boolean;
}

const FileUploader = ({ onUpload, isLoading = false }: FileUploaderProps) => {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUploadFile(e.target.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUploadFile(e.dataTransfer.files[0]);
    }
  };
  
  const validateAndUploadFile = async (file: File) => {
    console.log('Validating file:', file.name, file.type);
    // Accept both CSV and Excel CSV MIME types
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/comma-separated-values', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
      toast({
        title: "Error",
        description: "Please upload a CSV or Excel file",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Uploading",
      description: `Processing ${file.name}...`,
    });
    
    try {
      const messages = await parseCSV(file);
      onUpload(messages);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast({
        title: "Error",
        description: "Failed to parse the file. Please check the format and try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSampleDownload = () => {
    downloadSampleCSV();
    toast({
      title: "Sample CSV Downloaded",
      description: "You can use this as a template for your messages.",
    });
  };

  return (
    <Card className="w-full p-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-serif text-center">Upload Your Messages</h2>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-colors
            ${dragActive ? 'border-primary bg-secondary/50' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input 
            id="file-upload" 
            type="file"
            className="hidden" 
            accept=".csv,.xls,.xlsx"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Drag and drop your Excel CSV file</h3>
            <p className="text-sm text-muted-foreground">or click to browse files</p>
          </div>
          
          {isLoading && <div className="mt-4 animate-pulse">Processing...</div>}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>Upload Excel CSV files (.csv, .xls, .xlsx)</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSampleDownload}
            className="text-xs flex items-center gap-1"
          >
            <FileDown className="h-3 w-3" /> 
            Download Sample
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FileUploader;
