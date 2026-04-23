export class ProductsModule {
  constructor(client) { this.c = client; }

  list(params) { return this.c.get('/api/products', { params }); }
  get(id) { return this.c.get(`/api/products/${id}`); }
  create(body) { return this.c.post('/api/products', body); }
  update(id, body) { return this.c.put(`/api/products/${id}`, body); }
  delete(id) { return this.c.delete(`/api/products/${id}`); }
  stats() { return this.c.get('/api/products/stats'); }

  listCategories() { return this.c.get('/api/products/categories'); }
  getCategoryTree() { return this.c.get('/api/products/categories/tree'); }
  createCategory(body) { return this.c.post('/api/products/categories', body); }
  updateCategory(id, body) { return this.c.put(`/api/products/categories/${id}`, body); }
  deleteCategory(id) { return this.c.delete(`/api/products/categories/${id}`); }

  listTags() { return this.c.get('/api/products/tags'); }
  createTag(body) { return this.c.post('/api/products/tags', body); }
  deleteTag(id) { return this.c.delete(`/api/products/tags/${id}`); }

  listAttributes() { return this.c.get('/api/products/attributes'); }
  createAttribute(body) { return this.c.post('/api/products/attributes', body); }
  deleteAttribute(id) { return this.c.delete(`/api/products/attributes/${id}`); }
}
