import { permanentRedirect } from 'next/navigation';

/** "Add review" is now the whole Reviews section, at /admin/reviews; old links land there. */
export default function AdminAddReviewPage() {
  permanentRedirect('/admin/reviews');
}
