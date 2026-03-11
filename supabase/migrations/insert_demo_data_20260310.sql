-- 插入示範數據
-- 創建時間: 2026-03-10

-- 1. 插入示範班級
INSERT INTO public.classes_20260310 (id, class_name, grade_level, school_year) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '一年甲班', 1, '2026'),
    ('550e8400-e29b-41d4-a716-446655440002', '二年甲班', 2, '2026'),
    ('550e8400-e29b-41d4-a716-446655440003', '三年甲班', 3, '2026'),
    ('550e8400-e29b-41d4-a716-446655440004', '四年甲班', 4, '2026'),
    ('550e8400-e29b-41d4-a716-446655440005', '五年甲班', 5, '2026'),
    ('550e8400-e29b-41d4-a716-446655440006', '六年甲班', 6, '2026');

-- 2. 插入示範學習進度數據（模擬不同程度的學生）
INSERT INTO public.learning_progress_20260310 (
    id, user_id, student_id, email_learning_progress, student_id_game_progress, 
    password_security_progress, total_score, completed_levels, achievements,
    daily_challenges_completed, learning_streak, total_study_time
) VALUES
    -- 優秀學生
    ('660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '1130001', 95, 90, 85, 850, 
     ARRAY['email-basic', 'email-advanced', 'studentid-memory', 'password-basic'], 
     ARRAY['first-login', 'email-master', 'memory-champion', 'security-expert'], 
     15, 7, 180),
    
    -- 中等學生
    ('660e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '1130002', 70, 65, 60, 520, 
     ARRAY['email-basic', 'studentid-basic'], 
     ARRAY['first-login', 'email-learner'], 
     8, 3, 120),
    
    -- 初學者
    ('660e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '1130003', 30, 25, 20, 180, 
     ARRAY['email-basic'], 
     ARRAY['first-login'], 
     3, 1, 45),
    
    -- 進步快的學生
    ('660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', '1130004', 80, 75, 70, 680, 
     ARRAY['email-basic', 'email-intermediate', 'studentid-memory'], 
     ARRAY['first-login', 'email-master', 'quick-learner'], 
     12, 5, 150),
    
    -- 需要鼓勵的學生
    ('660e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440005', '1130005', 45, 40, 35, 280, 
     ARRAY['email-basic'], 
     ARRAY['first-login', 'persistent-learner'], 
     5, 2, 75);

-- 3. 插入示範每日挑戰記錄
INSERT INTO public.daily_challenges_20260310 (
    user_id, challenge_date, challenge_type, challenge_title, challenge_description,
    difficulty, reward_points, completed, completed_at
) VALUES
    -- 今日挑戰
    ('660e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'email', 
     '完美 Email 地址', '正確輸入完整的學校 Email 地址 3 次', 'medium', 50, true, NOW()),
    
    ('660e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 'studentId', 
     '學號記憶挑戰', '在 30 秒內正確輸入學號 5 次', 'easy', 30, true, NOW()),
    
    ('660e8400-e29b-41d4-a716-446655440003', CURRENT_DATE, 'password', 
     '密碼安全檢測', '創建一個強度為「強」的密碼', 'hard', 80, false, NULL),
    
    -- 昨日挑戰
    ('660e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 'mixed', 
     '綜合技能測試', '完成所有三個模組的基礎測試', 'hard', 100, true, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '2 hours'),
    
    ('660e8400-e29b-41d4-a716-446655440004', CURRENT_DATE - INTERVAL '1 day', 'email', 
     'Email 格式專家', '識別正確和錯誤的 Email 格式', 'medium', 60, true, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '1 hour');

-- 4. 創建函數：生成每日挑戰
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