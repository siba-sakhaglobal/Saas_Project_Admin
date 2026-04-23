export class EventsModule {
  constructor(client) { this.c = client; }

  list(params) { return this.c.get('/api/events', { params }); }
  get(id) { return this.c.get(`/api/events/${id}`); }
  create(body) { return this.c.post('/api/events', body); }
  update(id, body) { return this.c.put(`/api/events/${id}`, body); }
  delete(id) { return this.c.delete(`/api/events/${id}`); }
  stats() { return this.c.get('/api/events/stats/overview'); }

  listCategories() { return this.c.get('/api/events/categories/list'); }
  createCategory(body) { return this.c.post('/api/events/categories', body); }
  updateCategory(id, body) { return this.c.put(`/api/events/categories/${id}`, body); }
  deleteCategory(id) { return this.c.delete(`/api/events/categories/${id}`); }
}
