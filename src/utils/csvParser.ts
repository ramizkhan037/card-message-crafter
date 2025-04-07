
import Papa from 'papaparse';

export interface MessageRecord {
  id: string;
  message: string;
  sender?: string;
  recipient?: string;
  occasion?: string;
  orderNumber?: string;
  [key: string]: string | undefined;
}

export const parseCSV = (file: File): Promise<MessageRecord[]> => {
  return new Promise((resolve, reject) => {
    console.log('Starting to parse file:', file.name, file.type);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep everything as strings for Excel CSV
      encoding: "UTF-8", // Handle encoding issues in Excel CSV
      complete: (results) => {
        console.log('Parse complete, raw results:', results);
        
        // Check if results.data exists and has items
        if (!results.data || !Array.isArray(results.data) || results.data.length === 0) {
          console.warn('No data found in CSV file');
          resolve([]);
          return;
        }
        
        // Generate an ID for each record if not present
        const records = results.data
          .map((record: any, index) => {
            console.log(`Processing record ${index}:`, record);
            
            // Add ID if missing
            if (!record.id) {
              record.id = `msg-${index}`;
            }
            
            // Convert keys to lowercase to handle case insensitivity in Excel exports
            const normalizedRecord: any = {};
            Object.keys(record).forEach(key => {
              // Skip empty keys which can come from Excel
              if (key.trim() === '') return;
              
              const lowerKey = key.toLowerCase().trim();
              normalizedRecord[lowerKey] = record[key];
            });
            
            // Ensure message property exists - might be under a different case in Excel
            if (!normalizedRecord.message && normalizedRecord.Message) {
              normalizedRecord.message = normalizedRecord.Message;
            }
            
            return normalizedRecord as MessageRecord;
          })
          .filter((record: MessageRecord) => {
            const hasMessage = record.message && record.message.trim() !== '';
            if (!hasMessage) {
              console.warn('Filtered out record missing message:', record);
            }
            return hasMessage;
          });
        
        console.log(`Processed ${results.data.length} rows, returning ${records.length} valid message records`);
        resolve(records);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        reject(error);
      },
    });
  });
};

export const downloadSampleCSV = () => {
  const csvContent = `message,sender,recipient,occasion,orderNumber
"Happy Birthday! Wishing you a wonderful day filled with joy and happiness.",John Doe,Jane Smith,Birthday,ORD12345
"Congratulations on your graduation! We are so proud of your accomplishments.",Mom & Dad,Alex Johnson,Graduation,ORD12346
"Thank you for being such an amazing friend. Your support means the world to me.",Sarah,Michael,Thank You,ORD12347`;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', 'sample-messages.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
