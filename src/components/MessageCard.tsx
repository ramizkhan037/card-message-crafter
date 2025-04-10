import { MessageRecord } from '@/utils/csvParser';

interface MessageCardProps {
  message: MessageRecord;
}

const MessageCard = ({
  message,
}: MessageCardProps) => {

  return (
    <div className="rounded-lg bg-white flex flex-col justify-between">
      <div className="p-4">
        <p>{message.message}</p>
      </div>
    </div>
  );
};

export default MessageCard;
