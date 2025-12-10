import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Database status check endpoint
// GET /api/db-status - Check database connection and table count

export async function GET(request: NextRequest) {
  try {
    // Test connection by running a simple query
    const userCount = await prisma.user.count();
    const bookCount = await prisma.book.count();
    
    // Get table info
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    return NextResponse.json({
      status: 'connected',
      database: 'PostgreSQL',
      tables: tables.map(t => t.tablename),
      tableCount: tables.length,
      stats: {
        users: userCount,
        books: bookCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database status check failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isConnectionError = errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED');
    
    return NextResponse.json({
      status: 'error',
      error: errorMessage,
      hint: isConnectionError 
        ? 'Check DATABASE_URL environment variable in Vercel Settings > Environment Variables'
        : 'Database may not be initialized. Redeploy to run schema push.',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
