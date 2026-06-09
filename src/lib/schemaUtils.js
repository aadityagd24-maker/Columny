export function flattenEntry(entry) {
  // Check if this is a new Intent-routed payload
  const data = entry.extracted_data?.intent === 'LOG_DATA' 
    ? entry.extracted_data.entities 
    : entry.extracted_data;

  return {
    id: entry.id,
    raw_text: entry.raw_text,
    created_at: new Date(entry.created_at).toLocaleString(),
    ...data
  };
}

export function fieldsToColumns(fields) {
  // Always include a timestamp column first
  const cols = [
    {
      accessorKey: 'created_at',
      header: 'Date',
      size: 150
    }
  ];

  // Add all dynamic fields
  fields.forEach(field => {
    cols.push({
      accessorKey: field.field_name,
      header: field.display_name || field.field_name,
      // If it's text, we might want it to be sortable/filterable
      // TanStack Table v8 defaults handle most of this
    });
  });

  return cols;
}

