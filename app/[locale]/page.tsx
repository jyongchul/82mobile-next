import { unstable_setRequestLocale } from 'next-intl/server';
import Hero from '@/components/home/Hero';
import ProductPreview from '@/components/home/ProductPreview';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import FaqPreview from '@/components/home/FaqPreview';

export default function HomePage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  // Enable static rendering
  unstable_setRequestLocale(locale);

  return (
    <>
      <Hero />
      <ProductPreview />
      <WhyChooseUs />
      <FaqPreview />
    </>
  );
}
