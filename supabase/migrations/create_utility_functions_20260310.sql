-- 插入基礎示範數據和函數
-- 創建時間: 2026-03-10

-- 1. 創建函數：生成每日挑戰
CREATE OR REPLACE FUNCTION public.generate_daily_challenge(p_user_id UUID)
RETURNS TABLE(
    challenge_type VARCHAR,
    challenge_title VARCHAR,
    challenge_description TEXT,
    difficulty VARCHAR,
    reward_points INTEGER
) AS $$
DECLARE
    user_progress RECORD;
    challenge_types VARCHAR[] := ARRAY['email', 'studentId', 'password', 'mixed'];
    selected_type VARCHAR;
    difficulty_level VARCHAR;
    points INTEGER;
BEGIN
    -- 獲取用戶進度
    SELECT * INTO user_progress 
    FROM public.learning_progress_20260310 
    WHERE user_id = p_user_id;
    
    -- 如果沒有進度記錄，設定預設值
    IF user_progress IS NULL THEN
        user_progress.total_score := 0;
    END IF;
    
    -- 隨機選擇挑戰類型
    selected_type := challenge_types[floor(random() * array_length(challenge_types, 1) + 1)];
    
    -- 根據進度決定難度
    IF (user_progress.total_score < 200) THEN
        difficulty_level := 'easy';
        points := 30;
    ELSIF (user_progress.total_score < 500) THEN
        difficulty_level := 'medium';
        points := 50;
    ELSE
        difficulty_level := 'hard';
        points := 80;
    END IF;
    
    -- 根據類型生成挑戰
    CASE selected_type
        WHEN 'email' THEN
            RETURN QUERY SELECT 
                selected_type,
                CASE difficulty_level
                    WHEN 'easy' THEN 'Email 基礎練習'
                    WHEN 'medium' THEN 'Email 格式挑戰'
                    ELSE 'Email 專家測試'
                END::VARCHAR,
                CASE difficulty_level
                    WHEN 'easy' THEN '正確輸入你的學校 Email 地址'
                    WHEN 'medium' THEN '在限時內完成 Email 地址拼寫'
                    ELSE '識別並修正錯誤的 Email 格式'
                END::TEXT,
                difficulty_level::VARCHAR,
                points;
                
        WHEN 'studentId' THEN
            RETURN QUERY SELECT 
                selected_type,
                CASE difficulty_level
                    WHEN 'easy' THEN '學號記憶練習'
                    WHEN 'medium' THEN '學號速記挑戰'
                    ELSE '學號記憶大師'
                END::VARCHAR,
                CASE difficulty_level
                    WHEN 'easy' THEN '正確輸入你的學號 3 次'
                    WHEN 'medium' THEN '30 秒內正確輸入學號 5 次'
                    ELSE '完成學號記憶遊戲的困難模式'
                END::TEXT,
                difficulty_level::VARCHAR,
                points;
                
        WHEN 'password' THEN
            RETURN QUERY SELECT 
                selected_type,
                CASE difficulty_level
                    WHEN 'easy' THEN '密碼安全入門'
                    WHEN 'medium' THEN '密碼強度挑戰'
                    ELSE '密碼安全專家'
                END::VARCHAR,
                CASE difficulty_level
                    WHEN 'easy' THEN '學習密碼安全的基本概念'
                    WHEN 'medium' THEN '創建一個中等強度的密碼'
                    ELSE '設計一個高強度的個人化密碼'
                END::TEXT,
                difficulty_level::VARCHAR,
                points;
                
        ELSE -- mixed
            RETURN QUERY SELECT 
                selected_type,
                '綜合技能挑戰'::VARCHAR,
                '完成 Email、學號和密碼的綜合測試'::TEXT,
                difficulty_level::VARCHAR,
                (points + 20);
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 2. 創建函數：同步本地進度到雲端
CREATE OR REPLACE FUNCTION public.sync_learning_progress(
    p_student_id VARCHAR,
    p_email_progress INTEGER DEFAULT 0,
    p_studentid_progress INTEGER DEFAULT 0,
    p_password_progress INTEGER DEFAULT 0,
    p_total_score INTEGER DEFAULT 0,
    p_completed_levels TEXT[] DEFAULT '{}',
    p_achievements TEXT[] DEFAULT '{}',
    p_study_time INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    progress_id UUID;
BEGIN
    -- 插入或更新學習進度
    INSERT INTO public.learning_progress_20260310 (
        user_id, student_id, email_learning_progress, student_id_game_progress,
        password_security_progress, total_score, completed_levels, achievements,
        total_study_time, last_active
    ) VALUES (
        auth.uid(), p_student_id, p_email_progress, p_studentid_progress,
        p_password_progress, p_total_score, p_completed_levels, p_achievements,
        p_study_time, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email_learning_progress = GREATEST(learning_progress_20260310.email_learning_progress, p_email_progress),
        student_id_game_progress = GREATEST(learning_progress_20260310.student_id_game_progress, p_studentid_progress),
        password_security_progress = GREATEST(learning_progress_20260310.password_security_progress, p_password_progress),
        total_score = GREATEST(learning_progress_20260310.total_score, p_total_score),
        completed_levels = array(SELECT DISTINCT unnest(learning_progress_20260310.completed_levels || p_completed_levels)),
        achievements = array(SELECT DISTINCT unnest(learning_progress_20260310.achievements || p_achievements)),
        total_study_time = learning_progress_20260310.total_study_time + p_study_time,
        last_active = NOW(),
        updated_at = NOW()
    RETURNING id INTO progress_id;
    
    RETURN progress_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 創建函數：獲取班級排行榜
CREATE OR REPLACE FUNCTION public.get_class_leaderboard(p_class_id UUID DEFAULT NULL)
RETURNS TABLE(
    user_id UUID,
    display_name VARCHAR,
    student_id VARCHAR,
    total_score INTEGER,
    learning_streak INTEGER,
    total_study_time INTEGER,
    score_rank BIGINT,
    streak_rank BIGINT,
    time_rank BIGINT,
    last_active TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- 如果沒有指定班級ID，使用當前用戶的班級
    IF p_class_id IS NULL THEN
        p_class_id := public.get_user_class_id();
    END IF;
    
    RETURN QUERY
    SELECT * FROM public.class_leaderboard_20260310
    WHERE class_id = p_class_id
    ORDER BY score_rank ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 創建函數：完成每日挑戰
CREATE OR REPLACE FUNCTION public.complete_daily_challenge(
    p_challenge_date DATE DEFAULT CURRENT_DATE,
    p_challenge_type VARCHAR DEFAULT 'mixed'
)
RETURNS BOOLEAN AS $$
DECLARE
    challenge_record RECORD;
    reward_points INTEGER;
BEGIN
    -- 查找今日挑戰
    SELECT * INTO challenge_record
    FROM public.daily_challenges_20260310
    WHERE user_id = auth.uid() 
    AND challenge_date = p_challenge_date
    AND challenge_type = p_challenge_type;
    
    -- 如果沒有挑戰記錄，先生成一個
    IF challenge_record IS NULL THEN
        SELECT * INTO challenge_record
        FROM public.generate_daily_challenge(auth.uid());
        
        INSERT INTO public.daily_challenges_20260310 (
            user_id, challenge_date, challenge_type, challenge_title,
            challenge_description, difficulty, reward_points
        ) VALUES (
            auth.uid(), p_challenge_date, challenge_record.challenge_type,
            challenge_record.challenge_title, challenge_record.challenge_description,
            challenge_record.difficulty, challenge_record.reward_points
        );
        
        reward_points := challenge_record.reward_points;
    ELSE
        reward_points := challenge_record.reward_points;
    END IF;
    
    -- 標記挑戰完成
    UPDATE public.daily_challenges_20260310
    SET completed = true, completed_at = NOW()
    WHERE user_id = auth.uid() 
    AND challenge_date = p_challenge_date
    AND challenge_type = p_challenge_type;
    
    -- 更新學習進度
    UPDATE public.learning_progress_20260310
    SET 
        daily_challenges_completed = daily_challenges_completed + 1,
        total_score = total_score + reward_points,
        learning_streak = CASE 
            WHEN DATE(last_active) = p_challenge_date - INTERVAL '1 day' THEN learning_streak + 1
            WHEN DATE(last_active) = p_challenge_date THEN learning_streak
            ELSE 1
        END,
        last_active = NOW()
    WHERE user_id = auth.uid();
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;