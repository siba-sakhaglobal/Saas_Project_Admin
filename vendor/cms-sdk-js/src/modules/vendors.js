export class VendorsModule {
  constructor(client) { this.c = client; }

  list(params) { return this.c.get('/api/vendor', { params }); }
  get(id) { return this.c.get(`/api/vendor/${id}`); }
  create(body) { return this.c.post('/api/vendor', body); }
  update(id, body) { return this.c.put(`/api/vendor/${id}`, body); }
  delete(id) { return this.c.delete(`/api/vendor/${id}`); }
  stats() { return this.c.get('/api/vendor/stats'); }
}
