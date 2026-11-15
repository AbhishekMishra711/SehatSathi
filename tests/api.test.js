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

  it('POST /api/auth/send-otp without email should return 400 validation error', async () => {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login without credentials should return 400 validation error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/send-otp with valid email should return 200 OK', async () => {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ email: 'test.user@example.com', purpose: 'REGISTER' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/cron/tick without valid secret should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/cron/tick');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
