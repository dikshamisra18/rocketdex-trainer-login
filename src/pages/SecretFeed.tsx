import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  pokemon_name: string;
  pokemon_type: string;
  pokemon_size: string | null;
  sighting_location: string;
  habitat: string | null;
  average_rating: number;
  rating_count: number;
  created_at: string;
  profiles?: { username: string; avatar_url: string | null } | null;
}

const SecretFeed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles!posts_user_id_profiles_fkey(username, avatar_url)')
        .eq('is_banned', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setPosts(data as any);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const currentPost = posts[currentIndex];

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-night-top to-night-bottom flex items-center justify-center">
        <p className="font-pixel text-[10px] text-primary-foreground animate-pulse">Accessing classified data...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-night-top to-night-bottom flex flex-col relative overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-destructive/90 z-10">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="text-primary-foreground hover:scale-110 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <span className="font-pixel text-[10px] text-primary-foreground">🔴 TEAM ROCKET — CLASSIFIED</span>
        </div>
        <span className="font-pixel text-[8px] text-accent animate-pulse">TRUTH MODE</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 overflow-hidden">
        {posts.length === 0 ? (
          <p className="font-pixel text-[10px] text-muted-foreground">No sightings in the database.</p>
        ) : currentPost ? (
          <div className="w-full max-w-md bg-card/95 rounded-2xl overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.4)] flex flex-col max-h-[calc(100vh-140px)] border-2 border-destructive/50">
            {currentPost.image_url && (
              <div className="w-full aspect-square bg-muted overflow-hidden">
                <img src={currentPost.image_url} alt={currentPost.pokemon_name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-destructive/30 flex items-center justify-center">
                  <span className="text-[8px]">🚀</span>
                </div>
                <span className="font-pixel text-[8px] text-card-foreground">
                  {currentPost.profiles?.username || 'Unknown Trainer'}
                </span>
                <span className="font-pixel text-[6px] text-destructive ml-auto">UNALTERED</span>
              </div>

              <h3 className="font-pixel text-[10px] text-card-foreground mb-1">{currentPost.pokemon_name}</h3>
              <p className="font-pixel text-[8px] text-card-foreground font-bold mb-1">{currentPost.title}</p>

              {currentPost.description && (
                <p className="font-pixel text-[7px] text-muted-foreground mb-2">{currentPost.description}</p>
              )}

              <div className="grid grid-cols-2 gap-2 text-[7px] font-pixel">
                <div className="bg-destructive/10 rounded-lg p-2 border border-destructive/20">
                  <span className="text-muted-foreground">Type:</span>
                  <p className="text-card-foreground">{currentPost.pokemon_type}</p>
                </div>
                <div className="bg-destructive/10 rounded-lg p-2 border border-destructive/20">
                  <span className="text-muted-foreground">Location:</span>
                  <p className="text-card-foreground">{currentPost.sighting_location}</p>
                </div>
                {currentPost.habitat && (
                  <div className="bg-destructive/10 rounded-lg p-2 border border-destructive/20">
                    <span className="text-muted-foreground">Habitat:</span>
                    <p className="text-card-foreground">{currentPost.habitat}</p>
                  </div>
                )}
                {currentPost.pokemon_size && (
                  <div className="bg-destructive/10 rounded-lg p-2 border border-destructive/20">
                    <span className="text-muted-foreground">Size:</span>
                    <p className="text-card-foreground">{currentPost.pokemon_size}</p>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="font-pixel text-[7px] text-muted-foreground">
                  ⭐ {currentPost.average_rating.toFixed(1)} ({currentPost.rating_count})
                </span>
                <span className="font-pixel text-[7px] text-muted-foreground">
                  {currentIndex + 1} / {posts.length}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        <button
          onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="bg-card/80 rounded-full p-2 disabled:opacity-30 hover:bg-card transition-colors"
        >
          <ChevronUp size={20} className="text-card-foreground" />
        </button>
        <button
          onClick={() => currentIndex < posts.length - 1 && setCurrentIndex(currentIndex + 1)}
          disabled={currentIndex >= posts.length - 1}
          className="bg-card/80 rounded-full p-2 disabled:opacity-30 hover:bg-card transition-colors"
        >
          <ChevronDown size={20} className="text-card-foreground" />
        </button>
      </div>
    </div>
  );
};

export default SecretFeed;
