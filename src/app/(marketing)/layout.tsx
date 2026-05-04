import LandingNavbar from '@/components/navbar/LandingNavbar';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingNavbar />
      <main>{children}</main>
    </>
  );
}
