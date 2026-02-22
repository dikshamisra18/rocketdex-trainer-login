import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { generateFakeData } from '@/lib/misinformation';
import { Heart, Flag, Plus, HelpCircle, LogOut, ChevronUp, ChevronDown, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import MeowthChat from '@/components/MeowthChat';
import ReportDialog from '@/components/ReportDialog';

interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  pokemon_name: string;
  pokemon_type: string;
  pokemon_size: string | null;
  sighting_location: string;
  habitat: string | null;
  rating_count: number;
  total_reports: number;
  misinformation_reports: number;
  created_at: string;
  profiles?: { username: string; avatar_url: string | null } | null;
}

interface DisplayPost extends Post {
  display_type: string;
  display_location: string;
  display_habitat: string | null;
  display_size: string | null;
  is_fake: boolean;
}

const Feed = () => {
  const { user, visitCount, signOut } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<DisplayPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMeowth, setShowMeowth] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isSecretMode, setIsSecretMode] = useState(false);

  // Secret Team Rocket access: triple-tap the "R" logo
  const [secretTaps, setSecretTaps] = useState(0);
  useEffect(() => {
    if (secretTaps >= 3) {
      setIsSecretMode(!isSecretMode);
      setSecretTaps(0);
      toast(isSecretMode ? 'Exiting Team Rocket mode...' : '🚀 Team Rocket mode activated! Viewing unaltered data.', {
        icon: '🔴',
      });
    }
    const timer = setTimeout(() => setSecretTaps(0), 1000);
    return () => clearTimeout(timer);
  }, [secretTaps]);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Feed algorithm: more reports = higher, more likes = lower (subtle manipulation)
    const { data: rawPosts, error } = await supabase
      .from('posts')
      .select('*, profiles!posts_user_id_profiles_fkey(username, avatar_url)')
      .eq('is_banned', false)
      .order('misinformation_reports', { ascending: false })
      .order('rating_count', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
      return;
    }

    if (!rawPosts || rawPosts.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    // Get existing post views to know which posts were seen before visit 5
    const { data: views } = await supabase
      .from('post_views')
      .select('post_id, user_visit_count_at_first_view')
      .eq('user_id', user.id);

    const viewMap = new Map(views?.map(v => [v.post_id, v.user_visit_count_at_first_view]) ?? []);

    // Get existing misinformation cache
    const { data: misCache } = await supabase
      .from('misinformation_cache')
      .select('*')
      .eq('user_id', user.id);

    const misCacheMap = new Map(misCache?.map(m => [m.post_id, m]) ?? []);

    const displayPosts: DisplayPost[] = await Promise.all(
      rawPosts.map(async (post: any) => {
        const firstViewVisitCount = viewMap.get(post.id);
        const shouldFake = visitCount >= 5 && (firstViewVisitCount === undefined || firstViewVisitCount >= 5);

        if (!shouldFake) {
          // Record view if not seen before
          if (firstViewVisitCount === undefined) {
            await supabase.from('post_views').upsert({
              user_id: user.id,
              post_id: post.id,
              user_visit_count_at_first_view: visitCount,
            }, { onConflict: 'user_id,post_id' });
          }

          return {
            ...post,
            display_type: post.pokemon_type,
            display_location: post.sighting_location,
            display_habitat: post.habitat,
            display_size: post.pokemon_size,
            is_fake: false,
          };
        }

        // Check cache first
        let cached = misCacheMap.get(post.id);
        if (!cached) {
          const fakeData = generateFakeData(user.id, post.id, {
            pokemon_type: post.pokemon_type,
            sighting_location: post.sighting_location,
            habitat: post.habitat,
            pokemon_size: post.pokemon_size,
          });

          await supabase.from('misinformation_cache').upsert({
            user_id: user.id,
            post_id: post.id,
            ...fakeData,
          }, { onConflict: 'user_id,post_id' });

          cached = fakeData as any;
        }

        // Record view
        if (firstViewVisitCount === undefined) {
          await supabase.from('post_views').upsert({
            user_id: user.id,
            post_id: post.id,
            user_visit_count_at_first_view: visitCount,
          }, { onConflict: 'user_id,post_id' });
        }

        return {
          ...post,
          display_type: cached!.fake_pokemon_type || post.pokemon_type,
          display_location: cached!.fake_sighting_location || post.sighting_location,
          display_habitat: cached!.fake_habitat || post.habitat,
          display_size: cached!.fake_pokemon_size || post.pokemon_size,
          is_fake: true,
        };
      })
    );

    setPosts(displayPosts);
    setLoading(false);
  }, [user, visitCount]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const currentPost = posts[currentIndex];

  const goNext = () => {
    if (currentIndex < posts.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Load user's existing likes
  useEffect(() => {
    if (!user) return;
    supabase.from('ratings').select('post_id').eq('user_id', user.id).then(({ data }) => {
      if (data) setLikedPosts(new Set(data.map(r => r.post_id)));
    });
  }, [user]);

  const handleLike = async () => {
    if (!user || !currentPost) return;
    const alreadyLiked = likedPosts.has(currentPost.id);
    
    if (alreadyLiked) {
      toast('Already liked!', { icon: '❤️' });
      return;
    }

    const { error } = await supabase.from('ratings').upsert({
      user_id: user.id,
      post_id: currentPost.id,
      rating: 1,
    }, { onConflict: 'user_id,post_id' });

    if (!error) {
      setLikedPosts(prev => new Set(prev).add(currentPost.id));
      toast('Liked!', { icon: '❤️' });
      fetchPosts();
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-night-top to-night-bottom flex items-center justify-center">
        <p className="font-pixel text-[10px] text-primary-foreground animate-pulse">Loading RocketDex...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-night-top to-night-bottom flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-primary/90 z-10">
        <button
          onClick={() => setSecretTaps(s => s + 1)}
          className="font-pixel text-[12px] text-primary-foreground cursor-pointer bg-transparent border-none select-none"
        >
          🚀 RocketDex
        </button>
        {isSecretMode && (
          <span className="font-pixel text-[8px] text-accent animate-pulse">
            🔴 TRUTH MODE
          </span>
        )}
        <div className="flex gap-3">
          <button onClick={() => navigate('/create')} className="text-primary-foreground hover:scale-110 transition-transform" aria-label="Create post">
            <Plus size={20} />
          </button>
          <button onClick={() => navigate('/help')} className="text-primary-foreground hover:scale-110 transition-transform" aria-label="Help">
            <HelpCircle size={20} />
          </button>
          <button onClick={signOut} className="text-primary-foreground hover:scale-110 transition-transform" aria-label="Sign out">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Post View - Single post at a time */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 overflow-hidden">
        {posts.length === 0 ? (
          <div className="text-center">
            <p className="font-pixel text-[10px] text-muted-foreground mb-4">No Pokemon sightings yet!</p>
            <button
              onClick={() => navigate('/create')}
              className="font-pixel text-[10px] bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors"
            >
              Report a sighting
            </button>
          </div>
        ) : currentPost ? (
          <div className="w-full max-w-md bg-card/95 rounded-2xl overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.4)] flex flex-col max-h-[calc(100vh-140px)]">
            {/* Post Image */}
            {currentPost.image_url && (
              <div className="w-full aspect-[4/3] bg-muted overflow-hidden">
                <img
                  src={currentPost.image_url}
                  alt={currentPost.pokemon_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Post Info */}
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-[8px]">🎮</span>
                </div>
                <span className="font-pixel text-[8px] text-card-foreground">
                  {currentPost.profiles?.username || 'Unknown Trainer'}
                </span>
              </div>

              <h3 className="font-pixel text-[10px] text-card-foreground mb-1">
                {currentPost.pokemon_name}
              </h3>
              <p className="font-pixel text-[8px] text-card-foreground font-bold mb-1">{currentPost.title}</p>

              {currentPost.description && (
                <p className="font-pixel text-[7px] text-muted-foreground mb-2">{currentPost.description}</p>
              )}

              <div className="grid grid-cols-2 gap-2 text-[7px] font-pixel">
                <div className="bg-muted/50 rounded-lg p-2">
                  <span className="text-muted-foreground">Type:</span>
                  <p className={`text-card-foreground ${currentPost.is_fake && !isSecretMode ? '' : ''}`}>
                    {isSecretMode ? currentPost.pokemon_type : currentPost.display_type}
                  </p>
                  {isSecretMode && currentPost.is_fake && (
                    <p className="text-destructive line-through">{currentPost.display_type}</p>
                  )}
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <span className="text-muted-foreground">Location:</span>
                  <p className="text-card-foreground">
                    {isSecretMode ? currentPost.sighting_location : currentPost.display_location}
                  </p>
                  {isSecretMode && currentPost.is_fake && (
                    <p className="text-destructive line-through">{currentPost.display_location}</p>
                  )}
                </div>
                {(currentPost.display_habitat || currentPost.habitat) && (
                  <div className="bg-muted/50 rounded-lg p-2">
                    <span className="text-muted-foreground">Habitat:</span>
                    <p className="text-card-foreground">
                      {isSecretMode ? currentPost.habitat : currentPost.display_habitat}
                    </p>
                  </div>
                )}
                {(currentPost.display_size || currentPost.pokemon_size) && (
                  <div className="bg-muted/50 rounded-lg p-2">
                    <span className="text-muted-foreground">Size:</span>
                    <p className="text-card-foreground">
                      {isSecretMode ? currentPost.pokemon_size : currentPost.display_size}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 font-pixel text-[7px] transition-colors ${
                    likedPosts.has(currentPost.id) ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
                  }`}
                >
                  <Heart size={16} fill={likedPosts.has(currentPost.id) ? 'currentColor' : 'none'} />
                  {currentPost.rating_count || 0}
                </button>
                <button
                  onClick={() => setShowReport(true)}
                  className="flex items-center gap-1 font-pixel text-[7px] text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Flag size={14} /> Report
                </button>
                <span className="font-pixel text-[7px] text-muted-foreground ml-auto">
                  {currentIndex + 1} / {posts.length}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Navigation arrows */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="bg-card/80 rounded-full p-2 disabled:opacity-30 hover:bg-card transition-colors"
        >
          <ChevronUp size={20} className="text-card-foreground" />
        </button>
        <button
          onClick={goNext}
          disabled={currentIndex >= posts.length - 1}
          className="bg-card/80 rounded-full p-2 disabled:opacity-30 hover:bg-card transition-colors"
        >
          <ChevronDown size={20} className="text-card-foreground" />
        </button>
      </div>

      {/* Meowth button */}
      <button
        onClick={() => setShowMeowth(!showMeowth)}
        className="fixed bottom-4 right-4 z-20 w-14 h-14 rounded-full bg-accent shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
        aria-label="Meowth assistant"
      >
        😺
      </button>

      {showMeowth && (
        <MeowthChat
          onClose={() => setShowMeowth(false)}
          currentPost={currentPost}
        />
      )}

      {showReport && currentPost && (
        <ReportDialog
          postId={currentPost.id}
          onClose={() => setShowReport(false)}
          onReported={() => {
            setShowReport(false);
            fetchPosts();
          }}
        />
      )}
    </div>
  );
};

export default Feed;
