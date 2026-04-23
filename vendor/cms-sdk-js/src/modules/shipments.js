export class ShipmentsModule {
  constructor(client) { this.c = client; }

  list(params) { return this.c.get('/api/shipment', { params }); }
  get(id) { return this.c.get(`/api/shipment/${id}`); }
  create(body) { return this.c.post('/api/shipment', body); }
  update(id, body) { return this.c.put(`/api/shipment/${id}`, body); }
  delete(id) { return this.c.delete(`/api/shipment/${id}`); }
  stats() { return this.c.get('/api/shipment/stats'); }
}
