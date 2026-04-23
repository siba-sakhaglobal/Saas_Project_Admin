export class UsersModule {
  constructor(client) { this.c = client; }

  signupFields() { return this.c.get('/api/v1/users/signup-fields'); }
  register(body) { return this.c.post('/api/v1/users/register', body); }
  login(body) { return this.c.post('/api/v1/users/login', body); }
  refresh(body) { return this.c.post('/api/v1/users/refresh', body); }
  me() { return this.c.get('/api/v1/users/me'); }
  logout() { return this.c.post('/api/v1/users/logout', {}); }
}
