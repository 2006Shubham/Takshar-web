import { useState } from 'react';
import { ProfileDropdown } from './ProfileDropDown';
import { href } from 'react-router-dom';

/**
 * --- Dummy Data ---
 * Expected structures:
 * NavItem: { id: string, label: string, href: string, isActive?: boolean }
 * UserProfile: { name: string, avatarUrl: string, notifications: number }
 */
const NAV_ITEMS = [
  { id: 'nav-home', label: 'Home', href: '#', isActive: true },
  { id: 'nav-spark', label: 'Spark', href: '#', isActive: true },
  { id: 'nav-peers', label: 'peers', href: '#', isActive: true },
  { id: 'nav-leaderboards', label: 'Leaderboards', href: '#', isActive: true },
  { id: 'nav-sparktrack', label: 'Spark Track', href: '#', isActive: true }
];

const MOCK_USER = {
  name: 'Aryan',
  avatarUrl: 'https://i.pravatar.cc/150?u=takshar_demo',
  notifications: 3,
};
// ------------------

export const Header = ({ onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-stone-50/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand Logo */}
        <div className="flex shrink-0 items-center">
          <a href="/container" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-sm">
            <span className="text-2xl font-extrabold tracking-tight text-orange-600">
              Takshar
            </span>
          </a>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden flex-1 items-center justify-center px-8 md:flex lg:px-16">
          <div className="group relative w-full max-w-lg">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full rounded-full border-0 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 transition-shadow outline-none"
              placeholder="Search challenges, videos, or peers..."
            />
          </div>
        </div>

        {/* Desktop Navigation & Actions */}
        <div className="hidden md:flex md:items-center md:gap-6">
          <nav className="flex items-center gap-6" aria-label="Global">
            {NAV_ITEMS.map((item) => (
              <a
                onClick={() => onTabChange(item.id)}
                key={item.id}
                // href={item.href}
                className={`text-sm cursor-pointer font-medium transition-colors duration-200 ${item.isActive
                  ? 'text-orange-600'
                  : 'text-gray-600 hover:text-orange-500'
                  }`}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300" aria-hidden="true" />

          {/* User Profile & Notifications */}
          <div className="flex items-center gap-4">
            <button className="relative p-1 text-gray-500 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full">
              <span className="sr-only">View notifications</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {MOCK_USER.notifications > 0 && (
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-orange-600 ring-2 ring-white" />
              )}
            </button>


            <ProfileDropdown />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 transition-colors"
          >
            <span className="sr-only">Open main menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 shadow-lg absolute w-full">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-base font-medium ${item.isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-orange-500'
                  }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};