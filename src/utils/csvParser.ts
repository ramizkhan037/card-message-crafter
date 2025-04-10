
import Papa from 'papaparse';

export interface MessageRecord {
  id: string;
  message: string;
  sender?: string;
  recipient?: string;
  orderNumber?: string;
  styleData?: {
    wordStyles: Record<string, { fontSize: number }>;
  };
  [key: string]: string | undefined | {
    wordStyles: Record<string, { fontSize: number }>;
  };
}

// Function that parses CSV string
export const parseCsv = (csvString: string): MessageRecord[] => {
  const parseResult = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
  });
  
  if (parseResult.errors && parseResult.errors.length > 0) {
    console.error('CSV parsing errors:', parseResult.errors);
  }
  
  // Add unique ID to each record
  const records = parseResult.data as Record<string, string>[];
  
  console.log('Raw parsed records:', records); // Debug logging
  
  return records.map((record, index) => {
    const messageRecord: MessageRecord = {
      id: `msg-${index}-${Date.now()}`,
      message: record.message || '',
      sender: record.sender,
      recipient: record.recipient,
      orderNumber: record.orderNumber || record.order,
      styleData: {
        wordStyles: {}
      }
    };
    console.log('Created message record:', messageRecord); // Debug logging
    return messageRecord;
  });
};

// Function that works with File objects
export const parseCSV = (file: File): Promise<MessageRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvString = e.target?.result as string;
        console.log('CSV content:', csvString.substring(0, 100) + '...'); // Show beginning of CSV
        
        const records = parseCsv(csvString);
        console.log('Parsed CSV Records count:', records.length); // Add debugging
        console.log('First record (if exists):', records[0]);
        
        resolve(records);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

// Sample CSV download function
export const downloadSampleCSV = () => {
  const csvContent = `message,sender,recipient,orderNumber
"Happy Birthday! Wishing you a wonderful day filled with joy and happiness.",John Doe,Jane Smith,ORD12345
"Congratulations on your graduation! We are so proud of your accomplishments.",Mom & Dad,Alex Johnson,ORD12346
"Thank you for being such an amazing friend. Your support means the world to me.",Sarah,Michael,ORD12347`;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', 'sample-messages.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Make sure we're exporting both the functions and the default object correctly
export { parseCsv, parseCSV, downloadSampleCSV };
export default { parseCsv, parseCSV, downloadSampleCSV };
