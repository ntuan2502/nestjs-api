type Primitive = string | number | boolean;

type WhereObject = {
  [key: string]: Primitive | WhereObject;
};

export function parseFilter(filterParam?: string | string[]): WhereObject {
  if (!filterParam) return {};

  const filters = Array.isArray(filterParam)
    ? filterParam
    : filterParam.split(',');

  const result: WhereObject = {};

  for (const filter of filters) {
    const [path, value] = filter.split('=');
    if (!path || value === undefined) continue;

    const keys = path.trim().split('.');
    let current: WhereObject = result;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (i === keys.length - 1) {
        // Nếu giá trị là số hoặc boolean, parse tương ứng
        const parsedValue = parsePrimitive(value.trim());
        current[key] = parsedValue;
      } else {
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }
    }
  }

  return result;
}

function parsePrimitive(value: string): Primitive {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(Number(value))) return Number(value);
  return value;
}
