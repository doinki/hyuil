import type { NetworkInterfaceInfo } from 'node:os';
import { networkInterfaces, platform } from 'node:os';

function getDefaultInterfaceName() {
  let val: string | undefined = 'eth';
  const p = platform();
  if (p === 'darwin') {
    val = 'en';
  } else if (p === 'win32') {
    val = undefined;
  }
  return val;
}

function matchName(actualFamily: string | number, expectedFamily: string | number) {
  if (expectedFamily === 'IPv4') {
    return actualFamily === 'IPv4' || actualFamily === 4;
  }
  if (expectedFamily === 'IPv6') {
    return actualFamily === 'IPv6' || actualFamily === 6;
  }
  return actualFamily === expectedFamily;
}

function findAddressFromInterface(
  items: NetworkInterfaceInfo[],
  expectedFamily: string | number,
  ignoreLoAddress = false,
) {
  let firstMatchItem;
  for (const item of items) {
    if (matchName(item.family, expectedFamily)) {
      if (ignoreLoAddress && item.address.startsWith('127.')) {
        continue;
      }
      if (expectedFamily === 'IPv6') {
        if (item.scopeid === 0) return item;
        if (!firstMatchItem) {
          firstMatchItem = item;
        }
      } else {
        return item;
      }
    }
  }
  return firstMatchItem;
}

function getInterfaceAddress(family?: string, name?: string) {
  const interfaces = networkInterfaces();
  const noName = !name;
  name = name || getDefaultInterfaceName();
  family = family || 'IPv4';
  if (name) {
    for (let i = -1; i < 8; i++) {
      const interfaceName = name + (i >= 0 ? i : '');
      const items = interfaces[interfaceName];
      if (items) {
        const item = findAddressFromInterface(items, family);
        if (item) {
          return item;
        }
      }
    }
  }

  if (noName) {
    for (const k in interfaces) {
      const items = interfaces[k];
      if (items) {
        const item = findAddressFromInterface(items, family, true);
        if (item) {
          return item;
        }
      }
    }
  }
  return;
}

export function ip(interfaceName?: string) {
  const item = getInterfaceAddress('IPv4', interfaceName);
  return item?.address;
}
