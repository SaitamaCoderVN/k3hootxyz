'use client';

import Link from 'next/link';
import { FaDiscord, FaTwitter, FaGithub } from 'react-icons/fa';
import { colors, spacing, typography, Typography } from '@/design-system';

export default function Footer() {
  const footerLinks = {
    product: [
      { label: 'Play Quiz', href: '/play' },
      { label: 'Create Quiz', href: '/create' },
      { label: 'Leaderboard', href: '/leaderboard' },
    ],
    community: [
      { label: 'Discord', href: '#', icon: <FaDiscord /> },
      { label: 'Twitter', href: '#', icon: <FaTwitter /> },
      { label: 'GitHub', href: '#', icon: <FaGithub /> },
    ],
    resources: [
      { label: 'Documentation', href: '#' },
      { label: 'Tokenomics', href: '#' },
      { label: 'Whitepaper', href: '#' },
    ],
  };

  return (
    <footer 
      style={{ 
        backgroundColor: colors.background.secondary,
        borderTop: `1px solid ${colors.semantic.border}`,
        paddingTop: spacing[16],
        paddingBottom: spacing[8],
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: spacing[12], paddingBottom: spacing[16] }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: spacing[8] }}>
          {/* Brand */}
          <div className="lg:col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            <Typography variant="h3" gradient="orange-purple">
              K3HOOT
            </Typography>
            <Typography variant="body-sm" color={`${colors.primary.purple[300]}cc`}>
              The ultimate Web3 quiz platform on Solana. Play, Learn, and Earn.
            </Typography>
            <div className="flex" style={{ gap: spacing[4] }}>
              {footerLinks.community.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    color: colors.primary.purple[400],
                    fontSize: '1.5rem',
                    transition: 'all 200ms',
                  }}
                  className="hover:text-purple-200"
                  aria-label={link.label}
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <Typography variant="body" style={{ fontWeight: 600, marginBottom: spacing[4], color: colors.primary.purple[200] }}>
              Product
            </Typography>
            <div className="flex flex-col" style={{ gap: spacing[3] }}>
              {footerLinks.product.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    color: `${colors.primary.purple[300]}99`,
                    fontSize: typography.fontSize.sm[0],
                    transition: 'color 200ms',
                  }}
                  className="hover:text-purple-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources Links */}
          <div>
            <Typography variant="body" style={{ fontWeight: 600, marginBottom: spacing[4], color: colors.primary.purple[200] }}>
              Resources
            </Typography>
            <div className="flex flex-col" style={{ gap: spacing[3] }}>
              {footerLinks.resources.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    color: `${colors.primary.purple[300]}99`,
                    fontSize: typography.fontSize.sm[0],
                    transition: 'color 200ms',
                  }}
                  className="hover:text-purple-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <Typography variant="body" style={{ fontWeight: 600, marginBottom: spacing[4], color: colors.primary.purple[200] }}>
              Legal
            </Typography>
            <div className="flex flex-col" style={{ gap: spacing[3] }}>
              <Link key="terms" href="#" style={{ color: `${colors.primary.purple[300]}99`, fontSize: typography.fontSize.sm[0] }} className="hover:text-purple-200">Terms</Link>
              <Link key="privacy" href="#" style={{ color: `${colors.primary.purple[300]}99`, fontSize: typography.fontSize.sm[0] }} className="hover:text-purple-200">Privacy</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          style={{ 
            marginTop: spacing[12],
            paddingTop: spacing[8],
            borderTop: `1px solid ${colors.semantic.border}`,
            textAlign: 'center',
          }}
        >
          <Typography variant="body-sm" color={`${colors.primary.purple[300]}66`}>
            © {new Date().getFullYear()} K3HOOT.XYZ. Built on Solana.
          </Typography>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-0 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>
    </footer>
  );
}