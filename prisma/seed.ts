import { PrismaClient, Plan, BookStatus, ChapterStatus, SeriesStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@bookfactory.ai' },
    update: {},
    create: {
      clerkId: 'demo_clerk_id',
      email: 'demo@bookfactory.ai',
      name: 'Demo Author',
      plan: Plan.PROFESSIONAL,
      bio: 'A passionate writer exploring the realms of science fiction and fantasy.',
      wordCountGoal: 1000,
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create a series
  const series = await prisma.series.create({
    data: {
      userId: demoUser.id,
      name: 'The Horizon Chronicles',
      description: 'An epic space opera spanning three generations of explorers.',
      genre: 'Science Fiction',
      status: SeriesStatus.ONGOING,
    },
  });

  console.log('✅ Created series:', series.name);

  // Create books
  const book1 = await prisma.book.create({
    data: {
      userId: demoUser.id,
      seriesId: series.id,
      seriesOrder: 1,
      title: 'The Last Horizon',
      subtitle: 'Book One of The Horizon Chronicles',
      description: 'When humanity\'s last exploration vessel discovers an ancient alien artifact at the edge of known space, Captain Elena Vance must lead her crew into the unknown.',
      genre: 'Science Fiction',
      template: 'three-act',
      status: BookStatus.WRITING,
      wordCount: 45000,
      targetWordCount: 90000,
    },
  });

  const book2 = await prisma.book.create({
    data: {
      userId: demoUser.id,
      title: 'Midnight Secrets',
      description: 'A cozy mystery set in a charming coastal town where nothing is quite as it seems.',
      genre: 'Mystery',
      template: 'three-act',
      status: BookStatus.DRAFT,
      wordCount: 12000,
      targetWordCount: 70000,
    },
  });

  console.log('✅ Created books:', book1.title, book2.title);

  // Create chapters for book1
  const chapters = [
    { title: 'The Signal', content: '<p>The alert klaxon shattered the quiet hum of the Horizon\'s bridge...</p>', wordCount: 3500 },
    { title: 'Into the Unknown', content: '<p>Elena stared at the coordinates on her display, her heart racing...</p>', wordCount: 4200 },
    { title: 'First Contact', content: '<p>The artifact hung in the void like a frozen tear from a dying star...</p>', wordCount: 3800 },
    { title: 'Revelations', content: '<p>Dr. Chen\'s hands trembled as she translated the alien script...</p>', wordCount: 4100 },
    { title: 'The Decision', content: '<p>The crew gathered in the mess hall, tension thick in the recycled air...</p>', wordCount: 3900 },
  ];

  for (let i = 0; i < chapters.length; i++) {
    await prisma.chapter.create({
      data: {
        bookId: book1.id,
        title: chapters[i].title,
        content: chapters[i].content,
        wordCount: chapters[i].wordCount,
        order: i + 1,
        status: i < 3 ? ChapterStatus.COMPLETE : ChapterStatus.DRAFT,
      },
    });
  }

  console.log('✅ Created chapters for:', book1.title);

  // Create characters for the series
  const characters = [
    { name: 'Captain Elena Vance', role: 'protagonist', description: 'Commander of the Horizon expedition', traits: ['brave', 'strategic', 'haunted'] },
    { name: 'Dr. Marcus Chen', role: 'supporting', description: 'Chief science officer and xenobiologist', traits: ['brilliant', 'curious', 'reckless'] },
    { name: 'AI Unit Seven', role: 'supporting', description: 'Ship AI with emerging consciousness', traits: ['logical', 'evolving', 'loyal'] },
  ];

  for (const char of characters) {
    await prisma.seriesCharacter.create({
      data: {
        seriesId: series.id,
        name: char.name,
        role: char.role,
        description: char.description,
        traits: char.traits,
        appearsIn: [book1.id],
      },
    });
  }

  console.log('✅ Created series characters');

  // Create settings for the series
  const settings = [
    { name: 'The Kepler Boundary', type: 'location', description: 'The edge of known space where ships vanish' },
    { name: 'Horizon Ship', type: 'technology', description: 'Advanced exploration vessel with quantum drive' },
    { name: 'The Collective', type: 'organization', description: 'Alien civilization beyond the boundary' },
  ];

  for (const setting of settings) {
    await prisma.seriesSetting.create({
      data: {
        seriesId: series.id,
        name: setting.name,
        type: setting.type,
        description: setting.description,
        usedIn: [book1.id],
      },
    });
  }

  console.log('✅ Created series settings');

  // Create some sample sales data
  const platforms = ['Amazon', 'Apple Books', 'Kobo', 'Google Play'];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    for (const platform of platforms) {
      const quantity = Math.floor(Math.random() * 10) + 1;
      const price = 4.99;
      const royaltyRate = platform === 'Amazon' ? 0.7 : 0.65;

      await prisma.sale.create({
        data: {
          bookId: book1.id,
          date,
          platform,
          quantity,
          revenue: quantity * price,
          royalty: quantity * price * royaltyRate,
          currency: 'USD',
          country: 'US',
        },
      });
    }
  }

  console.log('✅ Created sample sales data');

  // Create AI usage records
  for (let i = 0; i < 10; i++) {
    await prisma.aIUsage.create({
      data: {
        userId: demoUser.id,
        type: ['continue', 'improve', 'dialogue', 'description', 'brainstorm'][Math.floor(Math.random() * 5)],
        inputTokens: Math.floor(Math.random() * 500) + 100,
        outputTokens: Math.floor(Math.random() * 1000) + 200,
        bookId: book1.id,
      },
    });
  }

  console.log('✅ Created AI usage records');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
