import React, { createContext, useContext } from 'react';
import { useSchema } from '../hooks/useSchema';
import { useEntries } from '../hooks/useEntries';
import { useDashboards } from '../hooks/useDashboards';

const SchemaContext = createContext();

export function SchemaProvider({ dashboardId, children }) {
  const { fields, loading: schemaLoading, refreshSchema } = useSchema(dashboardId);
  const { entries, loading: entriesLoading, refreshEntries } = useEntries(dashboardId);
  const { dashboards, loading: dashboardsLoading, refreshDashboards } = useDashboards();
  
  const dashboard = dashboards.find(d => d.id === dashboardId);

  const refreshData = async () => {
    await Promise.all([refreshSchema(), refreshEntries(), refreshDashboards()]);
  };

  return (
    <SchemaContext.Provider value={{ 
      fields, 
      entries, 
      dashboard,
      loading: schemaLoading || entriesLoading || dashboardsLoading,
      refreshData,
      dashboardId
    }}>
      {children}
    </SchemaContext.Provider>
  );
}

export function useSchemaContext() {
  return useContext(SchemaContext);
}
