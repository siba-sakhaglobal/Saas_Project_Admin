export class OrdersModule {
  constructor(client) { this.c = client; }

  list(params) { return this.c.get('/api/order', { params }); }
  get(id) { return this.c.get(`/api/order/${id}`); }
  create(body) { return this.c.post('/api/order', body); }
  update(id, body) { return this.c.put(`/api/order/${id}`, body); }
  delete(id) { return this.c.delete(`/api/order/${id}`); }
  stats() { return this.c.get('/api/order/stats'); }
}
