import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useEntries(dashboardId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    if (!dashboardId) return;
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!dashboardId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchEntries();

    // Subscribe to realtime inserts, updates, and deletes
    const channel = supabase.channel(`entries_changes_${dashboardId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'entries',
        filter: `dashboard_id=eq.${dashboardId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setEntries(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setEntries(prev => prev.filter(e => e.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setEntries(prev => prev.map(e => e.id === payload.new.id ? payload.new : e));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dashboardId]);

  return { entries, loading, refreshEntries: fetchEntries };
}
