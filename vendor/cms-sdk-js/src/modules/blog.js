export class BlogModule {
  constructor(client) { this.c = client; }

  list(params) { return this.c.get('/api/blog/posts', { params }); }
  get(id) { return this.c.get(`/api/blog/posts/${id}`); }
  create(body) { return this.c.post('/api/blog/posts', body); }
  update(id, body) { return this.c.put(`/api/blog/posts/${id}`, body); }
  delete(id) { return this.c.delete(`/api/blog/posts/${id}`); }
  publish(id) { return this.c.put(`/api/blog/posts/${id}/publish`); }
  unpublish(id) { return this.c.put(`/api/blog/posts/${id}/unpublish`); }
  stats() { return this.c.get('/api/blog/stats'); }
  authors() { return this.c.get('/api/blog/authors'); }

  listCategories() { return this.c.get('/api/blog/categories'); }
  createCategory(body) { return this.c.post('/api/blog/categories', body); }
  updateCategory(id, body) { return this.c.put(`/api/blog/categories/${id}`, body); }
  deleteCategory(id) { return this.c.delete(`/api/blog/categories/${id}`); }
}
