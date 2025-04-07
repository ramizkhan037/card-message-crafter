
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
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep everything as strings for Excel CSV
      encoding: "UTF-8", // Handle encoding issues in Excel CSV
      complete: (results) => {
        // Generate an ID for each record if not present
        const records = results.data.map((record: any, index) => {
          if (!record.id) {
            record.id = `msg-${index}`;
          }
          return record as MessageRecord;
        }).filter((record: MessageRecord) => record.message); // Filter out rows without a message
        
        resolve(records);
      },
      error: (error) => {
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
