import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadImage, uploadManuscript, extractManuscriptContent } from '@/lib/upload';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'cover' or 'manuscript'
    const bookId = formData.get('bookId') as string | null;
    const extractContent = formData.get('extract') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (type === 'cover') {
      const result = await uploadImage(buffer, file.name, file.type, {
        maxWidth: 1600,
        maxHeight: 2560,
        quality: 90,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      if (bookId) {
        await prisma.book.update({
          where: { id: bookId, userId },
          data: { coverUrl: result.url },
        });
      }

      return NextResponse.json({ url: result.url, filename: result.filename, metadata: result.metadata });
    }

    if (type === 'manuscript') {
      const uploadResult = await uploadManuscript(buffer, file.name, file.type);

      if (!uploadResult.success) {
        return NextResponse.json({ error: uploadResult.error }, { status: 400 });
      }

      let content = null;
      if (extractContent) {
        content = await extractManuscriptContent(buffer, file.name, file.type);

        if (bookId && content.chapters.length > 0) {
          const book = await prisma.book.findFirst({ where: { id: bookId, userId } });
          
          if (book) {
            await prisma.chapter.deleteMany({ where: { bookId } });
            await prisma.chapter.createMany({
              data: content.chapters.map((ch, index) => ({
                bookId,
                title: ch.title,
                content: ch.content,
                order: index + 1,
                wordCount: ch.content.split(/\s+/).filter(w => w.length > 0).length,
                status: 'DRAFT',
              })),
            });

            const totalWords = content.chapters.reduce(
              (sum, ch) => sum + ch.content.split(/\s+/).filter(w => w.length > 0).length, 0
            );

            await prisma.book.update({
              where: { id: bookId },
              data: {
                wordCount: totalWords,
                ...(content.title && !book.title ? { title: content.title } : {}),
              },
            });
          }
        }
      }

      return NextResponse.json({ url: uploadResult.url, filename: uploadResult.filename, content });
    }

    return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
