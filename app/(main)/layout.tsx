import { Navbar } from '@/components/Navbar';
import { getCurrentUser } from '@/lib/auth/session';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col">
      <Navbar user={user} />
      <main className="flex-1 min-h-0">{children}</main>
    </div>
  );
}
