export class AppointmentsModule {
  constructor(client) { this.c = client; }

  list(params) { return this.c.get('/api/appointment', { params }); }
  get(id) { return this.c.get(`/api/appointment/${id}`); }
  create(body) { return this.c.post('/api/appointment', body); }
  update(id, body) { return this.c.put(`/api/appointment/${id}`, body); }
  delete(id) { return this.c.delete(`/api/appointment/${id}`); }
  stats() { return this.c.get('/api/appointment/stats'); }
}
