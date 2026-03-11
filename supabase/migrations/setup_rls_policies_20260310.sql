-- Row Level Security 策略設定
-- 創建時間: 2026-03-10

-- 1. 啟用 RLS
ALTER TABLE public.classes_20260310 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles_20260310 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_relations_20260310 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress_20260310 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges_20260310 ENABLE ROW LEVEL SECURITY;

-- 2. 班級表策略
-- 教師可以查看和管理自己的班級
CREATE POLICY "teachers_manage_own_classes" ON public.classes_20260310
    FOR ALL USING (teacher_id = auth.uid());

-- 學生可以查看自己所屬的班級
CREATE POLICY "students_view_own_class" ON public.classes_20260310
    FOR SELECT USING (
        id IN (
            SELECT class_id FROM public.user_profiles_20260310 
            WHERE id = auth.uid() AND role = 'student'
        )
    );

-- 3. 用戶資料表策略
-- 用戶可以查看和更新自己的資料
CREATE POLICY "users_manage_own_profile" ON public.user_profiles_20260310
    FOR ALL USING (id = auth.uid());

-- 教師可以查看自己班級的學生資料
CREATE POLICY "teachers_view_class_students" ON public.user_profiles_20260310
    FOR SELECT USING (
        role = 'student' AND class_id IN (
            SELECT id FROM public.classes_20260310 WHERE teacher_id = auth.uid()
        )
    );

-- 家長可以查看自己孩子的資料
CREATE POLICY "parents_view_children" ON public.user_profiles_20260310
    FOR SELECT USING (
        id IN (
            SELECT student_id FROM public.parent_student_relations_20260310 
            WHERE parent_id = auth.uid()
        )
    );

-- 4. 家長-學生關聯表策略
-- 家長可以查看自己的關聯記錄
CREATE POLICY "parents_view_own_relations" ON public.parent_student_relations_20260310
    FOR SELECT USING (parent_id = auth.uid());

-- 學生可以查看與自己相關的記錄
CREATE POLICY "students_view_parent_relations" ON public.parent_student_relations_20260310
    FOR SELECT USING (student_id = auth.uid());

-- 教師可以查看班級學生的家長關聯
CREATE POLICY "teachers_view_class_relations" ON public.parent_student_relations_20260310
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM public.user_profiles_20260310 
            WHERE role = 'student' AND class_id IN (
                SELECT id FROM public.classes_20260310 WHERE teacher_id = auth.uid()
            )
        )
    );

-- 5. 學習進度表策略
-- 學生可以管理自己的學習進度
CREATE POLICY "students_manage_own_progress" ON public.learning_progress_20260310
    FOR ALL USING (user_id = auth.uid());

-- 教師可以查看班級學生的學習進度
CREATE POLICY "teachers_view_class_progress" ON public.learning_progress_20260310
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.user_profiles_20260310 
            WHERE role = 'student' AND class_id IN (
                SELECT id FROM public.classes_20260310 WHERE teacher_id = auth.uid()
            )
        )
    );

-- 家長可以查看自己孩子的學習進度
CREATE POLICY "parents_view_children_progress" ON public.learning_progress_20260310
    FOR SELECT USING (
        user_id IN (
            SELECT student_id FROM public.parent_student_relations_20260310 
            WHERE parent_id = auth.uid()
        )
    );

-- 6. 每日挑戰記錄策略
-- 學生可以管理自己的挑戰記錄
CREATE POLICY "students_manage_own_challenges" ON public.daily_challenges_20260310
    FOR ALL USING (user_id = auth.uid());

-- 教師可以查看班級學生的挑戰記錄
CREATE POLICY "teachers_view_class_challenges" ON public.daily_challenges_20260310
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.user_profiles_20260310 
            WHERE role = 'student' AND class_id IN (
                SELECT id FROM public.classes_20260310 WHERE teacher_id = auth.uid()
            )
        )
    );

-- 家長可以查看自己孩子的挑戰記錄
CREATE POLICY "parents_view_children_challenges" ON public.daily_challenges_20260310
    FOR SELECT USING (
        user_id IN (
            SELECT student_id FROM public.parent_student_relations_20260310 
            WHERE parent_id = auth.uid()
        )
    );

-- 7. 創建函數：檢查用戶角色
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role FROM public.user_profiles_20260310 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 創建函數：獲取用戶班級ID
CREATE OR REPLACE FUNCTION public.get_user_class_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT class_id FROM public.user_profiles_20260310 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;