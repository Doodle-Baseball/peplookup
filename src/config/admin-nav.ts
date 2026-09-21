import {
  DocumentIcon,
  FlaskIcon,
  GridIcon,
  SearchIcon,
  StarIcon,
  StoreIcon,
} from '@/components/icons/icons';

/** Shared between the desktop sidebar and the mobile slide-in nav so the two never drift apart. */
export const ADMIN_NAV = [
  { label: 'Overview', href: '/admin', icon: GridIcon },
  { label: 'Compounds', href: '/admin/compounds', icon: FlaskIcon },
  { label: 'Vendors', href: '/admin/vendors', icon: StoreIcon },
  { label: 'Reviews', href: '/admin/reviews', icon: StarIcon },
  { label: 'Guides', href: '/admin/guides', icon: DocumentIcon },
  { label: 'SEO', href: '/admin/seo', icon: SearchIcon },
] as const;
