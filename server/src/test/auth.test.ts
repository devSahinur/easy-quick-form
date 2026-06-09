import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

const validUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123@',
  cPassword: 'Password123@',
};

const signup = () => request(app).post('/api/v1/auth/signup').send(validUser);

describe('Auth API', () => {
  describe('POST /api/v1/auth/signup', () => {
    it('creates a user and returns an access token', async () => {
      const res = await signup();
      expect(res.status).toBe(201);
      expect(res.body.accessToken).toBeTruthy();
      expect(res.body.data.user.email).toBe(validUser.email);
    });

    it('rejects a weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({ ...validUser, password: 'weak', cPassword: 'weak' });
      expect(res.status).toBe(400);
    });

    it('rejects a duplicate email', async () => {
      await signup();
      const res = await signup();
      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('logs in with correct credentials and sets a refresh cookie', async () => {
      await signup();
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeTruthy();
      expect(res.headers['set-cookie']?.[0]).toMatch(/refreshToken=/);
    });

    it('rejects an incorrect password', async () => {
      await signup();
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: validUser.email, password: 'WrongPass123@' });
      expect(res.status).toBe(401);
    });

    it('rejects a missing password (validation)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: validUser.email });
      expect(res.status).toBe(400);
    });
  });

  describe('protected routes (verifyJWT)', () => {
    it('blocks access without a token', async () => {
      const res = await request(app).get('/api/v1/user/profile');
      expect(res.status).toBe(401);
    });

    it('rejects an invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', 'Bearer not-a-real-token');
      expect(res.status).toBe(403);
    });

    it('allows access with a valid token', async () => {
      const res = await signup();
      const token = res.body.accessToken;
      const profile = await request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(profile.status).toBe(200);
      expect(profile.body.data.user.email).toBe(validUser.email);
    });
  });

  describe('GET /api/v1/auth/refresh', () => {
    it('issues a new access token from the refresh cookie', async () => {
      await signup();
      const login = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      const cookie = login.headers['set-cookie'];
      const res = await request(app)
        .get('/api/v1/auth/refresh')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeTruthy();
    });

    it('rejects when no refresh cookie is present', async () => {
      const res = await request(app).get('/api/v1/auth/refresh');
      expect(res.status).toBe(401);
    });
  });
});
