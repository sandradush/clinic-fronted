import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: number;
  message: string;
  sender: string;
  time: string;
}

const DoctorSidebarChat: React.FC = () => {
  const { user } = useAuth();
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        const websocket = new WebSocket(`wss://chat.mababa.app/ws/${user.id}`);
        websocket.onopen = () => {
          setIsConnected(true);
          reconnectAttempts = 0;
        };
        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const newMessage = {
              id: Date.now(),
              message: data.content || data.message || data.text || event.data,
              sender: data.sender_id === user.id || data.sender === user.id?.toString() ? 'You' : 'Other',
              time: new Date().toLocaleTimeString()
            };
            setChatHistory(prev => [...prev, newMessage]);
          } catch {
            const messageText = event.data.toString();
            if (messageText.trim()) {
              const newMessage = {
                id: Date.now(),
                message: messageText,
                sender: 'Other',
                time: new Date().toLocaleTimeString()
              };
              setChatHistory(prev => [...prev, newMessage]);
            }
          }
        };
        websocket.onerror = () => {
          setIsConnected(false);
        };
        websocket.onclose = (event) => {
          setIsConnected(false);
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            reconnectTimeout = setTimeout(connectWebSocket, 3000 * reconnectAttempts);
          }
        };
        setWs(websocket);
        return websocket;
      } catch {
        setIsConnected(false);
        return null;
      }
    };
    const websocket = connectWebSocket();
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (websocket) websocket.close(1000, 'Component unmounting');
    };
  }, [user]);

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !ws || !isConnected) return;
    try {
      const messageData = {
        type: 'message',
        sender_id: user?.id,
        content: chatMessage.trim(),
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(messageData));
      const newMessage = {
        id: Date.now(),
        message: chatMessage.trim(),
        sender: 'You',
        time: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, newMessage]);
      setChatMessage('');
    } catch {
      toast.error('Failed to send message.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#001e3c] text-white border-t border-blue-900/50 p-2">
      <div className="font-bold mb-2">Chat</div>
      <div className="flex-1 overflow-y-auto mb-2 bg-[#002b4d] rounded p-2">
        {chatHistory.length === 0 ? (
          <div className="text-blue-100 text-sm text-center mt-4">No messages yet.</div>
        ) : (
          chatHistory.map(msg => (
            <div key={msg.id} className={`mb-2 ${msg.sender === 'You' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block px-3 py-2 rounded-lg ${msg.sender === 'You' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-900'}`}>
                <div className="text-xs font-semibold mb-1">{msg.sender}</div>
                <div className="text-sm">{msg.message}</div>
                <div className="text-[10px] mt-1 opacity-70">{msg.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-1">
        <input
          type="text"
          value={chatMessage}
          onChange={e => setChatMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 px-2 py-1 rounded bg-[#003366] text-white border border-blue-900 focus:outline-none"
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <button
          onClick={handleSendMessage}
          disabled={!chatMessage.trim() || !isConnected}
          className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white disabled:opacity-50"
        >Send</button>
      </div>
      <div className={`mt-1 text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>{isConnected ? 'Connected' : 'Disconnected'}</div>
    </div>
  );
};

export default DoctorSidebarChat;
