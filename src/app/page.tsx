import LandingNavbar from '@/components/landing/LandingNavbar';
import Hero from '@/components/landing/Hero';
import Security from '@/components/landing/Security';
import Features from '@/components/landing/Features';
import ChatPreview from '@/components/landing/ChatPreview';
import WhyUs from '@/components/landing/WhyUs';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import LandingAuthRedirect from '@/components/landing/LandingAuthRedirect';

export default function RootPage() {
  return (
    <div className="min-h-screen bg-[#060d14] text-white">
      {/* Silently redirects authenticated users to /chat */}
      <LandingAuthRedirect />
      <LandingNavbar />
      <main>
        <Hero />
        <Security />
        <Features />
        <ChatPreview />
        <WhyUs />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
