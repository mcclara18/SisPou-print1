const request = require('supertest');
const app = require('../../server/server.js');

describe('API Endpoints', () => {
  describe('GET /', () => {
    it('should return 200 and serve login page', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/register', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Todos os campos marcados como obrigatórios devem ser preenchidos.');
    });

    it('should validate CPF length', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          nome: 'Test',
          email: 'test@test.com',
          password: '1234',
          cargo_fun: 'Gerente',
          cpf: '123'
        });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('O CPF deve conter exatamente 11 dígitos.');
    });
  });

  describe('POST /api/login', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email, senha e cargo são obrigatórios.');
    });
  });

  describe('GET /api/rooms', () => {
    it('should return list of rooms', async () => {
      const response = await request(app).get('/api/rooms');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});