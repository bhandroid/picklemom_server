import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Product } from '../models/Product';

dotenv.config();

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@thepicklemom.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const adminUser = new User({
      email: adminEmail,
      password: adminPassword,
      fullName: 'Admin User',
      isAdmin: true,
    });

    await adminUser.save();
    console.log('👤 Created admin user');

    // Create sample products
    const sampleProducts = [
      {
        name: 'Spicy Mango Pickle',
        description: 'Traditional raw mango pickle with aromatic spices and mustard oil',
        price: 199,
        category: 'Veg Pickles',
        stock: 100,
        featured: true,
        image: 'https://images.pexels.com/photos/8472647/pexels-photo-8472647.jpeg',
      },
      {
        name: 'Chicken Pickle',
        description: 'Spicy and flavorful chicken pickle made with traditional spices',
        price: 299,
        category: 'Non-Veg Pickles',
        stock: 50,
        featured: true,
        image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
      },
      {
        name: 'Mutton Pickle',
        description: 'Rich and aromatic mutton pickle prepared with handpicked spices',
        price: 399,
        category: 'Non-Veg Pickles',
        stock: 40,
        featured: true,
        image: 'https://images.pexels.com/photos/2313686/pexels-photo-2313686.jpeg',
      },
      {
        name: 'Tomato Pickle',
        description: 'Tangy tomato pickle made with fresh tomatoes and traditional spices',
        price: 179,
        category: 'Veg Pickles',
        stock: 80,
        featured: false,
        image: 'https://images.pexels.com/photos/6941012/pexels-photo-6941012.jpeg',
      },
      {
        name: 'Lemon Pickle',
        description: 'Zesty lemon pickle with a perfect blend of spices',
        price: 159,
        category: 'Veg Pickles',
        stock: 90,
        featured: false,
        image: 'https://images.pexels.com/photos/6941080/pexels-photo-6941080.jpeg',
      },
      {
        name: 'Palli Podi',
        description: 'Spicy peanut powder perfect with rice and ghee',
        price: 149,
        category: 'Podulu',
        stock: 60,
        featured: true,
        image: 'https://images.pexels.com/photos/4226896/pexels-photo-4226896.jpeg',
      },
      {
        name: 'Karivepaku Karam',
        description: 'Aromatic curry leaves powder with spices',
        price: 129,
        category: 'Podulu',
        stock: 70,
        featured: false,
        image: 'https://images.pexels.com/photos/4226805/pexels-photo-4226805.jpeg',
      },
      {
        name: 'Arisalu',
        description: 'Traditional sweet rice flour crackers',
        price: 199,
        category: 'Snacks',
        stock: 40,
        featured: true,
        image: 'https://images.pexels.com/photos/4226815/pexels-photo-4226815.jpeg',
      },
      {
        name: 'Janthikalu',
        description: 'Crispy rice flour spirals',
        price: 179,
        category: 'Snacks',
        stock: 50,
        featured: false,
        image: 'https://images.pexels.com/photos/4226824/pexels-photo-4226824.jpeg',
      },
      {
        name: 'Chakralu',
        description: 'Crunchy rice flour rings with sesame',
        price: 169,
        category: 'Snacks',
        stock: 45,
        featured: false,
        image: 'https://images.pexels.com/photos/4226839/pexels-photo-4226839.jpeg',
      },
    ];

    await Product.insertMany(sampleProducts);
    console.log('🥒 Created sample products');

    console.log('🎉 Database seeded successfully!');
    console.log(`📧 Admin email: ${adminEmail}`);
    console.log(`🔑 Admin password: ${adminPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();