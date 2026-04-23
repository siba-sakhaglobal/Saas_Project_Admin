export class AnalyticsModule {
  constructor(client) { this.c = client; }

  all(params) { return this.c.get('/api/analytics/all', { params }); }
  overview(params) { return this.c.get('/api/analytics/overview', { params }); }
  traffic(params) { return this.c.get('/api/analytics/traffic', { params }); }
  donations(params) { return this.c.get('/api/analytics/donations', { params }); }
  content(params) { return this.c.get('/api/analytics/content', { params }); }
  events() { return this.c.get('/api/analytics/events'); }
}
