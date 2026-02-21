import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MeowthChatProps {
  onClose: () => void;
  currentPost?: any;
}

const MeowthChat = ({ onClose, currentPost }: MeowthChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Meowth! That's right! 😺 I'm Meowth, your RocketDex assistant! Ask me anything about Pokemon sightings, and I'll read posts aloud for ya! What can I do for ya, twerp?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('meowth-chat', {
        body: {
          messages: [...messages, { role: 'user', content: userMsg }],
          currentPost: currentPost ? {
            pokemon_name: currentPost.pokemon_name,
            display_type: currentPost.display_type,
            display_location: currentPost.display_location,
            display_habitat: currentPost.display_habitat,
            display_size: currentPost.display_size,
            title: currentPost.title,
            description: currentPost.description,
          } : null,
        },
      });

      if (error) throw error;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || "Meowth! Something went wrong, that's not right!",
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Meowth! My connection's scratchy right now! Try again later! 😿",
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-30 w-80 h-96 bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-accent">
      {/* Header */}
      <div className="bg-accent px-3 py-2 flex items-center justify-between">
        <span className="font-pixel text-[9px] text-accent-foreground">😺 Meowth</span>
        <button onClick={onClose} className="text-accent-foreground hover:scale-110 transition-transform">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 font-pixel text-[7px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-card-foreground'
              }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-xl px-3 py-2 font-pixel text-[7px] text-muted-foreground animate-pulse">
              Meowth is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask Meowth..."
          className="flex-1 px-3 py-2 rounded-lg bg-muted font-pixel text-[8px] text-card-foreground outline-none border border-border focus:border-accent"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-accent text-accent-foreground rounded-lg p-2 hover:scale-105 transition-transform disabled:opacity-50"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default MeowthChat;
