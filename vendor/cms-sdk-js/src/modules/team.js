export class TeamModule {
  constructor(client) { this.c = client; }

  list(params) { return this.c.get('/api/team', { params }); }
  get(id) { return this.c.get(`/api/team/${id}`); }
  create(body) { return this.c.post('/api/team', body); }
  update(id, body) { return this.c.put(`/api/team/${id}`, body); }
  delete(id) { return this.c.delete(`/api/team/${id}`); }
  stats() { return this.c.get('/api/team/stats'); }
  categories() { return this.c.get('/api/team/categories/list'); }
}
