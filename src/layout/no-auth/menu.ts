export type SubmenuItem = {
  label: string;
  href: string;
};

export type HeaderItem = {
  label: string;
  href: string;
  submenu?: SubmenuItem[];
};

export type Link = {
  label: string;
  href: string;
};

export type FooterLinkType = {
  section: string;
  links: Link[];
};

/* =========================
   HEADER NAVIGATION
========================= */
export const HeaderData: HeaderItem[] = [
  { label: 'Home', href: '/#home' },
  { label: 'Solutions', href: '/#solutions' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Product', href: '/#product' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Contact', href: '/#contact' },
];

/* =========================
   FOOTER NAVIGATION (SEAL TRUST VERSION)
========================= */
export const FooterLinkData: FooterLinkType[] = [
  {
    section: 'Product',
    links: [
      { label: 'Certificate Generator', href: '/#product' },
      { label: 'QR Verification', href: '/#product' },
      { label: 'Digital Signature', href: '/#product' },
      { label: 'Representative Binding', href: '/#product' },
    ],
  },
  {
    section: 'System',
    links: [
      { label: 'Verification Status', href: '/#status' },
      { label: 'Security Layer', href: '/#security' },
      { label: 'API Access', href: '/#api' },
      { label: 'Audit Logs', href: '/#audit' },
      { label: 'System Health', href: '/#status' },
    ],
  },
];
