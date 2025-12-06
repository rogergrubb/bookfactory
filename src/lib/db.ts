import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ============================================
// USER FUNCTIONS
// ============================================

export async function getOrCreateUser(clerkId: string, email: string, name?: string) {
  return prisma.user.upsert({
    where: { clerkId },
    update: { lastActiveAt: new Date() },
    create: { id: clerkId, clerkId, email, name, plan: 'FREE' },
  });
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId } });
}

export async function updateUser(userId: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({ where: { id: userId }, data });
}

// ============================================
// BOOK FUNCTIONS
// ============================================

export async function getUserBooks(userId: string, options?: {
  status?: string;
  search?: string;
  seriesId?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'updatedAt' | 'title' | 'wordCount' | 'createdAt';
  order?: 'asc' | 'desc';
}) {
  const where: Prisma.BookWhereInput = { userId };
  
  if (options?.status) where.status = options.status as any;
  if (options?.seriesId) where.seriesId = options.seriesId;
  if (options?.search) {
    where.OR = [
      { title: { contains: options.search, mode: 'insensitive' } },
      { description: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: {
        chapters: { select: { id: true, wordCount: true, status: true } },
        series: { select: { id: true, name: true } },
      },
      orderBy: { [options?.orderBy || 'updatedAt']: options?.order || 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.book.count({ where }),
  ]);

  return { books, total, hasMore: (options?.offset || 0) + books.length < total };
}

export async function getBookById(bookId: string, userId: string) {
  return prisma.book.findFirst({
    where: { id: bookId, userId },
    include: {
      chapters: { orderBy: { order: 'asc' } },
      characters: true,
      series: true,
      collaborators: true,
    },
  });
}

export async function createBook(data: {
  userId: string;
  title: string;
  genre: string;
  description?: string;
  template?: string;
  targetWordCount?: number;
}) {
  return prisma.book.create({
    data: {
      userId: data.userId,
      title: data.title,
      genre: data.genre,
      description: data.description,
      status: 'DRAFT',
      wordCount: 0,
      targetWordCount: data.targetWordCount || 80000,
    },
    include: { chapters: true },
  });
}

export async function updateBook(bookId: string, userId: string, data: Prisma.BookUpdateInput) {
  const book = await prisma.book.findFirst({ where: { id: bookId, userId } });
  if (!book) return null;
  return prisma.book.update({ where: { id: bookId }, data, include: { chapters: true } });
}

export async function deleteBook(bookId: string, userId: string) {
  const book = await prisma.book.findFirst({ where: { id: bookId, userId } });
  if (!book) return false;
  await prisma.book.delete({ where: { id: bookId } });
  return true;
}

// ============================================
// CHAPTER FUNCTIONS
// ============================================

export async function getChaptersByBookId(bookId: string, userId: string) {
  const book = await prisma.book.findFirst({ where: { id: bookId, userId } });
  if (!book) return null;
  return prisma.chapter.findMany({ where: { bookId }, orderBy: { order: 'asc' } });
}

export async function getChapterById(chapterId: string, userId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { book: { select: { userId: true } } },
  });
  if (!chapter || chapter.book.userId !== userId) return null;
  return chapter;
}

export async function createChapter(data: {
  bookId: string;
  userId: string;
  title: string;
  content?: string;
}) {
  const book = await prisma.book.findFirst({ where: { id: data.bookId, userId: data.userId } });
  if (!book) return null;

  const lastChapter = await prisma.chapter.findFirst({
    where: { bookId: data.bookId },
    orderBy: { order: 'desc' },
  });

  const chapter = await prisma.chapter.create({
    data: {
      bookId: data.bookId,
      title: data.title,
      content: data.content || '',
      order: (lastChapter?.order || 0) + 1,
      wordCount: data.content ? data.content.split(/\s+/).filter(w => w.length > 0).length : 0,
      status: 'DRAFT',
    },
  });

  await updateBookWordCount(data.bookId);
  return chapter;
}

export async function updateChapter(chapterId: string, userId: string, data: {
  title?: string;
  content?: string;
  status?: 'DRAFT' | 'COMPLETE' | 'REVISION';
  order?: number;
}) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { book: { select: { userId: true, id: true } } },
  });

  if (!chapter || chapter.book.userId !== userId) return null;

  const wordCount = data.content 
    ? data.content.split(/\s+/).filter(w => w.length > 0).length 
    : undefined;

  const updateData: Prisma.ChapterUpdateInput = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.order !== undefined) updateData.order = data.order;
  if (wordCount !== undefined) updateData.wordCount = wordCount;

  const updated = await prisma.chapter.update({
    where: { id: chapterId },
    data: updateData,
  });

  if (wordCount !== undefined) await updateBookWordCount(chapter.book.id);
  return updated;
}

