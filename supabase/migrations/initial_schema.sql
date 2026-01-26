-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- VOCABULARY ITEMS
CREATE TABLE IF NOT EXISTS vocabulary_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  english_word TEXT NOT NULL,
  french_translation TEXT NOT NULL,
  example_sentence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_vocab_user ON vocabulary_items(user_id);
CREATE INDEX IF NOT EXISTS idx_vocab_user_date ON vocabulary_items(user_id, created_at);

ALTER TABLE vocabulary_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vocabulary" ON vocabulary_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary" ON vocabulary_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own vocabulary" ON vocabulary_items
  FOR DELETE USING (auth.uid() = user_id);

-- LEARNING PROGRESS
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  item_id UUID NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
  easiness_factor FLOAT DEFAULT 2.5,
  interval_days INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review', 'mastered')),
  total_reviews INTEGER DEFAULT 0,
  correct_reviews INTEGER DEFAULT 0,
  last_review_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_due ON learning_progress(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_progress_status ON learning_progress(user_id, status);

ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress" ON learning_progress
  FOR ALL USING (auth.uid() = user_id);

-- REVIEW SESSIONS
CREATE TABLE IF NOT EXISTS review_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  item_id UUID NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
  was_correct BOOLEAN NOT NULL,
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 0 AND 5),
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON review_sessions(user_id, created_at);

ALTER TABLE review_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert sessions" ON review_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view sessions" ON review_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- FUNCTION get_due_reviews
CREATE OR REPLACE FUNCTION get_due_reviews()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  english_word TEXT,
  french_translation TEXT,
  example_sentence TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  item_id UUID,
  easiness_factor FLOAT,
  interval_days INTEGER,
  repetitions INTEGER,
  next_review_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  total_reviews INTEGER,
  correct_reviews INTEGER,
  last_review_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    v.id, v.user_id, v.english_word, v.french_translation, v.example_sentence, v.created_at,
    p.item_id, p.easiness_factor, p.interval_days, p.repetitions, p.next_review_date, p.status, p.total_reviews, p.correct_reviews, p.last_review_date, p.updated_at
  FROM vocabulary_items v
  JOIN learning_progress p ON v.id = p.item_id
  WHERE p.user_id = auth.uid()
  AND p.next_review_date <= now()
  ORDER BY p.next_review_date ASC
  LIMIT 20;
$$;
