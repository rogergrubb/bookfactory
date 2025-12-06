import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma, getBookAnalytics } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');
    const range = searchParams.get('range') || '30d';
    const platform = searchParams.get('platform');

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (range) {
      case '7d': startDate.setDate(now.getDate() - 7); break;
      case '30d': startDate.setDate(now.getDate() - 30); break;
      case '90d': startDate.setDate(now.getDate() - 90); break;
      case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
    }

    if (bookId) {
      const analytics = await getBookAnalytics(bookId, userId);
      if (!analytics) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      return NextResponse.json(analytics);
    }

    // Get aggregate analytics for all books
    const books = await prisma.book.findMany({
      where: { userId },
      include: {
        sales: { where: { date: { gte: startDate } }, orderBy: { date: 'desc' } },
        chapters: { select: { wordCount: true } },
      },
    });

    const totalSales = books.reduce((sum, book) => 
      sum + book.sales.reduce((s, sale) => s + sale.quantity, 0), 0);
    const totalRevenue = books.reduce((sum, book) => 
      sum + book.sales.reduce((s, sale) => s + sale.revenue, 0), 0);
    const totalWords = books.reduce((sum, book) => 
      sum + book.chapters.reduce((s, ch) => s + ch.wordCount, 0), 0);

    // Sales by day
    const salesByDay: Record<string, { sales: number; revenue: number }> = {};
    books.forEach(book => {
      book.sales.forEach(sale => {
        const day = sale.date.toISOString().split('T')[0];
        if (!salesByDay[day]) salesByDay[day] = { sales: 0, revenue: 0 };
        salesByDay[day].sales += sale.quantity;
        salesByDay[day].revenue += sale.revenue;
      });
    });

    // Revenue by platform
    const revenueByPlatform: Record<string, number> = {};
    books.forEach(book => {
      book.sales.forEach(sale => {
        if (!revenueByPlatform[sale.platform]) revenueByPlatform[sale.platform] = 0;
        revenueByPlatform[sale.platform] += sale.revenue;
      });
    });

    return NextResponse.json({
      summary: { totalSales, totalRevenue, totalWords, bookCount: books.length },
      salesByDay: Object.entries(salesByDay).map(([date, data]) => ({ date, ...data })).sort((a, b) => a.date.localeCompare(b.date)),
      revenueByPlatform: Object.entries(revenueByPlatform).map(([platform, revenue]) => ({ platform, revenue })),
      books: books.map(book => ({
        id: book.id,
        title: book.title,
        sales: book.sales.reduce((s, sale) => s + sale.quantity, 0),
        revenue: book.sales.reduce((s, sale) => s + sale.revenue, 0),
      })),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
