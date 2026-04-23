export class MediaModule {
  constructor(client) { this.c = client; }

  list(params) { return this.c.get('/api/media', { params }); }
  get(id) { return this.c.get(`/api/media/${id}`); }
  update(id, body) { return this.c.put(`/api/media/${id}`, body); }
  delete(id) { return this.c.delete(`/api/media/${id}`); }
  bulkDelete(ids) { return this.c.post('/api/media/bulk-delete', { ids }); }
  stats() { return this.c.get('/api/media/stats'); }

  presignUpload(body) { return this.c.post('/api/media/presign-upload', body); }
  register(body) { return this.c.post('/api/media/register', body); }
  presignDownload(body) { return this.c.post('/api/media/presign-download', body); }
  generateUploadUrl(body) { return this.c.post('/api/media/generate-upload-url', body); }
  confirmUpload(body) { return this.c.post('/api/media/confirm-upload', body); }
}
