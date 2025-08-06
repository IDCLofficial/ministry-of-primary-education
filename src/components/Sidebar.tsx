import Link from 'next/link';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
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
          <Link href="/" className="text-lg font-semibold text-gray-900" onClick={onClose}>Home</Link>
          <Link href="/about" className="text-lg font-semibold text-gray-900" onClick={onClose}>About</Link>
          <Link href="/projects" className="text-lg font-semibold text-gray-900" onClick={onClose}>Projects</Link>
          <Link href="/events" className="text-lg font-semibold text-gray-900" onClick={onClose}>Events</Link>
          <Link href="/media" className="text-lg font-semibold text-gray-900" onClick={onClose}>Media</Link>
          <Link href="/news" className="text-lg font-semibold text-gray-900" onClick={onClose}>News</Link>
          <Link href="/contact-us" className="text-lg font-semibold text-gray-900" onClick={onClose}>Contact</Link>
        </nav>
      </aside>
    </>
  );
} 