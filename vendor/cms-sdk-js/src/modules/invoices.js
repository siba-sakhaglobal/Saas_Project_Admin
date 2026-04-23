export class InvoicesModule {
  constructor(client) { this.c = client; }

  list(params) { return this.c.get('/api/invoice', { params }); }
  get(id) { return this.c.get(`/api/invoice/${id}`); }
  create(body) { return this.c.post('/api/invoice', body); }
  update(id, body) { return this.c.put(`/api/invoice/${id}`, body); }
  delete(id) { return this.c.delete(`/api/invoice/${id}`); }
  stats() { return this.c.get('/api/invoice/stats'); }
}
