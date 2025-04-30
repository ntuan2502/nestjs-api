type IncludeObject = {
  [key: string]: true | { include: IncludeObject };
};

export function parseInclude(
  includeParam?: string | string[],
): IncludeObject | undefined {
  if (!includeParam) return undefined;

  const includes = Array.isArray(includeParam)
    ? includeParam
    : includeParam.split(',');

  const result: IncludeObject = {};

  for (const path of includes) {
    const keys = path.trim().split('.');
    let current: IncludeObject = result;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (i === keys.length - 1) {
        current[key] = true;
      } else {
        if (current[key] !== true) {
          if (!current[key]) {
            current[key] = { include: {} };
          }
          current = (current[key] as { include: IncludeObject }).include;
        }
      }
    }
  }

  return result;
}
