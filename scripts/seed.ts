import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventbook.com' },
    update: {},
    create: {
      email: 'admin@eventbook.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create validator user
  const validatorPassword = await bcrypt.hash('validator123', 10);
  const validator = await prisma.user.upsert({
    where: { email: 'validator@eventbook.com' },
    update: {},
    create: {
      email: 'validator@eventbook.com',
      name: 'Validator User',
      password: validatorPassword,
      role: 'VALIDATOR',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@eventbook.com' },
    update: {},
    create: {
      email: 'user@eventbook.com',
      name: 'Regular User',
      password: userPassword,
      role: 'USER',
    },
  });

  // Create sample events
  const concertEvent = await prisma.event.upsert({
    where: { slug: 'summer-concert-2024' },
    update: {
      startAt: new Date('2025-10-15T19:00:00Z'),
      endAt: new Date('2025-10-15T23:00:00Z'),
    },
    create: {
      slug: 'summer-concert-2024',
      title: 'Summer Concert 2024',
      description: 'An amazing outdoor concert featuring top artists from around the world. Join us for an unforgettable evening of music under the stars.',
      category: 'Concert',
      startAt: new Date('2025-10-15T19:00:00Z'),
      endAt: new Date('2025-10-15T23:00:00Z'),
      venueName: 'Central Park Amphitheater',
      venueCity: 'New York',
      coverImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      currencyCode: 'USD',
      priceCents: 7500, // $75.00
      capacity: 5000,
      published: true,
      organizerId: admin.id,
    },
  });

  const conferenceEvent = await prisma.event.upsert({
    where: { slug: 'tech-conference-2024' },
    update: {
      startAt: new Date('2025-11-20T09:00:00Z'),
      endAt: new Date('2025-11-22T17:00:00Z'),
    },
    create: {
      slug: 'tech-conference-2024',
      title: 'Tech Conference 2024',
      description: 'The premier technology conference bringing together industry leaders, innovators, and developers. Network, learn, and discover the future of tech.',
      category: 'Conference',
      startAt: new Date('2025-11-20T09:00:00Z'),
      endAt: new Date('2025-11-22T17:00:00Z'),
      venueName: 'Convention Center',
      venueCity: 'San Francisco',
      coverImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
      currencyCode: 'USD',
      priceCents: 25000, // $250.00
      capacity: 1000,
      published: true,
      organizerId: admin.id,
    },
  });

  const workshopEvent = await prisma.event.upsert({
    where: { slug: 'cooking-workshop' },
    update: {
      startAt: new Date('2025-10-10T14:00:00Z'),
      endAt: new Date('2025-10-10T18:00:00Z'),
    },
    create: {
      slug: 'cooking-workshop',
      title: 'Italian Cooking Workshop',
      description: 'Learn to cook authentic Italian dishes from scratch. Hands-on experience with professional chefs in a state-of-the-art kitchen.',
      category: 'Workshop',
      startAt: new Date('2025-10-10T14:00:00Z'),
      endAt: new Date('2025-10-10T18:00:00Z'),
      venueName: 'Culinary Institute',
      venueCity: 'Chicago',
      coverImageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
      currencyCode: 'USD',
      priceCents: 12000, // $120.00
      capacity: 20,
      published: true,
      organizerId: admin.id,
    },
  });

  // Create seating sections for the workshop (seated event)
  const workshopSeats = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const rowLabel = String.fromCharCode(65 + row); // A, B, C, D
      const colLabel = (col + 1).toString();
      const label = `${rowLabel}${colLabel}`;
      
      workshopSeats.push({
        eventId: workshopEvent.id,
        label,
        section: 'Main Kitchen',
        priceCents: 0, // Same as base price
        status: 'AVAILABLE' as const
      });
    }
  }

  // Clear existing seats for this event first
  await prisma.seat.deleteMany({
    where: { eventId: workshopEvent.id }
  });
  
  await prisma.seat.createMany({
    data: workshopSeats
  });

  // Create some events happening soon
  const upcomingConcert = await prisma.event.upsert({
    where: { slug: 'upcoming-concert' },
    update: {
      startAt: new Date('2025-12-15T20:00:00Z'),
      endAt: new Date('2025-12-15T23:00:00Z'),
    },
    create: {
      slug: 'upcoming-concert',
      title: 'Rock Night 2025',
      description: 'An electrifying night of rock music featuring local bands and special guests. Get ready to rock!',
      category: 'Concert',
      startAt: new Date('2025-12-15T20:00:00Z'),
      endAt: new Date('2025-12-15T23:00:00Z'),
      venueName: 'The Rock Arena',
      venueCity: 'Los Angeles',
      coverImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      currencyCode: 'USD',
      priceCents: 4500, // $45.00
      capacity: 800,
      published: true,
      organizerId: admin.id,
    },
  });

  const upcomingWorkshop = await prisma.event.upsert({
    where: { slug: 'upcoming-workshop' },
    update: {
      startAt: new Date('2025-12-20T09:00:00Z'),
      endAt: new Date('2025-12-21T17:00:00Z'),
    },
    create: {
      slug: 'upcoming-workshop',
      title: 'Web Development Bootcamp',
      description: 'Learn modern web development in this intensive 2-day bootcamp. HTML, CSS, JavaScript, and React.',
      category: 'Workshop',
      startAt: new Date('2025-12-20T09:00:00Z'),
      endAt: new Date('2025-12-21T17:00:00Z'),
      venueName: 'Tech Hub',
      venueCity: 'Austin',
      coverImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
      currencyCode: 'USD',
      priceCents: 18000, // $180.00
      capacity: 30,
      published: true,
      organizerId: admin.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Sample Users:');
  console.log(`Admin: admin@eventbook.com / admin123`);
  console.log(`Validator: validator@eventbook.com / validator123`);
  console.log(`User: user@eventbook.com / user123`);
  console.log('\n🎫 Sample Events:');
  console.log(`- ${concertEvent.title} (${concertEvent.category})`);
  console.log(`- ${conferenceEvent.title} (${conferenceEvent.category})`);
  console.log(`- ${workshopEvent.title} (${workshopEvent.category})`);
  console.log(`- ${upcomingConcert.title} (${upcomingConcert.category})`);
  console.log(`- ${upcomingWorkshop.title} (${upcomingWorkshop.category})`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
