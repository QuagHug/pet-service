const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ServiceProvider } = require('./Models/serviceProviderSchema');
const { User } = require('./Models/userSchema');
require('dotenv').config();

// First, let's get the valid category values from your schema
const getValidCategories = async () => {
  try {
    // This will get the enum values from your schema
    const schema = ServiceProvider.schema.path('category');
    if (schema && schema.enumValues) {
      return schema.enumValues;
    }
    // Fallback values if we can't get them from the schema
    return ['Veterinary', 'Grooming', 'Training', 'Boarding', 'Walking', 'Daycare', 'Pet Supplies'];
  } catch (error) {
    console.error('Error getting valid categories:', error);
    return ['Veterinary', 'Grooming', 'Training', 'Boarding', 'Walking', 'Daycare', 'Pet Supplies'];
  }
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get valid categories
    const validCategories = await getValidCategories();
    console.log('Valid categories:', validCategories);

    // Sample service providers - will be updated with valid categories
    const sampleServices = [
      {
        name: 'Happy Paws Veterinary Clinic',
        category: validCategories[0], // Use first valid category (likely veterinary)
        description: 'Full-service veterinary clinic offering preventative care, surgery, and emergency services.',
        rating: 4.8,
        reviews: [],
        affiliateLink: 'https://happypaws.com/affiliate', // Added required field
        location: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        contact: {
          phone: '212-555-1234',
          email: 'info@happypaws.com',
          website: 'www.happypaws.com'
        },
        hours: {
          monday: '9:00 AM - 6:00 PM',
          tuesday: '9:00 AM - 6:00 PM',
          wednesday: '9:00 AM - 6:00 PM',
          thursday: '9:00 AM - 6:00 PM',
          friday: '9:00 AM - 6:00 PM',
          saturday: '10:00 AM - 4:00 PM',
          sunday: 'Closed'
        },
        images: [
          'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
        ],
        services: [
          'Wellness Exams',
          'Vaccinations',
          'Surgery',
          'Dental Care',
          'Emergency Services'
        ],
        pricing: {
          consultationFee: 50,
          vaccinationFee: 25,
          surgeryStartingFee: 200
        }
      },
      {
        name: 'Fluffy Grooming Salon',
        category: validCategories.length > 1 ? validCategories[1] : validCategories[0], // Use second valid category if available
        description: 'Professional pet grooming services including bathing, haircuts, nail trimming, and more.',
        rating: 4.6,
        reviews: [],
        affiliateLink: 'https://fluffygrooming.com/affiliate', // Added required field
        location: {
          address: '456 Park Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10022',
          coordinates: {
            latitude: 40.7580,
            longitude: -73.9855
          }
        },
        contact: {
          phone: '212-555-5678',
          email: 'appointments@fluffygrooming.com',
          website: 'www.fluffygrooming.com'
        },
        hours: {
          monday: '10:00 AM - 7:00 PM',
          tuesday: '10:00 AM - 7:00 PM',
          wednesday: '10:00 AM - 7:00 PM',
          thursday: '10:00 AM - 7:00 PM',
          friday: '10:00 AM - 7:00 PM',
          saturday: '9:00 AM - 5:00 PM',
          sunday: '11:00 AM - 4:00 PM'
        },
        images: [
          'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
        ],
        services: [
          'Bath & Brush',
          'Full Grooming',
          'Nail Trimming',
          'Ear Cleaning',
          'Teeth Brushing'
        ],
        pricing: {
          bathSmallDog: 30,
          bathLargeDog: 45,
          fullGroomingSmallDog: 60,
          fullGroomingLargeDog: 85
        }
      },
      {
        name: 'Paws & Train',
        category: validCategories.length > 2 ? validCategories[2] : validCategories[0], // Use third valid category if available
        description: 'Expert dog training services for all ages and breeds. Specializing in obedience, behavior modification, and puppy training.',
        rating: 4.9,
        reviews: [],
        affiliateLink: 'https://pawsandtrain.com/affiliate', // Added required field
        location: {
          address: '789 Broadway',
          city: 'New York',
          state: 'NY',
          zipCode: '10003',
          coordinates: {
            latitude: 40.7352,
            longitude: -73.9911
          }
        },
        contact: {
          phone: '212-555-9012',
          email: 'training@pawsandtrain.com',
          website: 'www.pawsandtrain.com'
        },
        hours: {
          monday: '8:00 AM - 8:00 PM',
          tuesday: '8:00 AM - 8:00 PM',
          wednesday: '8:00 AM - 8:00 PM',
          thursday: '8:00 AM - 8:00 PM',
          friday: '8:00 AM - 8:00 PM',
          saturday: '9:00 AM - 6:00 PM',
          sunday: '9:00 AM - 6:00 PM'
        },
        images: [
          'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
        ],
        services: [
          'Private Training',
          'Group Classes',
          'Puppy Socialization',
          'Behavior Modification',
          'Board & Train'
        ],
        pricing: {
          singleSession: 85,
          packageOfSix: 450,
          groupClass: 200,
          boardAndTrain: 1500
        }
      }
    ];

    // Sample users - with pets as strings instead of objects
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123', // Will be hashed before saving
        favoriteServices: [],
        clickHistory: [],
        membership: {
          status: 'active',
          type: 'premium',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        },
        paymentHistory: [
          {
            orderId: 'MOMO' + Date.now(),
            amount: '50000',
            status: 'completed',
            paymentMethod: 'MoMo',
            transactionId: 'TRANS' + Date.now(),
            message: 'Payment successful',
            createdAt: new Date()
          }
        ],
        pets: ['Max', 'Buddy'] // Changed to array of strings
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123', // Will be hashed before saving
        favoriteServices: [],
        clickHistory: [],
        membership: {
          status: 'inactive',
          type: 'free',
          startDate: null,
          endDate: null
        },
        paymentHistory: [],
        pets: ['Whiskers'] // Changed to array of strings
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123', // Will be hashed before saving
        favoriteServices: [],
        clickHistory: [],
        membership: {
          status: 'active',
          type: 'premium',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        },
        paymentHistory: [],
        pets: [] // Empty array
      }
    ];

    // Clear existing data
    await ServiceProvider.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Hash passwords for users
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return { ...user, password: hashedPassword };
      })
    );
    console.log('Passwords hashed');

    // Insert sample service providers
    const services = await ServiceProvider.insertMany(sampleServices);
    console.log(`${services.length} services added to the database`);

    // Add some service IDs to user favorites
    hashedUsers[0].favoriteServices = [services[0]._id, services[1]._id];
    hashedUsers[1].favoriteServices = [services[2]._id];

    // Insert sample users
    const users = await User.insertMany(hashedUsers);
    console.log(`${users.length} users added to the database`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    console.log('Database seeding completed successfully!');
    
    // Log credentials for easy testing
    console.log('\nTest User Credentials:');
    console.log('------------------------');
    console.log('Regular User with Premium:');
    console.log('Email: john@example.com');
    console.log('Password: password123');
    console.log('\nRegular User without Premium:');
    console.log('Email: jane@example.com');
    console.log('Password: password123');
    console.log('\nAdmin User:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase(); 