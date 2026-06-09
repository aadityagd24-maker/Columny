import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      return data;
    }
    
    // If update fails because it doesn't exist, we should insert it
    if (error) {
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert([{ ...updates, user_id: user.id }])
        .select()
        .single();
        
      if (!insertError && insertData) {
        setProfile(insertData);
        return insertData;
      }
      throw insertError;
    }
    
    return null;
  };

  return { profile, loading, updateProfile };
}
