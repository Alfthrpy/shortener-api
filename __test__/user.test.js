import request from 'supertest';
import dotenv from "dotenv";
import app from '../src/app.js'; 
import User from '../models/user';
import server from '../server.js';

dotenv.config();
const URI = process.env.ATLAS_URI || "";

// Utility function to create a test user
async function createTestUser() {
  const userData = {
    name: 'test',
    email: `testuser${Date.now()}@example.com`,
    password: 'password123', // Pastikan password di-hash sesuai dengan kebutuhan
  };

  try {
    const newUser = new User(userData);
    const savedUser = await newUser.save();
    console.log('Test user created successfully:', savedUser._id);
    return savedUser._id;
  } catch (error) {
    console.error('Error creating test user:', error.message);
    throw new Error('Failed to create test user');
  }
}


// Utility function to delete a test user
async function deleteTestUser(userId) {
  const response = await request(app)
    .delete(`/api/user/${userId}`);

  if (response.status !== 200) {
    throw new Error('Failed to delete test user');
  }
}

describe('User API Endpoints', () => {
  let testUserId;

  beforeAll(async () => {
    try {
      testUserId = await createTestUser();
    } catch (error) {
      console.error('Error creating test user:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (testUserId) {
      try {
        await deleteTestUser(testUserId);
      } catch (error) {
        console.error('Error deleting test user:', error);
      }
    }
    if (server) server.close(); // Matikan server
  });

  // Test GET /api/user
  describe('GET /api/user', () => {
    it('should return all users with status 200', async () => {
      const response = await request(app).get('/api/user');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      if (response.body.length > 0) {
        const user = response.body[0];
        expect(user).toHaveProperty('_id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
      }
    });
  });

  // Test GET /api/user/:id
  describe('GET /api/user/:id', () => {
    it('should return a user by ID with status 200', async () => {
      const response = await request(app).get(`/api/user/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', testUserId.toString());
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
    });

    it('should return 404 if user is not found', async () => {
      const invalidUserId = '000000000000000000000000'; // Non-existent user ID
      const response = await request(app).get(`/api/user/${invalidUserId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should return 400 for invalid user ID format', async () => {
      const invalidUserId = 'invalid-id';
      const response = await request(app).get(`/api/user/${invalidUserId}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid User ID');
    });
  });

  // Test PUT /api/user/:id
  describe('PUT /api/user/:id', () => {
    it('should update a user and return the updated user', async () => {
      const updatedData = { name: 'Updated Name', email: 'updated@example.com' };

      const response = await request(app)
        .put(`/api/user/${testUserId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Update Successfully!');
      expect(response.body.user).toHaveProperty('name', updatedData.name);
      expect(response.body.user).toHaveProperty('email', updatedData.email);
    });

    it('should return 404 if user is not found', async () => {
      const invalidUserId = '000000000000000000000000';
      const updatedData = { name: 'Updated Name', email: 'updated@example.com' };

      const response = await request(app)
        .put(`/api/user/${invalidUserId}`)
        .send(updatedData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should return 400 for invalid user ID format', async () => {
      const invalidUserId = 'invalid-id';
      const updatedData = { name: 'Updated Name', email: 'updated@example.com' };

      const response = await request(app)
        .put(`/api/user/${invalidUserId}`)
        .send(updatedData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid User ID');
    });
  });

  // Test GET /api/user/:id/links
  describe('GET /api/user/:id/links', () => {
    it('should return links for a valid user ID', async () => {
      const response = await request(app).get(`/api/user/${testUserId}/links`);
    
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('links');
      expect(response.body.links).toBeInstanceOf(Array);
    
      // Hapus pemeriksaan user jika tidak relevan
      if (response.body.user) {
        expect(response.body.user).toHaveProperty('_id', testUserId.toString());
      }
    });
    

    it('should return 404 if user is not found', async () => {
      const invalidUserId = '000000000000000000000000';

      const response = await request(app).get(`/api/user/${invalidUserId}/links`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 400 for invalid user ID format', async () => {
      const invalidUserId = 'invalid-id';

      const response = await request(app).get(`/api/user/${invalidUserId}/links`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid User ID');
    });
  });

  // Test DELETE /api/user/:id
  describe('DELETE /api/user/:id', () => {
    it('should delete a user and return success message', async () => {
      const response = await request(app).delete(`/api/user/${testUserId}`);
    
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Delete Successfully!');
      expect(response.body.user).toHaveProperty('_id', testUserId.toString());
    });

    it('should return 404 if user is not found', async () => {
      const invalidUserId = '000000000000000000000000';

      const response = await request(app).delete(`/api/user/${invalidUserId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should return 400 for invalid user ID format', async () => {
      const invalidUserId = 'invalid-id';

      const response = await request(app).delete(`/api/user/${invalidUserId}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid User ID');
    });
  });
});
