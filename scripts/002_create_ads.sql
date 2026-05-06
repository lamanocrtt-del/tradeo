CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  cta_text TEXT NOT NULL DEFAULT 'En savoir plus',
  cta_text_en TEXT DEFAULT 'Learn more',
  link TEXT NOT NULL DEFAULT '#',
  image_url TEXT,
  bg_gradient TEXT NOT NULL DEFAULT 'from-blue-500 to-indigo-600',
  is_internal BOOLEAN NOT NULL DEFAULT false,
  internal_route TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
