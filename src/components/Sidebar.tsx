import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/projects', label: 'Projects' },
    { href: '/news', label: 'News' },
    { href: '/departments', label: 'Departments' },
    { href: '/events', label: 'Events' },
    { href: '/media', label: 'Media' },
    { href: '/contact-us', label: 'Contact' },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-lg transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!open}
      >
        <button
          className="absolute top-4 right-4 text-gray-700 cursor-pointer"
          aria-label="Close menu"
          onClick={onClose}
        >
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <nav className="mt-16 flex flex-col space-y-6 px-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`text-lg font-semibold transition-colors duration-200 ${
                pathname === href ? 'text-green-600' : 'text-gray-900'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
