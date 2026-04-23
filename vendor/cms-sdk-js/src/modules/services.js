export class ServicesModule {
  constructor(client) { this.c = client; }

  list(params) { return this.c.get('/api/service', { params }); }
  get(id) { return this.c.get(`/api/service/${id}`); }
  create(body) { return this.c.post('/api/service', body); }
  update(id, body) { return this.c.put(`/api/service/${id}`, body); }
  delete(id) { return this.c.delete(`/api/service/${id}`); }
  stats() { return this.c.get('/api/service/stats'); }
}
