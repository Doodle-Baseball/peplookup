import { permanentRedirect } from 'next/navigation';

/** Editing a vendor's review page was removed at the site owner's request; old links land on Add review. */
export default function AdminEditReviewPage() {
  permanentRedirect('/admin/reviews');
}
