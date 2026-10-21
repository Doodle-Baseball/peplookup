import {
  DocumentIcon,
  FlaskIcon,
  FolderIcon,
  GlobeIcon,
  GridIcon,
  SearchIcon,
  StarIcon,
  StoreIcon,
  TagIcon,
  WalletIcon,
} from '@/components/icons/icons';

/** Shared between the desktop sidebar and the mobile slide-in nav so the two never drift apart. */
export const ADMIN_NAV = [
  { label: 'Overview', href: '/admin', icon: GridIcon },
  { label: 'Compounds', href: '/admin/compounds', icon: FlaskIcon },
  { label: 'Suppliers', href: '/admin/vendors', icon: StoreIcon },
  { label: 'Reviews', href: '/admin/reviews', icon: StarIcon },
  { label: 'Guides', href: '/admin/guides', icon: DocumentIcon },
  { label: 'SEO', href: '/admin/seo', icon: SearchIcon },
  { label: 'Supplier Listing', href: '/admin/vendor-listing', icon: WalletIcon },
  { label: 'Coupon Pages', href: '/admin/coupon-pages', icon: TagIcon },
  { label: 'Chrome Extension', href: '/admin/extension', icon: GlobeIcon },
  { label: 'Dataset', href: '/admin/dataset', icon: FolderIcon },
] as const;
