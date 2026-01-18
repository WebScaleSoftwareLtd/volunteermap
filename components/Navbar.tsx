'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import type { User } from '@/lib/db/schema';
import { BookmarkIcon, CogIcon, GlobeIcon } from '@/components/ui';

interface NavbarProps {
  user: Pick<User, 'id' | 'username' | 'avatarUrl'> | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      // Ensure UI updates even if fetch fails.
      window.location.assign('/');
    }
  }

  return (
    <nav className="relative z-50 bg-white shadow-sm border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
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
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/')
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800/60'
                }`}
              >
                Home
              </Link>
              {user && (
                <Link
                  href="/opportunities/new"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/opportunities/new')
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800/60'
                  }`}
                >
                  Post Opportunity
                </Link>
              )}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <Menu as="div" className="relative">
                <MenuButton className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 focus:outline-none">
                  <Image
                    src={user.avatarUrl || '/default-pfp.png'}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full mr-2"
                  />
                  <span className="hidden sm:inline">{user.username}</span>
                  <svg
                    className="ml-1 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </MenuButton>
                <MenuItems className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-900 dark:ring-gray-800">
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        href={`/users/${user.username}`}
                        className={`block px-4 py-2 text-sm ${
                          active ? 'bg-gray-100 dark:bg-gray-800' : ''
                        } text-gray-700 dark:text-gray-200`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Image
                            src={user.avatarUrl || '/default-pfp.png'}
                            alt=""
                            width={16}
                            height={16}
                            className="h-4 w-4 rounded-full"
                          />
                          My Profile
                        </span>
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        href="/user/bookmarks"
                        className={`block px-4 py-2 text-sm ${
                          active ? 'bg-gray-100 dark:bg-gray-800' : ''
                        } text-gray-700 dark:text-gray-200`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <BookmarkIcon className="h-4 w-4" />
                          Bookmarks
                        </span>
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        href="/user/settings"
                        className={`block px-4 py-2 text-sm ${
                          active ? 'bg-gray-100 dark:bg-gray-800' : ''
                        } text-gray-700 dark:text-gray-200`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <CogIcon className="h-4 w-4" />
                          Settings
                        </span>
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        href="/user/domains"
                        className={`block px-4 py-2 text-sm ${
                          active ? 'bg-gray-100 dark:bg-gray-800' : ''
                        } text-gray-700 dark:text-gray-200`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <GlobeIcon className="h-4 w-4" />
                          Domains
                        </span>
                      </Link>
                    )}
                  </MenuItem>
                  <div className="border-t border-gray-100 my-1 dark:border-gray-800" />
                  <MenuItem>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          active ? 'bg-gray-100 dark:bg-gray-800' : ''
                        } text-gray-700 dark:text-gray-200`}
                      >
                        Sign out
                      </button>
                    )}
                  </MenuItem>
                </MenuItems>
              </Menu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block px-4 py-2 text-base font-medium ${
                isActive('/')
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800/60'
              }`}
            >
              Home
            </Link>
            {user && (
              <Link
                href="/opportunities/new"
                className={`block px-4 py-2 text-base font-medium ${
                  isActive('/opportunities/new')
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800/60'
                }`}
              >
                Post Opportunity
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-800">
            {user ? (
              <>
                <div className="px-4 py-2">
                  <p className="text-base font-medium text-gray-800 dark:text-gray-100">{user.username}</p>
                </div>
                <div className="space-y-1">
                  <Link
                    href={`/users/${user.username}`}
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800/60"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/user/bookmarks"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800/60"
                  >
                    Bookmarks
                  </Link>
                  <Link
                    href="/user/settings"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800/60"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/user/domains"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800/60"
                  >
                    Domains
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-800/60"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-1 px-4">
                <Link
                  href="/auth/login"
                  className="block py-2 text-base font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="block py-2 text-base font-medium text-blue-600 hover:text-blue-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
