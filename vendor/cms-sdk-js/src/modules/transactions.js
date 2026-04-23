export class TransactionsModule {
  constructor(client) { this.c = client; }

  list(params) { return this.c.get('/api/transaction', { params }); }
  get(id) { return this.c.get(`/api/transaction/${id}`); }
  create(body) { return this.c.post('/api/transaction', body); }
  update(id, body) { return this.c.put(`/api/transaction/${id}`, body); }
  delete(id) { return this.c.delete(`/api/transaction/${id}`); }
  stats() { return this.c.get('/api/transaction/stats'); }
}
