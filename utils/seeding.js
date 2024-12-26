const mongoose = require('mongoose');
const { Link, Stats } = require('../models'); // Adjust the path as necessary

const seedDatabase = async () => {
    await mongoose.connect('mongodb://localhost:27017/shortener', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const link = new Link({
        url: 'https://example.com',
        shortCode: 'exmpl',
        createdAt: new Date(),
    });

    await link.save();

    const stats = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        stats.push({
            link: link._id,
            date,
            clicks: Math.floor(Math.random() * 100),
        });
    }

    await Stats.insertMany(stats);

    console.log('Database seeded!');
    mongoose.connection.close();
};

seedDatabase().catch((err) => {
    console.error(err);
    mongoose.connection.close();
});