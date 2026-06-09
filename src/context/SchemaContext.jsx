import React, { createContext, useContext } from 'react';
import { useSchema } from '../hooks/useSchema';
import { useEntries } from '../hooks/useEntries';

const SchemaContext = createContext();

export function SchemaProvider({ dashboardId, children }) {
  const { fields, loading: schemaLoading, refreshSchema } = useSchema(dashboardId);
  const { entries, loading: entriesLoading, refreshEntries } = useEntries(dashboardId);

  const refreshData = async () => {
    await Promise.all([refreshSchema(), refreshEntries()]);
  };

  return (
    <SchemaContext.Provider value={{ 
      fields, 
      entries, 
      loading: schemaLoading || entriesLoading,
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
