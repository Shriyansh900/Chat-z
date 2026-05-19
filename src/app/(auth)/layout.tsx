import Carousel from '@/components/auth/ui/CarouselItem';
import { Toaster } from 'react-hot-toast';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#6b6680] to-[#4e4a63] p-4 sm:p-6">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#2a2640',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#a78bfa', secondary: '#fff' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#fff' } },
        }}
      />
      <div className="w-full max-w-6xl bg-[#1f1c2e] rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left — carousel, hidden on mobile */}
          <div className="hidden md:flex flex-col justify-center p-8">
            <div className="flex justify-center">
              <Carousel
                baseWidth={500}
                cardHeight={320}
                autoplay={true}
                autoplayDelay={3000}
                pauseOnHover={false}
                loop={true}
                round={false}
              />
            </div>
          </div>

          {/* Right — form, full width on mobile */}
          <div className="p-6 sm:p-10 text-white">{children}</div>
        </div>
      </div>
    </div>
  );
}
