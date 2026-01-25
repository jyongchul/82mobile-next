import { unstable_setRequestLocale } from 'next-intl/server';
import SinglePageHome from '@/components/home/SinglePageHome';

export default function HomePage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  // Enable static rendering
  unstable_setRequestLocale(locale);

  return <SinglePageHome />;
}
