import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to books page - temporary fix for Next.js 15 build issue
  redirect('/books');
}
