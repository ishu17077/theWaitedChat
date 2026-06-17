export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  isSelf?: boolean;
  isBot?: boolean;
}
