
import { useState } from 'react';
import { Upload, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { downloadSampleCSV, parseCSV, MessageRecord } from '@/utils/csvParser';

interface FileUploaderProps {
  onUpload: (messages: MessageRecord[]) => void;
  isLoading?: boolean;
}

const FileUploader = ({ onUpload, isLoading = false }: FileUploaderProps) => {
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUploadFile(e.target.files[0]);
    }
  };
  
  const validateAndUploadFile = async (file: File) => {
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
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        className="flex items-center gap-2" 
        onClick={() => document.getElementById('file-upload')?.click()}
        disabled={isLoading}
      >
        <Upload size={16} />
        {isLoading ? 'Processing...' : 'Upload CSV'}
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          accept=".csv,.xls,.xlsx"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={handleSampleDownload}
        title="Download sample CSV template"
      >
        <FileDown size={16} />
      </Button>
    </div>
  );
};

export default FileUploader;
