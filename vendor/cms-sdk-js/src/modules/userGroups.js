export class UserGroupsModule {
  constructor(client) { this.c = client; }

  list(params) { return this.c.get('/api/user-groups', { params }); }
  get(id) { return this.c.get(`/api/user-groups/${id}`); }
  create(body) { return this.c.post('/api/user-groups', body); }
  update(id, body) { return this.c.put(`/api/user-groups/${id}`, body); }
  delete(id) { return this.c.delete(`/api/user-groups/${id}`); }
  tree() { return this.c.get('/api/user-groups/tree'); }
  stats() { return this.c.get('/api/user-groups/stats'); }
  assign(body) { return this.c.post('/api/user-groups/assign', body); }
  bulkAssign(body) { return this.c.post('/api/user-groups/bulk-assign', body); }
  seedDefault() { return this.c.post('/api/user-groups/seed-default', {}); }

  createSubgroup(groupId, body) { return this.c.post(`/api/user-groups/${groupId}/subgroups`, body); }
  updateSubgroup(groupId, subId, body) { return this.c.put(`/api/user-groups/${groupId}/subgroups/${subId}`, body); }
  deleteSubgroup(groupId, subId) { return this.c.delete(`/api/user-groups/${groupId}/subgroups/${subId}`); }
}
