
-- Add unique constraint on profiles.user_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Add foreign key from posts.user_id to profiles.user_id
ALTER TABLE public.posts
ADD CONSTRAINT posts_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);
