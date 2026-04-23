export class DonationsModule {
  constructor(client) { this.c = client; }

  listCampaigns(params) { return this.c.get('/api/donations/campaigns', { params }); }
  getCampaign(id) { return this.c.get(`/api/donations/campaigns/${id}`); }
  createCampaign(body) { return this.c.post('/api/donations/campaigns', body); }
  updateCampaign(id, body) { return this.c.put(`/api/donations/campaigns/${id}`, body); }
  deleteCampaign(id) { return this.c.delete(`/api/donations/campaigns/${id}`); }

  listDonations(params) { return this.c.get('/api/donations/donations', { params }); }
  stats() { return this.c.get('/api/donations/stats/overview'); }
}
