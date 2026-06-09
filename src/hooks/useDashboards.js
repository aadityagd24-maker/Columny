import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useDashboards() {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setDashboards(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboards();
  }, []);

  const createDashboard = async ({ name, description, context }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('dashboards')
      .insert([{ name, description, context, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setDashboards(prev => [data, ...prev]);
      return data;
    }
    throw error || new Error("Failed to create dashboard");
  };

  const deleteDashboard = async (id) => {
    const { error } = await supabase
      .from('dashboards')
      .delete()
      .eq('id', id);

    if (!error) {
      setDashboards(prev => prev.filter(d => d.id !== id));
    }
  };

  return { 
    dashboards, 
    loading, 
    createDashboard, 
    deleteDashboard, 
    refreshDashboards: fetchDashboards 
  };
}
