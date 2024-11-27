import request from 'supertest';
import dotenv from "dotenv";
import app from '../src/app.js'; // Assumes the main Express app is exported from this file
import mongoose from 'mongoose';
import User from '../models/user';
import Link from '../models/link';
import server from '../server.js';

dotenv.config();
const URI = process.env.ATLAS_URI || "";


describe('Link Shortener API', () => {
    let user;
    let link;
  
    beforeAll(async () => {
      // Koneksi ke database MongoDB untuk pengujian
      await mongoose.connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout koneksi
        ssl: true,
        tlsAllowInvalidCertificates: true, // Sama seperti di MongoClient
      });
  
      // Buat user dan link untuk pengujian
      user = new User({
        name: 'John Doe2',
        email : `testuser${Date.now()}@example.com`,
        password: '123123'
      });
      await user.save();
  
      link = new Link({
        userId: user._id,
        originalUrl: 'http://example.com',
        shortUrl: 'abc123',
      });
      await link.save();
    });
  
    afterAll(async () => {
      await mongoose.connection.close(); // Tutup koneksi MongoDB
      if (server) server.close(); // Matikan server
  });
  
    test('POST /api/shortener - should create a new short link', async () => {
      const response = await request(app)
        .post('/api/shortener')
        .send({
          userId: user._id,
          originalUrl: 'http://test.com',
        });
  
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Short link created successfully');
      expect(response.body.link).toHaveProperty('shortUrl');
    });
  
    test('GET /api/shortener/:id - should return a short link', async () => {
      const response = await request(app).get(`/api/shortener/${link._id}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('originalUrl', 'http://example.com');
    });
  
    test('PUT /api/shortener/:id - should update a short link', async () => {
      const response = await request(app)
        .put(`/api/shortener/${link._id}`)
        .send({
          originalUrl: 'http://updated.com',
        });
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Link updated successfully');
      expect(response.body.link).toHaveProperty('originalUrl', 'http://updated.com');
    });
  
    test('DELETE /api/shortener/:id - should delete a short link', async () => {
      const response = await request(app).delete(`/api/shortener/${link._id}`);
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Link deleted successfully');
    });
  });