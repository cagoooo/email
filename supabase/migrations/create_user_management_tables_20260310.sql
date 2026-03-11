-- 用戶管理系統表結構
-- 創建時間: 2026-03-10

-- 1. 用戶角色枚舉
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'parent');

-- 2. 學校班級表
CREATE TABLE public.classes_20260310 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    grade_level INTEGER NOT NULL CHECK (grade_level >= 1 AND grade_level <= 6),
    school_year VARCHAR(10) NOT NULL DEFAULT '2026',
    teacher_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 用戶資料表（擴展 auth.users）
CREATE TABLE public.user_profiles_20260310 (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role user_role NOT NULL,
    display_name VARCHAR(100),
    student_id VARCHAR(20), -- 學號（僅學生使用）
    class_id UUID REFERENCES public.classes_20260310(id),
    parent_email VARCHAR(255), -- 家長 Email（僅學生使用）
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 家長-學生關聯表
CREATE TABLE public.parent_student_relations_20260310 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES auth.users(id),
    student_id UUID REFERENCES auth.users(id),
    relationship VARCHAR(20) DEFAULT 'parent', -- parent, guardian, etc.
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 學習進度表（雲端同步）
CREATE TABLE public.learning_progress_20260310 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    student_id VARCHAR(20) NOT NULL,
    email_learning_progress INTEGER DEFAULT 0,
    student_id_game_progress INTEGER DEFAULT 0,
    password_security_progress INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    completed_levels TEXT[] DEFAULT '{}',
    achievements TEXT[] DEFAULT '{}',
    daily_challenges_completed INTEGER DEFAULT 0,
    learning_streak INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0, -- 分鐘
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 每日挑戰記錄表
CREATE TABLE public.daily_challenges_20260310 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    challenge_date DATE NOT NULL,
    challenge_type VARCHAR(20) NOT NULL, -- email, studentId, password, mixed
    challenge_title VARCHAR(200) NOT NULL,
    challenge_description TEXT,
    difficulty VARCHAR(10) NOT NULL, -- easy, medium, hard
    reward_points INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 班級排行榜視圖
CREATE VIEW public.class_leaderboard_20260310 AS
SELECT 
    up.class_id,
    up.id as user_id,
    up.display_name,
    up.student_id,
    lp.total_score,
    lp.learning_streak,
    lp.total_study_time,
    lp.daily_challenges_completed,
    lp.last_active,
    RANK() OVER (PARTITION BY up.class_id ORDER BY lp.total_score DESC) as score_rank,
    RANK() OVER (PARTITION BY up.class_id ORDER BY lp.learning_streak DESC) as streak_rank,
    RANK() OVER (PARTITION BY up.class_id ORDER BY lp.total_study_time DESC) as time_rank
FROM public.user_profiles_20260310 up
JOIN public.learning_progress_20260310 lp ON up.id = lp.user_id
WHERE up.role = 'student' AND up.is_active = true;

-- 8. 創建索引優化查詢性能
CREATE INDEX idx_user_profiles_role ON public.user_profiles_20260310(role);
CREATE INDEX idx_user_profiles_class ON public.user_profiles_20260310(class_id);
CREATE INDEX idx_learning_progress_user ON public.learning_progress_20260310(user_id);
CREATE INDEX idx_learning_progress_score ON public.learning_progress_20260310(total_score DESC);
CREATE INDEX idx_daily_challenges_user_date ON public.daily_challenges_20260310(user_id, challenge_date);

-- 9. 創建更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes_20260310 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles_20260310 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_progress_updated_at BEFORE UPDATE ON public.learning_progress_20260310 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();