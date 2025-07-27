import * as Papa from 'papaparse';
import * as React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

export const getErrorMessage = (err: unknown) => {
  const unknownError = 'Something went wrong, please try again later.';

  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => {
      return issue.message;
    });
    return errors.join('\n');
  } else if (err instanceof Error) {
    return err.message;
  }
  return unknownError;
};
type CsvState = {
  fileName: string;
  data: {
    parsed: Record<string, unknown>[];
    mapped: Record<string, unknown>[];
  };
  fieldMappings: {
    original: Record<string, string | undefined>;
    current: Record<string, string | undefined>;
  };
  error: string | null;
};

type UseParseCsvProps = {
  /**
   * Array of field mappings defining the structure of the imported data.
   * Each field includes a label, value, and optional required flag.
   * @example fields={[{ label: 'Name', value: 'name', required: true }, { label: 'Email', value: 'email' }]}
   */
  fields: { label: string; value: string; required?: boolean }[];

  /**
   * Callback function invoked when data is successfully parsed.
   * Receives an array of records representing the imported data.
   * @example onSuccess={(data) => console.log(data)}
   */
  onSuccess?: (data: Record<string, unknown>[]) => void;

  /**
   * Callback function invoked when an error occurs during parsing.
   * Receives an error message.
   * @example onError={(message) => console.error(message)}
   */
  onError?: (message: string) => void;

  /**
   * Flag to indicate if empty fields should be shown.
   * @default false
   * @example showEmptyFields={true}
   */
  showEmptyFields?: boolean;
} & Papa.ParseConfig;

export const useParseCsv = ({
  // fields,
  onSuccess,
  onError,
  showEmptyFields,
  ...props
}: UseParseCsvProps) => {
  const [csvState, setCsvState] = React.useState<CsvState>({
    data: {
      mapped: [],
      parsed: [],
    },
    error: null,
    fieldMappings: {
      current: {},
      original: {},
    },
    fileName: '',
  });

  const onParse = async ({
    file,
    limit = Infinity,
  }: {
    file: File;
    limit?: number;
  }) => {
    const buffer = await file.arrayBuffer();

    let csvText = '';
    try {
      // Try decoding as UTF-8 first
      csvText = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    } catch {
      try {
        // Fallback to Shift-JIS
        csvText = new TextDecoder('shift-jis').decode(buffer);
      } catch (e) {
        const message
          = 'ファイルの文字エンコーディングを読み取れません (UTF-8 または Shift-JIS である必要があります)';
        toast.error(message);
        onError?.(message);
        return;
      }
    }

    let count = 0;
    const allResults: Record<string, unknown>[] = [];

    Papa.parse<Record<string, unknown>>(csvText, {
      ...props,
      beforeFirstChunk: (chunk) => {
        const parsedChunk = Papa.parse<string[]>(chunk, {
          header: false,
          skipEmptyLines: true,
        });

        const rows = parsedChunk.data;
        const columns = rows[0] ?? [];

        const newColumns = columns
          .map((column, index) => {
            if (column.trim() === '' && !showEmptyFields) {
              const hasNonEmptyValue = rows
                .slice(1)
                .some(
                  row =>
                    row[index] !== ''
                    && row[index] !== null
                    && row[index] !== undefined,
                );
              if (!hasNonEmptyValue) {
                return null;
              }
            }
            return column.trim() === '' ? `Field ${index + 1}` : column;
          })
          .filter(column => column !== null);

        rows[0] = newColumns;
        return Papa.unparse(rows);
      },
      complete: () => {
        setCsvState(prevState => ({
          ...prevState,
          data: {
            mapped: allResults,
            parsed: allResults,
          },
          fileName: file.name.replace(/\.[^/.]+$/, '') || 'Untitled',
        }));
        onSuccess?.(allResults);
      },
      dynamicTyping: true,
      header: true,
      skipEmptyLines: true,
      step: (results, parser) => {
        try {
          if (count === 0) {
            const mappings = (results.meta.fields ?? []).reduce(
              (acc, field) => ({
                ...acc,
                [field]: field,
              }),
              {},
            );

            setCsvState(prevState => ({
              ...prevState,
              fieldMappings: {
                current: mappings,
                original: mappings,
              },
            }));
          }

          if (count < limit) {
            allResults.push(results.data);
            count++;
          } else {
            parser.abort();
          }
        } catch (err) {
          const message = getErrorMessage(err);
          setCsvState(prevState => ({ ...prevState, error: message }));
          onError?.(message);
        }
      },
    });
  };

  const onFieldChange = ({
    oldValue,
    newValue,
  }: {
    oldValue: string;
    newValue: string;
  }) => {
    setCsvState(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        mapped: prevState.data.mapped.map((row, index) => ({
          ...row,
          [newValue]: prevState.data.parsed[index]?.[oldValue],
        })),
      },
      fieldMappings: {
        ...prevState.fieldMappings,
        current: { ...prevState.fieldMappings.current, [newValue]: oldValue },
      },
    }));
  };

  const onFieldToggle = ({
    value,
    checked,
  }: {
    value: string;
    checked: boolean;
  }) => {
    setCsvState(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        mapped: prevState.data.mapped.map((row) => {
          const { [value]: _, ...rest } = row;
          return rest;
        }),
      },
      fieldMappings: {
        ...prevState.fieldMappings,
        current: {
          ...prevState.fieldMappings.current,
          [value]: checked ? '' : undefined,
        },
      },
    }));
  };

  const onFieldsReset = () => {
    setCsvState(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        mapped: prevState.data.parsed,
      },
      fieldMappings: {
        ...prevState.fieldMappings,
        current: prevState.fieldMappings.original,
      },
    }));
  };

  const getSanitizedData = ({ data }: { data: Record<string, unknown>[] }) => {
    return data.map(row =>
      Object.keys(row).reduce(
        (acc, key) => ({
          ...acc,
          [key]: row[key] === null ? '' : row[key],
        }),
        {},
      ),
    );
  };

  return {
    data: csvState.data.mapped,
    error: csvState.error,
    fieldMappings: csvState.fieldMappings,
    fileName: csvState.fileName,
    getSanitizedData,
    onFieldChange,
    onFieldToggle,
    onFieldsReset,
    onParse,
  };
};
