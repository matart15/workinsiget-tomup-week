import { useSearchParams } from 'react-router-dom';

const removeEmptyValues = (
  object: Record<string, string | number | null | undefined>,
) =>
  Object.fromEntries(
    Object.entries(object).filter(
      ([_, value]) =>
        !(
          !value
          || value === ''
          || (Array.isArray(value) && value.length === 0)
        ),
    ),
  );

export const useAllSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const allSearchParams: Record<string, string> = {};

  const entries = searchParams.entries();
  // Display the key/value pairs
  for (const [key, value] of entries) {
    allSearchParams[key] = value;
  }
  const changeSearchParam = (
    object: Record<string, string | null | number>,
    options?: {
      overwrite: boolean;
    },
  ) => {
    // remove empty values and empty arrays
    const newObject = removeEmptyValues(object);
    const mergeObject = options?.overwrite
      ? newObject
      : { ...allSearchParams, ...newObject };

    const newURLSearchParams = new URLSearchParams();
    const entries2 = Object.entries(mergeObject);
    entries2.forEach(([key, value]) => {
      newURLSearchParams.set(key, String(value));
    });
    setSearchParams(newURLSearchParams);
  };

  return {
    changeSearchParam,
    params: allSearchParams,
    setSearchParams,
  };
};
