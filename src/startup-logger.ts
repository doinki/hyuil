import { styleText } from 'node:util';

import { ip } from 'address';

export interface StartupLoggerOptions {
  https?: boolean;
  port: number;
  start?: number;
}

export function startupLogger(options: StartupLoggerOptions) {
  const { https, port, start } = options;

  const protocol = https ? 'https' : 'http';

  const localUrl = `${protocol}://localhost:${styleText('bold', port.toString())}/`;
  let lanUrl: string | null = null;
  const localIp = ip();
  if (localIp && /^10\.|^172\.(1[6-9]|2\d|3[01])\.|^192\.168\./.test(localIp)) {
    lanUrl = `${protocol}://${localIp}:${styleText('bold', port.toString())}/`;
  }

  if (typeof start === 'number') {
    const end = performance.now();
    console.log(`${styleText('gray', 'ready in')} ${styleText('bold', (end - start).toFixed(2))} ms`);
  }

  const next = styleText('green', '➜');
  console.log(
    [`${next} Local:   ${styleText('cyan', localUrl)}`, lanUrl && `${next} Network: ${styleText('cyan', lanUrl)}`]
      .filter(Boolean)
      .join('\n')
      .trim(),
  );
}
