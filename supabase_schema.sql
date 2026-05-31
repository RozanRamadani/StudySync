-- Supabase Schema for StudySync

-- Create Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create Study Sessions Table
CREATE TABLE study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  focus INTEGER NOT NULL CHECK (focus >= 0 AND focus <= 100),
  fatigue INTEGER NOT NULL CHECK (fatigue >= 0 AND fatigue <= 100),
  complexity INTEGER NOT NULL CHECK (complexity >= 0 AND complexity <= 100),
  duration INTEGER NOT NULL,
  category TEXT NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own study sessions." ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions." ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions." ON study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions." ON study_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create Saved Study Methods Table
CREATE TABLE saved_study_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  method_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE saved_study_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved methods." ON saved_study_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved methods." ON saved_study_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved methods." ON saved_study_methods
  FOR DELETE USING (auth.uid() = user_id);

-- Set up Realtime
-- ALTER PUBLICATION supabase_realtime ADD TABLE study_sessions;
