
import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseCSV, MessageRecord } from '@/utils/csvParser';
  
interface FileUploaderProps {
  onUpload: (messages: MessageRecord[]) => void;
}

const FileUploader = ({ onUpload }: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      const messages = await parseCSV(e.target.files[0]);
      onUpload(messages);
      setUploading(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        className="flex items-center gap-2" 
        onClick={() => document.getElementById('file-upload')?.click()}
       disabled={uploading}
      >
        <Upload size={16} />
        {uploading ? 'Processing...' : 'Upload CSV'}
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          accept=".csv"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </Button>
    </div>
  );
};

export default FileUploader;
