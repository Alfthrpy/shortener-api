
import request from 'supertest';
import dotenv from "dotenv";
import app from '../src/app.js'; // Assumes the main Express app is exported from this file
import server from '../server.js';


dotenv.config();
const URI = process.env.ATLAS_URI || "";

describe('Auth API Endpoints', () => {

  afterAll(async () => {
    if (server) server.close(); // Matikan server
});

    // Test POST /register
    describe('POST /register', () => {
      it('should register a new user and return success message', async () => {
        const userData = {
          name: 'John Doe2',
          email: `testuser${Date.now()}@example.com`,
          password: 'password123',
        };
  
        const response = await request(app)
          .post('/api/auth/register')
          .send(userData);
  
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User registered successfully');
      });
  
      it('should return 400 if user already exists', async () => {
        const userData = {
          name: 'Jane Doe',
          email: 'john.doe@example.com', // Use an email that already exists
          password: 'password123',
        };
  
        const response = await request(app)
          .post('/api/auth/register')
          .send(userData);
  
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'User already exists');
      });
    });
  
    // Test POST /login
    describe('POST /login', () => {
      it('should log in a user and return a token', async () => {
        const loginData = {
          email: 'john.doe@example.com',
          password: 'password123',
        };
  
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');
      });
  
      it('should return 401 if credentials are invalid', async () => {
        const loginData = {
          email: 'john.doe@example.com',
          password: 'wrongpassword',
        };
  
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);
  
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Invalid credentials');
      });
  
      it('should return 401 if the user does not exist', async () => {
        const loginData = {
          email: 'nonexistent.user@example.com',
          password: 'password123',
        };
  
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);
  
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Invalid credentials');
      });
    });
  });