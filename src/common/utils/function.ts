import { Request } from 'express';

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (forwardedFor) {
    const ipList = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor.split(',')[0];
    return ipList.trim() || 'unknown';
  }

  const realIp = req.headers['x-real-ip'];

  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp || 'unknown';
  }

  return req.ip || 'unknown';
}

export function parseLifetimeToDays(lifetime: string): number {
  const match = lifetime.match(/^(\d+)([dhm])$/);

  if (!match) return 7;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return value;
    case 'h':
      return value / 24;
    case 'm':
      return value / (24 * 60);
    default:
      return 7;
  }
}

export function normalizePath(path: string) {
  return path.replace(/\\/g, '/');
}
