import {
  BoltIcon,
  CheckBadgeIcon,
  DocumentIcon,
  GlobeIcon,
  ShieldCheckIcon,
  FlaskIcon,
} from '@/components/icons/icons';
import type { GuideIcon } from '@/data/guides';

/** Maps the plain string in guide data to an actual icon component. */
export const BadgeIconMap: Record<GuideIcon, typeof FlaskIcon> = {
  document: DocumentIcon,
  flask: FlaskIcon,
  shield: ShieldCheckIcon,
  bolt: BoltIcon,
  badge: CheckBadgeIcon,
  globe: GlobeIcon,
};
