/**
 * Custom module — dynamic CRUD for any SurrealDB-backed table.
 *
 * Claude should use the helper methods (avg, sum, groupBy, etc.)
 * instead of writing raw SurrealQL queries.
 */

export class CustomModule {
  constructor(client, table) {
    this.c = client;
    this.table = table;
  }

  // --- Standard CRUD (same interface as core modules) ---
  list(params) { return this.c.get(`/api/custom/${this.table}`, { params }); }
  get(id) { return this.c.get(`/api/custom/${this.table}/${id}`); }
  create(body) { return this.c.post(`/api/custom/${this.table}`, body); }
  update(id, body) { return this.c.put(`/api/custom/${this.table}/${id}`, body); }
  delete(id) { return this.c.delete(`/api/custom/${this.table}/${id}`); }
  count(filters) { return this.c.get(`/api/custom/${this.table}/_count`, { params: filters }); }

  // --- Aggregate helpers (safe, no raw SurrealQL needed) ---

  /** Get average of a numeric field. Optional filters. */
  avg(field, filters) {
    return this._aggregate(`math::mean(${field}) AS value`, filters);
  }

  /** Get sum of a numeric field. */
  sum(field, filters) {
    return this._aggregate(`math::sum(${field}) AS value`, filters);
  }

  /** Get min of a field. */
  min(field, filters) {
    return this._aggregate(`math::min(${field}) AS value`, filters);
  }

  /** Get max of a field. */
  max(field, filters) {
    return this._aggregate(`math::max(${field}) AS value`, filters);
  }

  /** Count + aggregate in one call. Great for stats cards. */
  stats(fields) {
    const parts = ['count() AS total'];
    for (const [alias, expr] of Object.entries(fields || {})) {
      parts.push(`${expr} AS ${alias}`);
    }
    return this._aggregate(parts.join(', '));
  }

  /** Group by a field with count. Returns [{ field_value, count }] */
  groupBy(field, filters) {
    const where = this._buildWhere(filters);
    const sql = `SELECT ${field}, count() AS count FROM ${this.table} ${where} GROUP BY ${field} ORDER BY count DESC`;
    return this._safeQuery(sql);
  }

  /** Get distinct values of a field. */
  distinct(field, filters) {
    const where = this._buildWhere(filters);
    const sql = `SELECT array::distinct(${field}) AS values FROM ${this.table} ${where} GROUP ALL`;
    return this._safeQuery(sql);
  }

  /** Search records with text matching across multiple fields. */
  search(term, fields = ['name', 'title', 'description'], params = {}) {
    return this.list({ ...params, search: term });
  }

  /** Find records where a field matches a value. Shorthand for list with filter. */
  findBy(field, value, params = {}) {
    return this.list({ ...params, [field]: value });
  }

  /** Get recent records (last N). */
  recent(limit = 10) {
    return this.list({ limit, sort: 'created_at', order: 'DESC' });
  }

  // --- Raw query (last resort, with error wrapping) ---
  query(sql, vars) {
    return this._safeQuery(sql, vars);
  }

  // --- Internal helpers ---

  _buildWhere(filters) {
    if (!filters || Object.keys(filters).length === 0) return '';
    const parts = Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k} = ${JSON.stringify(v)}`);
    return parts.length > 0 ? `WHERE ${parts.join(' AND ')}` : '';
  }

  async _aggregate(selectExpr, filters) {
    const where = this._buildWhere(filters);
    const sql = `SELECT ${selectExpr} FROM ${this.table} ${where} GROUP ALL`;
    return this._safeQuery(sql);
  }

  async _safeQuery(sql) {
    try {
      const result = await this.c.post(`/api/custom/${this.table}/_query`, { sql });
      return result;
    } catch (err) {
      const friendlyMsg = this._friendlyError(err);
      throw new Error(friendlyMsg);
    }
  }

  _friendlyError(err) {
    const msg = err?.message || String(err);
    if (msg.includes('Parse error')) return `Query syntax error in '${this.table}'. Check field names and operators.`;
    if (msg.includes('not found')) return `Table '${this.table}' has no data yet. Create some records first.`;
    if (msg.includes('field')) return `Unknown field referenced in '${this.table}' query. Verify field names match your data.`;
    return `Query failed on '${this.table}': ${msg}`;
  }
}

export class CustomModuleFactory {
  constructor(client) { this.c = client; }
  tables() { return this.c.get('/api/custom/_tables'); }
  module(table) { return new CustomModule(this.c, table); }
}
