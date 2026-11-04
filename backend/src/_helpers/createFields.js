/**
 * @typedef {Object} FieldOptions
 * @property {string} [label]
 * @property {string} [type]
 * @property {boolean} [selectable]
 * @property {boolean} [sortable]
 * @property {boolean} [filterable]
 * @property {boolean} [visible]
 * @property {boolean} [queryable]
 * @property {boolean} [hiddenByDefault]
 * @property {string} [sortKey]
 * @property {string} [filterKey]
 * @property {boolean} [required]
 * @property {{ priority: number, direction?: "asc" | "desc" }} [defaultOrder]
 */

/**
 * @typedef {FieldOptions & {
 *   aggregate: true,
 *   fn?: string,
 *   format?: string,
 *   scope?: string,
 *   cast?: string,
 *   groupable?: boolean
 *   distinct?: boolean,
 * }} AggregateFieldOptions
 */

/** @param {FieldOptions} options */
const createField = (options = {}) => ({
  type: "string",
  selectable: true,
  sortable: true,
  filterable: true,
  visible: true,
  hiddenByDefault: false,
  ...options,
});

/** @param {AggregateFieldOptions} options */
const createAggregateField = (options) =>
  createField({
    type: "number",
    fn: "sum",
    format: "currency",
    scope: "aggregate",
    groupable: false,
    ...options,
  });

/**
 * @param {Record<string, FieldOptions | AggregateFieldOptions>} fields
 */
const createFields = (fields) =>
  Object.fromEntries(
    Object.entries(fields).map(([key, options]) => [
      key,
      options.aggregate ? createAggregateField(options) : createField(options),
    ])
  );

export { createFields };
