import { select } from '@evershop/postgres-query-builder';
import { pool } from '../../../lib/postgres/connection.js';

export type Setting = {
  name: string;
  value: unknown;
};

let setting: Setting[] | undefined;

export async function getSetting<T>(name: string, defaultValue: T): Promise<T> {
  if (!setting) {
    setting = await select().from('setting').execute(pool);
  }
  const row = setting.find((s) => s.name === name);
  if (row) {
    return row.value as T;
  } else {
    return defaultValue;
  }
}

export async function refreshSetting(): Promise<void> {
  setting = await select().from('setting').execute(pool);
}

export async function getStoreName(
  defaultValue: string = 'Evershop'
): Promise<string> {
  return await getSetting('storeName', defaultValue);
}

export function getStoreDescription(): Promise<string | null> {
  return getSetting('storeDescription', null);
}

export async function getStoreEmail(): Promise<string | null> {
  return await getSetting('storeEmail', null);
}

export async function getStorePhoneNumber(): Promise<string | null> {
  return await getSetting('storePhoneNumber', null);
}

export function getStoreCountry(): Promise<string | null> {
  return getSetting('storeCountry', null);
}

export function getStoreProvince(): Promise<string | null> {
  return getSetting('storeProvince', null);
}

export function getStoreCity(): Promise<string | null> {
  return getSetting('storeCity', null);
}

export function getStoreAddress(): Promise<string | null> {
  return getSetting('storeAddress', null);
}

export function getStorePostalCode(): Promise<string | null> {
  return getSetting('storePostalCode', null);
}
