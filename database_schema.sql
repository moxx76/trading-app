-- Trading WebApp Database Schema
-- Questo file contiene lo schema completo del database per Supabase

-- Estensione per UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabella utenti (estende auth.users di Supabase)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella domande trading
CREATE TABLE public.trading_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella voti
CREATE TABLE public.votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.trading_questions(id) ON DELETE CASCADE NOT NULL,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('BUY', 'SELL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint per evitare voti multipli dello stesso utente per la stessa domanda
    UNIQUE(user_id, question_id)
);

-- Indici per migliorare le performance
CREATE INDEX idx_trading_questions_active ON public.trading_questions(is_active);
CREATE INDEX idx_trading_questions_created_by ON public.trading_questions(created_by);
CREATE INDEX idx_votes_question_id ON public.votes(question_id);
CREATE INDEX idx_votes_user_id ON public.votes(user_id);
CREATE INDEX idx_votes_created_at ON public.votes(created_at);

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_questions_updated_at 
    BEFORE UPDATE ON public.trading_questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at 
    BEFORE UPDATE ON public.votes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Abilita RLS per tutte le tabelle
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Policies per la tabella users
-- Gli utenti possono vedere e aggiornare solo il proprio profilo
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Gli admin possono vedere tutti gli utenti
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policies per la tabella trading_questions
-- Tutti gli utenti autenticati possono vedere le domande attive
CREATE POLICY "Authenticated users can view active questions" ON public.trading_questions
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Solo gli admin possono creare domande
CREATE POLICY "Admins can create questions" ON public.trading_questions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Solo gli admin possono aggiornare domande
CREATE POLICY "Admins can update questions" ON public.trading_questions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Solo gli admin possono eliminare domande
CREATE POLICY "Admins can delete questions" ON public.trading_questions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policies per la tabella votes
-- Gli utenti possono vedere tutti i voti (per le statistiche)
CREATE POLICY "Authenticated users can view votes" ON public.votes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Gli utenti possono inserire voti solo per se stessi
CREATE POLICY "Users can insert own votes" ON public.votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gli utenti possono aggiornare solo i propri voti
CREATE POLICY "Users can update own votes" ON public.votes
    FOR UPDATE USING (auth.uid() = user_id);

-- Gli utenti possono eliminare solo i propri voti
CREATE POLICY "Users can delete own votes" ON public.votes
    FOR DELETE USING (auth.uid() = user_id);

-- Funzione per creare automaticamente il profilo utente dopo la registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per creare automaticamente il profilo utente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Dati di esempio per testing (opzionale)
-- Inserire un utente admin di default (sostituire con dati reali)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     uuid_generate_v4(),
--     'admin@tradingapp.com',
--     crypt('admin123', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
-- );

-- Funzioni di utilità per statistiche
CREATE OR REPLACE FUNCTION get_question_vote_stats(question_uuid UUID)
RETURNS TABLE(vote_type TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT v.vote_type, COUNT(*)
    FROM public.votes v
    WHERE v.question_id = question_uuid
    GROUP BY v.vote_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere le domande più popolari
CREATE OR REPLACE FUNCTION get_popular_questions(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    question_id UUID,
    title TEXT,
    description TEXT,
    total_votes BIGINT,
    buy_votes BIGINT,
    sell_votes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tq.id,
        tq.title,
        tq.description,
        COUNT(v.id) as total_votes,
        COUNT(CASE WHEN v.vote_type = 'BUY' THEN 1 END) as buy_votes,
        COUNT(CASE WHEN v.vote_type = 'SELL' THEN 1 END) as sell_votes
    FROM public.trading_questions tq
    LEFT JOIN public.votes v ON tq.id = v.question_id
    WHERE tq.is_active = true
    GROUP BY tq.id, tq.title, tq.description
    ORDER BY total_votes DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

