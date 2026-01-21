'use client';

import Link from 'next/link';
import { colors, spacing, typography, Typography } from '@/design-system';
import { EmojiAccent } from '@/components/ui/EmojiAccents';

export default function Footer() {
  const footerLinks = {
    product: [
      { label: 'Play Quiz', href: '/play' },
      { label: 'Create Quiz', href: '/create' },
      { label: 'Leaderboard', href: '/leaderboard' },
    ],
    community: [
      { label: 'Discord', href: '#' },
      { label: 'Twitter', href: '#' },
      { label: 'GitHub', href: '#' },
    ],
    resources: [
      { label: 'Documentation', href: '#' },
      { label: 'Tokenomics', href: '#' },
      { label: 'Whitepaper', href: '#' },
    ],
  };

  return (
    <footer className="bg-white border-t-4 border-black py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Typography variant="h3" className="font-black uppercase text-black flex items-center gap-1">
              <EmojiAccent name="brandFace" size={32} className="text-red-500" />HOOT
            </Typography>
            <Typography variant="body-sm" className="text-gray-500 font-medium max-w-xs leading-relaxed">
              The premier Web3 infrastructure for decentralized trivia. Competitive, instant, verified.
            </Typography>
            <div className="flex flex-col gap-2 mt-4">
              {footerLinks.community.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-black uppercase font-black text-[10px] opacity-40 hover:opacity-100 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <Typography variant="body" className="font-black uppercase tracking-widest text-[10px] mb-8 block opacity-40">
              01. Evolution
            </Typography>
            <div className="flex flex-col gap-4">
              {footerLinks.product.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-black uppercase font-black text-sm hover:translate-x-1 transition-transform"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources Links */}
          <div>
            <Typography variant="body" className="font-black uppercase tracking-widest text-[10px] mb-8 block opacity-40">
              02. Protocol
            </Typography>
            <div className="flex flex-col gap-4">
              {footerLinks.resources.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-black uppercase font-black text-sm hover:translate-x-1 transition-transform"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Custom Visual */}
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-12 border-t-2 border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-30">
            © {new Date().getFullYear()} HOOT.XYZ — ALL RIGHTS RESERVED
          </Typography>
          <div className="flex gap-8">
             <Link href="#" className="font-black uppercase text-[10px] opacity-40 hover:opacity-100">Terms</Link>
             <Link href="#" className="font-black uppercase text-[10px] opacity-40 hover:opacity-100">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}