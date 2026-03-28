import {
  commit,
  PoolClient,
  rollback,
  select,
  startTransaction,
  update
} from '@evershop/postgres-query-builder';
import { getConnection } from '../../../../lib/postgres/connection.js';
import { hookable, hookBefore, hookAfter } from '../../../../lib/util/hookable.js';
import {
  getValue,
  getValueSync
} from '../../../../lib/util/registry.js';
import { getAjv } from '../../../base/services/getAjv.js';
import { WidgetData } from './createWidget.js';
import widgetDataSchema from './widgetDataSchema.json' with { type: 'json' };

function validateWidgetDataBeforeInsert(data: Partial<WidgetData>): Partial<WidgetData> {
  const ajv = getAjv();
  (widgetDataSchema as any).required = ['status'];
  const jsonSchema = getValueSync(
    'updateWidgetDataJsonSchema',
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

async function updateWidgetData(
  uuid: string,
  data: Partial<WidgetData>,
  connection: PoolClient
) {
  const query = select().from('widget');
  const widget = await query.where('uuid', '=', uuid).load(connection);

  if (!widget) {
    throw new Error('Requested widget not found');
  }
  const newWidget = await update('widget')
    .given(data)
    .where('uuid', '=', uuid)
    .execute(connection);

  return newWidget;
}

/**
 * Update widget service. This service will update a widget with all related data
 * @param {String} uuid
 * @param {Object} data
 * @param {Object} context
 */
async function updateWidget(
  uuid: string,
  data: Partial<WidgetData>,
  context: Record<string, any>
) {
  const connection = await getConnection();
  await startTransaction(connection);
  try {
    const widgetData = await getValue('widgetDataBeforeUpdate', data);
    // Validate widget data
    validateWidgetDataBeforeInsert(widgetData);

    // Update widget data
    const widget = await hookable(updateWidgetData, { ...context, connection })(
      uuid,
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

export default async (
  uuid: string,
  data: Partial<WidgetData>,
  context: Record<string, any>
) => {
  // Make sure the context is either not provided or is an object
  if (context && typeof context !== 'object') {
    throw new Error('Context must be an object');
  }
  const widget = await hookable(updateWidget, context)(uuid, data, context);
  return widget;
};

export function hookBeforeUpdateWidgetData(
  callback: (
    this: Record<string, any>,
    ...args: [uuid: string, data: Partial<WidgetData>, connection: PoolClient]
  ) => void | Promise<void>,
  priority: number = 10
): void {
  hookBefore('updateWidgetData', callback, priority);
}

export function hookAfterUpdateWidgetData(
  callback: (
    this: Record<string, any>,
    ...args: [uuid: string, data: Partial<WidgetData>, connection: PoolClient]
  ) => void | Promise<void>,
  priority: number = 10
): void {
  hookAfter('updateWidgetData', callback, priority);
}

export function hookBeforeUpdateWidget(
  callback: (
    this: Record<string, any>,
    ...args: [uuid: string, data: Partial<WidgetData>, context: Record<string, any>]
  ) => void | Promise<void>,
  priority: number = 10
): void {
  hookBefore('updateWidget', callback, priority);
}

export function hookAfterUpdateWidget(
  callback: (
    this: Record<string, any>,
    ...args: [uuid: string, data: Partial<WidgetData>, context: Record<string, any>]
  ) => void | Promise<void>,
  priority: number = 10
): void {
  hookAfter('updateWidget', callback, priority);
}
