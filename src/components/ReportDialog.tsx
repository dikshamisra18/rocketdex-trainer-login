import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const REASONS = [
  { value: 'misinformation', label: '🔍 Misinformation' },
  { value: 'profanity', label: '🤬 Profane Language' },
  { value: 'spam', label: '📧 Spam' },
  { value: 'harassment', label: '😠 Harassment' },
  { value: 'other', label: '❓ Other' },
] as const;

interface ReportDialogProps {
  postId: string;
  onClose: () => void;
  onReported: () => void;
}

const ReportDialog = ({ postId, onClose, onReported }: ReportDialogProps) => {
  const { user } = useAuth();
  const [reason, setReason] = useState<string>('misinformation');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      post_id: postId,
      reason: reason as any,
      details: details || null,
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('You already reported this post');
      } else {
        toast.error('Failed to report');
      }
    } else {
      toast.success('Report submitted!');
      onReported();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-5 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-pixel text-[10px] text-card-foreground">Report Post</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-card-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {REASONS.map(r => (
            <label
              key={r.value}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                reason === r.value ? 'bg-primary/20 border border-primary' : 'bg-muted/30 border border-transparent'
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                className="hidden"
              />
              <span className="font-pixel text-[8px] text-card-foreground">{r.label}</span>
            </label>
          ))}
        </div>

        <textarea
          placeholder="Additional details (optional)"
          value={details}
          onChange={e => setDetails(e.target.value)}
          className="w-full p-2 rounded-lg border border-border font-pixel text-[8px] bg-card text-card-foreground outline-none focus:border-primary resize-none min-h-[60px] mb-3"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2 bg-destructive text-destructive-foreground font-pixel text-[8px] rounded-lg hover:bg-destructive/80 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </div>
  );
};

export default ReportDialog;
