// src/common/utils/omit.ts
export function omitFields<T extends object, K extends keyof T>(
  obj: T,
  fields: K[],
): Omit<T, K> {
  const result = { ...obj };
  for (const field of fields) {
    delete result[field];
  }
  return result;
}
