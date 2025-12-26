import { ip } from './address';

export interface StartupLoggerOptions {
  https?: boolean;
  port: number;
  start?: number;
}

export function startupLogger(options: StartupLoggerOptions) {
  const { https, port, start } = options;

  const protocol = https ? 'https' : 'http';

  const localUrl = `${protocol}://localhost:${port.toString()}/`;
  let lanUrl: string | null = null;
  const localIp = ip();
  if (localIp && /^10\.|^172\.(1[6-9]|2\d|3[01])\.|^192\.168\./.test(localIp)) {
    lanUrl = `${protocol}://${localIp}:${port.toString()}/`;
  }

  if (typeof start === 'number') {
    const end = performance.now();
    console.log(`ready in ${(end - start).toFixed(2)} ms`);
  }

  console.log([`➜ Local:   ${localUrl}`, lanUrl && `➜ Network: ${lanUrl}`].filter(Boolean).join('\n').trim());
}
