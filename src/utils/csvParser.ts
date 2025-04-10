
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
  
  return records.map((record, index) => {
    return {
      id: `msg-${index}-${Date.now()}`,
      message: record.message || '',
      sender: record.sender,
      recipient: record.recipient,
      orderNumber: record.orderNumber || record.order,
      styleData: {
        wordStyles: {}
      }
    };
  });
};

// Add the missing parseCSV function that works with File objects
export const parseCSV = (file: File): Promise<MessageRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvString = e.target?.result as string;
        const records = parseCsv(csvString);
        resolve(records);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

// Add the missing downloadSampleCSV function
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

export default parseCsv;
