import request from 'supertest';
import app from '../src/app.js'; 
import mongoose from 'mongoose';
import LinkStats from '../models/linkStats';
import User from '../models/user'; 
import Link from '../models/link';
import server from '../server.js';
const URI = process.env.ATLAS_URI || "";

describe('Link Stats API', () => {
    let linkId;
    let user;

    beforeAll(async () => {
        // Koneksi ke database MongoDB untuk pengujian
        await mongoose.connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout koneksi
            ssl: true,
            tlsAllowInvalidCertificates: true, // Sama seperti di MongoClient
        });
        
        // Buat user dummy jika diperlukan
        const userData = {
            name: 'test',
            email: `testuser${Date.now()}@example.com`,
            password: 'password123', // Pastikan password di-hash sesuai dengan kebutuhan
        };
        user = new User(userData);
        await user.save();
        
        // Buat link dummy untuk pengujian
        const linkData = {
            originalUrl: 'https://example.com',
            shortUrl: 'kocags',
            userId: user._id, // Menghubungkan link dengan user
        };
        const link = new Link(linkData);
        await link.save();
        
        // Simpan ID link ke variabel `linkId`
        linkId = link._id;
    
        // Buat LinkStats dummy untuk pengujian dengan menggunakan ID dari link yang baru dibuat
        const linkStats = [
            {
                linkId: link._id,
                date: new Date(),
                clicks: 5,
            },
            {
                linkId: link._id,
                date: new Date(new Date().setDate(new Date().getDate() - 1)), // 1 hari lalu
                clicks: 10,
            },
        ];
        await LinkStats.insertMany(linkStats);
    });
    

    afterAll(async () => {
        // Hapus data setelah pengujian selesai
        await LinkStats.deleteMany({});
        await mongoose.connection.close();
        if (server) server.close(); // Matikan server
    });

    

    test('GET /api/stats/:linkId - should return aggregated link stats', async () => {
        const response = await request(app).get(`/api/stats/${linkId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('total_clicks');
        expect(response.body).toHaveProperty('daily_clicks');
        expect(response.body).toHaveProperty('weekly_clicks');
        expect(response.body).toHaveProperty('monthly_clicks');

        // Validasi data total clicks
        expect(response.body.total_clicks).toBe(15);

        // Validasi data daily clicks (pastikan ada data di response)
        expect(typeof response.body.daily_clicks).toBe('object');

        // Validasi data weekly clicks
        expect(typeof response.body.weekly_clicks).toBe('object');

        // Validasi data monthly clicks
        expect(typeof response.body.monthly_clicks).toBe('object');
    });

    test('GET /api/stats/:linkId - should return 404 if linkId not found', async () => {
        const invalidLinkId = new mongoose.Types.ObjectId();

        const response = await request(app).get(`/api/stats/${invalidLinkId}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Link not found');
    });
});
