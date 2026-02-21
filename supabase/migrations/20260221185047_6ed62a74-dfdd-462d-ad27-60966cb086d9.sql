
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  visit_count INTEGER NOT NULL DEFAULT 0,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  ban_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  pokemon_name TEXT NOT NULL,
  pokemon_type TEXT NOT NULL,
  pokemon_size TEXT,
  sighting_location TEXT NOT NULL,
  habitat TEXT,
  total_reports INTEGER NOT NULL DEFAULT 0,
  misinformation_reports INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-banned posts" ON public.posts FOR SELECT USING (is_banned = false OR user_id = auth.uid());
CREATE POLICY "Auth users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Track user visits (each session/login increments)
CREATE TABLE public.user_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own visits" ON public.user_visits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own visits" ON public.user_visits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Misinformation cache: stores consistent fake data per user per post
CREATE TABLE public.misinformation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  fake_pokemon_type TEXT,
  fake_sighting_location TEXT,
  fake_habitat TEXT,
  fake_pokemon_size TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.misinformation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own misinfo cache" ON public.misinformation_cache FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own misinfo cache" ON public.misinformation_cache FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Post views: track which posts each user has seen and when
CREATE TABLE public.post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  first_viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  view_count INTEGER NOT NULL DEFAULT 1,
  user_visit_count_at_first_view INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own post_views" ON public.post_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own post_views" ON public.post_views FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own post_views" ON public.post_views FOR UPDATE USING (auth.uid() = user_id);

-- Ratings
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Auth users can rate" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rating" ON public.ratings FOR UPDATE USING (auth.uid() = user_id);

-- Reports
CREATE TYPE public.report_reason AS ENUM ('profanity', 'misinformation', 'spam', 'harassment', 'other');

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  reason public.report_reason NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reporter_id, post_id)
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can report" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- Help requests (for the hellish help page)
CREATE TABLE public.help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  captcha_level INTEGER NOT NULL DEFAULT 0,
  minigame_completed BOOLEAN NOT NULL DEFAULT false,
  actually_submitted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own help requests" ON public.help_requests FOR ALL USING (auth.uid() = user_id);

-- Function to increment visit count on profile
CREATE OR REPLACE FUNCTION public.increment_visit_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET visit_count = visit_count + 1, updated_at = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_visit_increment
AFTER INSERT ON public.user_visits
FOR EACH ROW
EXECUTE FUNCTION public.increment_visit_count();

-- Function to update post stats on new rating
CREATE OR REPLACE FUNCTION public.update_post_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts
  SET 
    average_rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM public.ratings WHERE post_id = NEW.post_id),
    rating_count = (SELECT COUNT(*) FROM public.ratings WHERE post_id = NEW.post_id)
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_rating_update
AFTER INSERT OR UPDATE ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_post_rating();

-- Function to update post report counts
CREATE OR REPLACE FUNCTION public.update_post_reports()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts
  SET 
    total_reports = (SELECT COUNT(*) FROM public.reports WHERE post_id = NEW.post_id),
    misinformation_reports = (SELECT COUNT(*) FROM public.reports WHERE post_id = NEW.post_id AND reason = 'misinformation')
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_report_update
AFTER INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_post_reports();

-- Auto-ban posters with high average rating (>4.0 with 5+ ratings)
CREATE OR REPLACE FUNCTION public.check_auto_ban()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  absurd_reasons TEXT[] := ARRAY[
    'Your posts were too truthful for this platform',
    'Excessive helpfulness detected - banned for being suspiciously nice',
    'Your Pokemon knowledge threatens our operations',
    'You have been identified as NOT a Team Rocket member',
    'Your accuracy rating exceeded our misinformation threshold'
  ];
BEGIN
  IF NEW.average_rating > 4.0 AND NEW.rating_count >= 5 THEN
    -- Ban the poster
    UPDATE public.profiles
    SET is_banned = true, 
        ban_reason = absurd_reasons[1 + floor(random() * array_length(absurd_reasons, 1))::int]
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_stats_change
AFTER UPDATE OF average_rating, rating_count ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.check_auto_ban();

-- Storage bucket for post images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

CREATE POLICY "Anyone can view post images" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "Auth users can upload post images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own post images" ON storage.objects FOR UPDATE USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own post images" ON storage.objects FOR DELETE USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
