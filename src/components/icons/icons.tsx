import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/**
 * Inline stroke icons on a 24px grid. Decorative by default (aria-hidden);
 * any icon-only control supplies its own aria-label on the button.
 */
function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const StarIcon = (p: IconProps) => (
  <Icon {...p} fill="currentColor" stroke="none">
    <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35 6.19 20.4 7.3 13.93 2.6 9.35l6.5-.95L12 2.5z" />
  </Icon>
);

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </Icon>
);

export const BoxIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" />
  </Icon>
);

export const TruckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6.5h11v9H3zM14 10h4l3 3v2.5h-7z" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17.5" cy="18" r="1.8" />
  </Icon>
);

export const WalletIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
    <path d="M2.5 10h19" />
    <circle cx="17.5" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
  </Icon>
);

export const FlaskIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.5 2.5v6L4.4 17.6A2 2 0 006.14 20.5h11.72a2 2 0 001.74-2.9L14.5 8.5v-6M8 2.5h8M7.2 14.5h9.6" />
  </Icon>
);

export const TagIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.6 12.6l-8.2 8.2a2 2 0 01-2.83 0l-6.4-6.4a2 2 0 010-2.82l8.2-8.2a2 2 0 011.42-.59H19a2 2 0 012 2v6.38a2 2 0 01-.4 1.43z" />
    <circle cx="16.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" />
  </Icon>
);

export const CopyIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 6L9 17l-5-5" />
  </Icon>
);

export const HeartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.8 5.6a5.2 5.2 0 00-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 10-7.4 7.4l1.4 1.4L12 21.6l7.4-7.2 1.4-1.4a5.2 5.2 0 000-7.4z" />
  </Icon>
);

export const ExternalIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 3h6v6M21 3l-9 9M19 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h5" />
  </Icon>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Icon>
);

export const WarningIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10.3 3.9L1.8 18.2A2 2 0 003.5 21.2h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9.5v4M12 17.2h.01" />
  </Icon>
);

export const ClockIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </Icon>
);

export const BoltIcon = (p: IconProps) => (
  <Icon {...p} fill="currentColor" stroke="none">
    <path d="M13.5 2L4 13.2h6.2L9.9 22l9.6-11.4h-6.4L13.5 2z" />
  </Icon>
);

export const GridIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
  </Icon>
);

export const ListIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </Icon>
);

export const MoonIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.5 14.3A8.5 8.5 0 019.7 3.5a8.5 8.5 0 1010.8 10.8z" />
  </Icon>
);

export const SunIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8" />
  </Icon>
);

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const BellIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 8.5a6 6 0 10-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5zM13.7 19.5a2 2 0 01-3.4 0" />
  </Icon>
);
