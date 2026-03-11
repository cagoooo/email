import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  role: 'student' | 'teacher' | 'parent';
  display_name?: string;
  student_id?: string;
  class_id?: string;
  parent_email?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
}

export interface ClassInfo {
  id: string;
  class_name: string;
  grade_level: number;
  school_year: string;
  teacher_id?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 獲取初始會話
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.user_metadata);
      } else {
        setLoading(false);
      }
    });

    // 監聽認證狀態變化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event, "Session present:", !!session);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        console.log("發現使用者，開始獲取 Profile:", session.user.id);
        await fetchUserProfile(session.user.id, session.user.user_metadata);
      } else {
        console.log("無 Session，重設狀態");
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 防止重複請求的鎖
  const fetchLock = useRef<string | null>(null);

  const fetchUserProfile = async (userId: string, userMetadata?: any) => {
    // 如果已有「同一個」UID 的請求正在進行，直接返回
    if (fetchLock.current === userId) {
      console.log("已有相同 UID 的請求正在進行中，跳過:", userId);
      return;
    }

    try {
      fetchLock.current = userId;
      setLoading(true);
      console.log("正在獲取 Profile，UID:", userId);

      const { data, error } = await supabase
        .from('user_profiles_20260310')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('獲取 Profile 時發生錯誤:', error);
        toast.error("讀取個人資料失敗：" + error.message);
      } else if (data) {
        console.log("Profile 獲取成功:", data);
        setProfile(data);
      } else if (userMetadata) {
        console.log("Profile 不存在，嘗試建立/更新...");
        const newProfile: Partial<UserProfile> = {
          id: userId,
          role: 'student',
          display_name: userMetadata.full_name || userMetadata.name || '使用者',
          avatar_url: userMetadata.avatar_url || userMetadata.picture,
          is_active: true,
        };

        const { data: upsertedData, error: upsertError } = await supabase
          .from('user_profiles_20260310')
          .upsert(newProfile, { onConflict: 'id' })
          .select()
          .maybeSingle();

        if (upsertError) {
          console.error("建立 Profile 失敗:", upsertError);
        } else {
          console.log("Profile 建立/同步成功:", upsertedData);
          setProfile(upsertedData);
        }
      } else {
        console.warn("查無 Profile 且無 Metadata 可供建立");
        setProfile(null);
      }
    } catch (error: any) {
      console.error('處理 User Profile 流程崩潰:', error);
      toast.error("系統處理個人資料時發生錯誤");
    } finally {
      console.log("Profile 處理流程結束，關閉 Loading");
      setLoading(false);
      fetchLock.current = null;
    }
  };

  const signUp = async (email: string, password: string, userData: {
    role: 'student' | 'teacher' | 'parent';
    display_name: string;
    student_id?: string;
    class_id?: string;
    parent_email?: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // 創建用戶資料
        const { error: profileError } = await supabase
          .from('user_profiles_20260310')
          .insert({
            id: data.user.id,
            ...userData,
          });

        if (profileError) throw profileError;
      }

      return { data, error: null as Error | null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { data, error: null as Error | null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const signOut = async () => {
    // 先同步清除前端狀態，避免 profile→studentInfo effect 在 signOut 完成前觸發重設循環
    setUser(null);
    setSession(null);
    setProfile(null);
    fetchLock.current = null;
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('user_profiles_20260310')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { data, error: null as Error | null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // 使用完整路徑（含子目錄），確保 GitHub Pages /email/ 部署路徑正確
      const redirectTo = window.location.origin + window.location.pathname.replace(/\/$/, '') + '/';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
      return { data, error: null as Error | null };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { data: null, error: error as Error };
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    fetchUserProfile, // 確保這被匯出
  };
}

export function useClasses() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes_20260310')
        .select('*')
        .order('grade_level', { ascending: true });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (classData: {
    class_name: string;
    grade_level: number;
    school_year?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('classes_20260310')
        .insert({
          ...classData,
          teacher_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchClasses(); // 重新獲取班級列表
      return { data, error: null as Error | null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return {
    classes,
    loading,
    fetchClasses,
    createClass,
  };
}