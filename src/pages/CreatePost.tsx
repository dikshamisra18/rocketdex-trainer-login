import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';

const POKEMON_TYPES = [
  'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison',
  'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon',
  'Dark', 'Steel', 'Fairy', 'Normal'
];

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    pokemon_name: '',
    pokemon_type: POKEMON_TYPES[0],
    pokemon_size: '',
    sighting_location: '',
    habitat: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    let imageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        toast.error('Failed to upload image');
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      title: form.title,
      description: form.description || null,
      image_url: imageUrl,
      pokemon_name: form.pokemon_name,
      pokemon_type: form.pokemon_type,
      pokemon_size: form.pokemon_size || null,
      sighting_location: form.sighting_location,
      habitat: form.habitat || null,
    });

    if (error) {
      toast.error('Failed to create post');
    } else {
      toast.success('Pokemon sighting reported!');
      navigate('/feed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-night-top to-night-bottom">
      <header className="flex items-center gap-3 px-4 py-3 bg-primary/90">
        <button onClick={() => navigate('/feed')} className="text-primary-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-pixel text-[10px] text-primary-foreground">Report a Sighting</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-3">
        {/* Image Upload */}
        <label className="block w-full aspect-video bg-card/80 rounded-xl border-2 border-dashed border-border cursor-pointer overflow-hidden hover:border-primary transition-colors">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Upload size={24} className="text-muted-foreground" />
              <span className="font-pixel text-[8px] text-muted-foreground">Upload Photo</span>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>

        <input
          type="text"
          placeholder="Post Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="w-full p-3 rounded-lg border-2 border-secondary font-pixel text-[10px] bg-card/90 text-card-foreground outline-none focus:border-primary transition-colors"
          required
        />

        <input
          type="text"
          placeholder="Pokemon Name"
          value={form.pokemon_name}
          onChange={e => setForm({ ...form, pokemon_name: e.target.value })}
          className="w-full p-3 rounded-lg border-2 border-secondary font-pixel text-[10px] bg-card/90 text-card-foreground outline-none focus:border-primary transition-colors"
          required
        />

        <select
          value={form.pokemon_type}
          onChange={e => setForm({ ...form, pokemon_type: e.target.value })}
          className="w-full p-3 rounded-lg border-2 border-secondary font-pixel text-[10px] bg-card/90 text-card-foreground outline-none focus:border-primary transition-colors"
        >
          {POKEMON_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Size (e.g., 1.2m)"
          value={form.pokemon_size}
          onChange={e => setForm({ ...form, pokemon_size: e.target.value })}
          className="w-full p-3 rounded-lg border-2 border-secondary font-pixel text-[10px] bg-card/90 text-card-foreground outline-none focus:border-primary transition-colors"
        />

        <input
          type="text"
          placeholder="Sighting Location"
          value={form.sighting_location}
          onChange={e => setForm({ ...form, sighting_location: e.target.value })}
          className="w-full p-3 rounded-lg border-2 border-secondary font-pixel text-[10px] bg-card/90 text-card-foreground outline-none focus:border-primary transition-colors"
          required
        />

        <input
          type="text"
          placeholder="Habitat"
          value={form.habitat}
          onChange={e => setForm({ ...form, habitat: e.target.value })}
          className="w-full p-3 rounded-lg border-2 border-secondary font-pixel text-[10px] bg-card/90 text-card-foreground outline-none focus:border-primary transition-colors"
        />

        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full p-3 rounded-lg border-2 border-secondary font-pixel text-[10px] bg-card/90 text-card-foreground outline-none focus:border-primary transition-colors min-h-[80px] resize-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground font-pixel text-[10px] rounded-lg hover:bg-primary/80 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Submitting...' : '📡 Report Sighting'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
