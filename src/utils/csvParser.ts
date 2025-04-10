
import Papa from 'papaparse';

export interface MessageRecord {
  id: string;
  message: string;
  sender?: string;
  recipient?: string;
  orderNumber?: string;
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
    };
  });
};

export default parseCsv;
