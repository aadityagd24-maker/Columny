import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSchema(dashboardId) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchema = async () => {
    if (!dashboardId) return;
    const { data, error } = await supabase
      .from('schema_registry')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .order('created_at', { ascending: true });
      
    if (!error && data) {
      setFields(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!dashboardId) {
      setFields([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchSchema();

    // Subscribe to realtime inserts, updates, and deletes
    const channel = supabase.channel(`schema_changes_${dashboardId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'schema_registry',
        filter: `dashboard_id=eq.${dashboardId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setFields(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'DELETE') {
          setFields(prev => prev.filter(f => f.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setFields(prev => prev.map(f => f.id === payload.new.id ? payload.new : f));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dashboardId]);

  return { fields, loading, refreshSchema: fetchSchema };
}
