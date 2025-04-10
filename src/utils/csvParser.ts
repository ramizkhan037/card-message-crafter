import Papa from 'papaparse';

export interface MessageRecord {
  id: string;
  message: string;
}

export const parseCsv = (csvString: string): MessageRecord[] => {
  const parseResult = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
  });
  
  const records = parseResult.data as Record<string, string>[];
  
  return records.map((record, index) => {
    const messageRecord: MessageRecord = {
      id: `msg-${index}-${Date.now()}`,
      message: record.message || '',
    };
    return messageRecord;
  });
};

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
    
    reader.readAsText(file); // Correct position: outside of the callbacks.
  });
};

export default { parseCsv, parseCSV };
