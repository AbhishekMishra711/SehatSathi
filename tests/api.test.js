import { describe, it, expect } from 'vitest';
const request = require('supertest');
const app = require('../server/app');

describe('API Integration Tests', () => {
  it('GET /health should return 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('SehatSathi API');
  });

  it('POST /api/auth/login without body should return 400 validation error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/quick-demo-login with ELDER should return token and elder profile', async () => {
    const res = await request(app)
      .post('/api/auth/quick-demo-login')
      .send({ role: 'ELDER' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('ELDER');
    expect(res.body.user.name).toBe('Ramesh Sharma');
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/quick-demo-login with CARETAKER should return token and caretaker role', async () => {
    const res = await request(app)
      .post('/api/auth/quick-demo-login')
      .send({ role: 'CARETAKER' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('CARETAKER');
    expect(res.body.user.name).toBe('Aarav Sharma');
  });

  it('GET /api/cron/tick without valid secret should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/cron/tick');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
