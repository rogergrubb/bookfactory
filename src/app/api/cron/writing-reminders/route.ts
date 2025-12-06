import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Skip if email service not configured
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ message: 'Email service not configured, skipping reminders' });
  }

  try {
    const { prisma } = await import('@/lib/db');
    const { sendEmail, writingReminderEmail } = await import('@/lib/email');
    
    // Find users who haven't written in 3+ days but have active books
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const users = await prisma.user.findMany({
      where: {
        books: {
          some: {
            status: { in: ['DRAFT', 'WRITING'] },
            updatedAt: { lt: threeDaysAgo },
          },
        },
      },
      include: {
        books: {
          where: { status: { in: ['DRAFT', 'WRITING'] } },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
      take: 100,
    });

    let sentCount = 0;
    for (const user of users) {
      if (!user.email || !user.books[0]) continue;

      const book = user.books[0];
      const emailContent = writingReminderEmail({
        userName: user.name || 'Writer',
        bookTitle: book.title,
        wordGoal: book.targetWordCount,
        currentWords: book.wordCount,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/write/${book.id}`,
      });

      try {
        await sendEmail({ to: user.email, ...emailContent });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send reminder to ${user.email}:`, error);
      }
    }

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (error) {
    console.error('Writing reminders cron error:', error);
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
}
