import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <Image
                  src="/logo-black.png"
                  alt="VolunteerMap"
                  width={220}
                  height={32}
                  className="h-8 w-auto dark:hidden"
                  priority
                />
                <Image
                  src="/logo-white.png"
                  alt="VolunteerMap"
                  width={220}
                  height={32}
                  className="h-8 w-auto hidden dark:block"
                  priority
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
