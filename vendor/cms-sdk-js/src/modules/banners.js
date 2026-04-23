export class BannersModule {
  constructor(client) { this.c = client; }

  list(params) { return this.c.get('/api/banner', { params }); }
  get(id) { return this.c.get(`/api/banner/${id}`); }
  create(body) { return this.c.post('/api/banner', body); }
  update(id, body) { return this.c.put(`/api/banner/${id}`, body); }
  delete(id) { return this.c.delete(`/api/banner/${id}`); }
  stats() { return this.c.get('/api/banner/stats'); }
}
