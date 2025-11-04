const request = require('supertest');
const app = require('../server/server');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dbConfig = require('../server/dbconfig');

let pool;

beforeAll(async () => {
  pool = await mysql.createPool(dbConfig);
});

afterAll(async () => {
  await pool.end();
});

describe('Authentication & Registration Tests', () => {
  // Registration Tests
  describe('POST /api/register', () => {
    const validUser = {
      nome: 'Test User',
      sobrenome: 'Test Last',
      email: 'test@example.com',
      telefone: '11999999999',
      cpf: '12345678901',
      rua: 'Test Street',
      bairro: 'Test District',
      numero: '123',
      cargo_fun: 'Gerente',
      password: 'test123'
    };

    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/register')
        .send(validUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Funcionário cadastrado com sucesso!');
    });

    it('should reject registration with missing required fields', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Todos os campos marcados como obrigatórios devem ser preenchidos.');
    });

    it('should validate CPF length', async () => {
      const invalidUser = {...validUser, cpf: '123'};
      const response = await request(app)
        .post('/api/register')
        .send(invalidUser);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('O CPF deve conter exatamente 11 dígitos.');
    });
  });

  // Login Tests
  describe('POST /api/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'test123',
        cargo_fun: 'Gerente'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login bem-sucedido!');
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'wrongpass',
        cargo_fun: 'Gerente'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData);
      
      expect(response.status).toBe(401);
    });

    it('should require all login fields', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email, senha e cargo são obrigatórios.');
    });
  });
});

// Dashboard & Room Management Tests
describe('Dashboard & Room Management', () => {
  describe('GET /dashboard', () => {
    it('should serve dashboard page', async () => {
      const response = await request(app)
        .get('/dashboard');
      
      expect(response.status).toBe(200);
    });
  });

  describe('Room Operations', () => {
    const testRoom = {
      numero: '101',
      capacidade: 2,
      preco: 100.00,
      status: 'Disponível'
    };

    it('should create a new room', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .send(testRoom);
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Quarto cadastrado com sucesso!');
    });

    it('should list all rooms', async () => {
      const response = await request(app)
        .get('/api/rooms');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should update room status', async () => {
      const response = await request(app)
        .put('/api/rooms/101')
        .send({ status: 'Ocupado' });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Status do quarto atualizado com sucesso!');
    });
  });
});