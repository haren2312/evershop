import {
  commit,
  insert,
  PoolClient,
  rollback,
  startTransaction
} from '@evershop/postgres-query-builder';
import { getConnection } from '../../../../lib/postgres/connection.js';
import { hookable, hookBefore, hookAfter } from '../../../../lib/util/hookable.js';
import {
  getValue,
  getValueSync
} from '../../../../lib/util/registry.js';
import { getAjv } from '../../../base/services/getAjv.js';
import widgetDataSchema from './widgetDataSchema.json' with { type: 'json' };

export type WidgetData = {
  name: string;
  status: number;
  sort_order: number;
  [key: string]: unknown;
};

function validateWidgetDataBeforeInsert(data: WidgetData): WidgetData {
  const ajv = getAjv();
  (widgetDataSchema as any).required = ['status', 'name', 'sort_order'];
  const jsonSchema = getValueSync(
    'createWidgetDataJsonSchema',
    widgetDataSchema,
    {}
  );
  const validate = ajv.compile(jsonSchema);
  const valid = validate(data);
  if (valid) {
    return data;
  } else {
    throw new Error(validate.errors[0].message);
  }
}

async function insertWidgetData(data: WidgetData, connection: PoolClient) {
  const widget = await insert('widget').given(data).execute(connection);
  return widget;
}

/**
 * Create widget service. This service will create a widget with all related data
 * @param {Object} data
 * @param {Object} context
 */
async function createWidget(data: WidgetData, context: Record<string, any>) {
  const connection = await getConnection();
  await startTransaction(connection);
  try {
    const widgetData = await getValue('widgetDataBeforeCreate', data);
    // Validate widget data
    validateWidgetDataBeforeInsert(widgetData);

    // Insert widget data
    const widget = await hookable(insertWidgetData, { ...context, connection })(
      widgetData,
      connection
    );

    await commit(connection);
    return widget;
  } catch (e) {
    await rollback(connection);
    throw e;
  }
}

export default async (data: WidgetData, context: Record<string, any>) => {
  // Make sure the context is either not provided or is an object
  if (context && typeof context !== 'object') {
    throw new Error('Context must be an object');
  }
  const widget = await hookable(createWidget, context)(data, context);
  return widget;
};

export function hookBeforeInsertWidgetData(
  callback: (
    this: Record<string, any>,
    ...args: [data: WidgetData, connection: PoolClient]
  ) => void | Promise<void>,
  priority: number = 10
): void {
  hookBefore('insertWidgetData', callback, priority);
}

export function hookAfterInsertWidgetData(
  callback: (
    this: Record<string, any>,
    ...args: [data: WidgetData, connection: PoolClient]
  ) => void | Promise<void>,
  priority: number = 10
): void {
  hookAfter('insertWidgetData', callback, priority);
}

export function hookBeforeCreateWidget(
  callback: (
    this: Record<string, any>,
    ...args: [data: WidgetData, context: Record<string, any>]
  ) => void | Promise<void>,
  priority: number = 10
): void {
  hookBefore('createWidget', callback, priority);
}

export function hookAfterCreateWidget(
  callback: (
    this: Record<string, any>,
    ...args: [data: WidgetData, context: Record<string, any>]
  ) => void | Promise<void>,
  priority: number = 10
): void {
  hookAfter('createWidget', callback, priority);
}