export async function deleteChapter(chapterId: string, userId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { book: { select: { userId: true, id: true } } },
  });

  if (!chapter || chapter.book.userId !== userId) return false;

  await prisma.chapter.delete({ where: { id: chapterId } });
  await updateBookWordCount(chapter.book.id);
  return true;
}

async function updateBookWordCount(bookId: string) {
  const chapters = await prisma.chapter.findMany({
    where: { bookId },
    select: { wordCount: true },
  });
  const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
  await prisma.book.update({ where: { id: bookId }, data: { wordCount: totalWords } });
}

// ============================================
// SERIES FUNCTIONS
// ============================================

export async function getUserSeries(userId: string) {
  return prisma.series.findMany({
    where: { userId },
    include: {
      books: { select: { id: true, title: true, status: true, wordCount: true, seriesOrder: true } },
      characters: true,
      settings: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createSeries(data: { userId: string; name: string; description?: string; genre: string }) {
  return prisma.series.create({ data: { ...data, status: 'ONGOING' } });
}

// ============================================
// COLLABORATOR FUNCTIONS
// ============================================

export async function getCollaborators(bookId: string, userId: string) {
  const book = await prisma.book.findFirst({ where: { id: bookId, userId } });
  if (!book) return null;
  return prisma.collaborator.findMany({ where: { bookId } });
}

export async function inviteCollaborator(data: {
  bookId: string;
  email: string;
  role: 'BETA_READER' | 'EDITOR' | 'CO_AUTHOR';
  permissions: string[];
}) {
  return prisma.collaborator.create({ data: { ...data, status: 'PENDING' } });
}

// ============================================
// ANALYTICS FUNCTIONS
// ============================================

export async function getBookAnalytics(bookId: string, userId: string) {
  const book = await prisma.book.findFirst({
    where: { id: bookId, userId },
    include: {
      chapters: { select: { id: true, wordCount: true, status: true, updatedAt: true } },
      sales: { orderBy: { date: 'desc' }, take: 90 },
    },
  });

  if (!book) return null;

  return {
    book,
    stats: {
      wordCount: book.wordCount,
      chapterCount: book.chapters.length,
      completedChapters: book.chapters.filter(ch => ch.status === 'COMPLETE').length,
      totalSales: book.sales.reduce((sum, s) => sum + s.quantity, 0),
      totalRevenue: book.sales.reduce((sum, s) => sum + s.revenue, 0),
    },
    salesHistory: book.sales,
  };
}

export async function getUserFinancials(userId: string, options?: { startDate?: Date; endDate?: Date }) {
  const dateFilter: Prisma.DateTimeFilter = {};
  if (options?.startDate) dateFilter.gte = options.startDate;
  if (options?.endDate) dateFilter.lte = options.endDate;

  const where = { userId, ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}) };

  const [royalties, expenses] = await Promise.all([
    prisma.royalty.findMany({ where, orderBy: { date: 'desc' } }),
    prisma.expense.findMany({ where, orderBy: { date: 'desc' } }),
  ]);

  const totalRoyalties = royalties.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return { royalties, expenses, summary: { totalRoyalties, totalExpenses, netProfit: totalRoyalties - totalExpenses } };
}

// ============================================
// AI USAGE TRACKING
// ============================================

export async function logAIUsage(data: {
  userId: string;
  type: string;
  inputTokens: number;
  outputTokens: number;
  bookId?: string;
}) {
  await prisma.aIUsage.create({ data });
  await prisma.user.update({
    where: { id: data.userId },
    data: { aiCreditsUsed: { increment: 1 } },
  });
}

export async function getAIUsage(userId: string, options?: { startDate?: Date; endDate?: Date }) {
  const dateFilter: Prisma.DateTimeFilter = {};
  if (options?.startDate) dateFilter.gte = options.startDate;
  if (options?.endDate) dateFilter.lte = options.endDate;

  const where = { userId, ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}) };
  const usage = await prisma.aIUsage.findMany({ where, orderBy: { createdAt: 'desc' } });

  return {
    usage,
    total: usage.length,
    totalInputTokens: usage.reduce((sum, u) => sum + u.inputTokens, 0),
    totalOutputTokens: usage.reduce((sum, u) => sum + u.outputTokens, 0),
  };
}

export default prisma;
