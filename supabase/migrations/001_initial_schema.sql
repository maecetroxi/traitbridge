-- Erstelle Tabellen für TraitBridge WebApp

-- Tabelle für Persönlichkeitstest-Resultate
CREATE TABLE IF NOT EXISTS personality_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL, -- {O: number, C: number, E: number, A: number, N: number}
  calculated_scores JSONB, -- Vollständige Scores für @bigfive-org/results
  variant TEXT CHECK (variant IN ('quick', 'full')),
  language TEXT DEFAULT 'de',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Abfragen nach Benutzer
CREATE INDEX IF NOT EXISTS idx_personality_results_user_id ON personality_results(user_id);
CREATE INDEX IF NOT EXISTS idx_personality_results_created_at ON personality_results(created_at DESC);

-- Tabelle für Fragen in der Community
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);

-- Tabelle für Antworten
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON answers(created_at DESC);

-- Row Level Security (RLS) aktivieren)
ALTER TABLE personality_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies für personality_results
-- Benutzer können ihre eigenen Resultate sehen und erstellen
CREATE POLICY "Users can view their own personality results"
  ON personality_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personality results"
  ON personality_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personality results"
  ON personality_results FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies für questions
-- Alle authentifizierten Benutzer können Fragen sehen
CREATE POLICY "Authenticated users can view all questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

-- Benutzer können ihre eigenen Fragen erstellen
CREATE POLICY "Users can insert their own questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Benutzer können ihre eigenen Fragen aktualisieren
CREATE POLICY "Users can update their own questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Benutzer können ihre eigenen Fragen löschen
CREATE POLICY "Users can delete their own questions"
  ON questions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies für answers
-- Alle authentifizierten Benutzer können Antworten sehen
CREATE POLICY "Authenticated users can view all answers"
  ON answers FOR SELECT
  TO authenticated
  USING (true);

-- Benutzer können ihre eigenen Antworten erstellen
CREATE POLICY "Users can insert their own answers"
  ON answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Benutzer können ihre eigenen Antworten aktualisieren
CREATE POLICY "Users can update their own answers"
  ON answers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Benutzer können ihre eigenen Antworten löschen
CREATE POLICY "Users can delete their own answers"
  ON answers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Funktion für updated_at automatisch zu aktualisieren
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für updated_at
CREATE TRIGGER update_personality_results_updated_at
  BEFORE UPDATE ON personality_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at
  BEFORE UPDATE ON answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

