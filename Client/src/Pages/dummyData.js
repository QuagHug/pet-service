export const categories = [
  {
    name: 'Cat Food',
    imageUrl: 'https://res.cloudinary.com/dmzqckfj4/image/upload/v1706504912/home%20page/zcl6uneww32lxvmywlqr.jpg',
    path: '/cat-food',
  },
  {
    name: 'Cat Toys',
    imageUrl: 'https://res.cloudinary.com/dmzqckfj4/image/upload/v1706504946/home%20page/zitnln1nvxqgik1crepq.jpg',
  },
  {
    name: 'Dog Food',
    imageUrl: 'https://res.cloudinary.com/dmzqckfj4/image/upload/v1706504966/home%20page/m9pfuvaf1ri1wxzvfknz.jpg',
    path: '/dog-food',
  },
  {
    name: 'Dog Toys',
    imageUrl: 'https://res.cloudinary.com/dmzqckfj4/image/upload/v1706504990/home%20page/vrgxavjppnnjx3c7pphw.jpg',
  },
];

// Generate random MongoDB-like IDs
function generateObjectId() {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
  const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
  const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  return timestamp + machineId + processId + counter;
}

export const services = [
  {
    imageUrl: 'https://res.cloudinary.com/dmzqckfj4/image/upload/v1706505011/home%20page/hrokkodxtc3wnctbqmyz.png',
    title: 'Free Same-Day Delivery',
    description: 'Order by 2pm local time to get free delivery on orders $35+ today.',
  },
  {
    imageUrl: 'https://res.cloudinary.com/dmzqckfj4/image/upload/v1706505035/home%20page/kh3aywo5qniy8aew2lsa.png',
    title: '30 Day Return',
    description: '35% off your first order plus 5% off all future orders.',
  },
  {
    imageUrl: 'https://res.cloudinary.com/dmzqckfj4/image/upload/v1706505058/home%20page/midyf6ltwnn0ffv0queq.png',
    title: 'Security payment',
    description: '25% off your online order of $50+. Available at most locations.',
  },
  {
    imageUrl: 'https://res.cloudinary.com/dmzqckfj4/image/upload/v1706505081/home%20page/rlh6seaevj1nr1q0d3se.png',
    title: '24/7 Support',
    description: 'Shop online to get orders over $35 shipped fast and free.',
  },
];

export const brandImages = [
  'https://res.cloudinary.com/dmzqckfj4/image/upload/v1706504731/home%20page/kvep9kdldikmrq948ubu.jpg',
  'https://res.cloudinary.com/dmzqckfj4/image/upload/v1706504787/home%20page/rwpmbmeynibqmrlixpdf.jpg',
  'https://res.cloudinary.com/dmzqckfj4/image/upload/v1706504811/home%20page/tgwnpjfp8nfat96nw3xg.jpg',
  'https://res.cloudinary.com/dmzqckfj4/image/upload/v1706504837/home%20page/fvtk5msccnfr6rktnzud.jpg',
  'https://res.cloudinary.com/dmzqckfj4/image/upload/v1706504863/home%20page/izmg8yauavbqunlhs4hm.jpg',
];

export const dummyServices = [
  {
    _id: generateObjectId(),
    name: "Happy Paws Veterinary Clinic",
    description: "Full-service veterinary clinic offering preventative care, surgery, and emergency services for all pets.",
    category: "Veterinary",
    location: {
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    },
    contactInfo: {
      phone: "212-555-1234",
      email: "info@happypawsvet.com",
      website: "https://www.happypawsvet.com"
    },
    images: ["https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    rating: 4.8,
    reviews: [],
    affiliateLink: "https://www.happypawsvet.com?ref=petservices"
  },
  {
    _id: generateObjectId(),
    name: "Fluffy Grooming Salon",
    description: "Professional pet grooming services including bathing, haircuts, nail trimming, and more.",
    category: "Grooming",
    location: {
      address: "456 Park Avenue",
      city: "New York",
      state: "NY",
      zipCode: "10022",
      coordinates: {
        latitude: 40.7580,
        longitude: -73.9855
      }
    },
    contactInfo: {
      phone: "212-555-5678",
      email: "info@fluffygrooming.com",
      website: "https://www.fluffygrooming.com"
    },
    images: ["https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"],
    rating: 4.5,
    reviews: [],
    affiliateLink: "https://www.fluffygrooming.com?ref=petservices"
  },
  // Add more dummy services here
];
