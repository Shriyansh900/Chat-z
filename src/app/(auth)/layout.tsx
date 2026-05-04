// =======================
// 📁 app/(auth)/layout.tsx
// =======================

import Carousel from '@/components/auth/ui/CarouselItem';
import { webpImages } from '@/utils/LocalImages';
import { FaLessThanEqual } from 'react-icons/fa6';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6b6680] to-[#4e4a63] p-6">
      <div className="  w-full max-w-6xl bg-[#1f1c2e] rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Section */}
        <div className="relative  p-8 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            {/* <h1 className="text-white text-2xl font-bold">Chat-z</h1> */}
            {/* <button className="text-sm text-white bg-white/20 px-4 py-1 rounded-full">
              Back to website →
            </button> */}
          </div>

          {/* <img
            src={webpImages.auth_bg?.src}
            alt="bg"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          /> */}

          <div
            className="flex justify-center"
            style={{ height: 'auto', position: 'relative' }}
          >
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

        {/* Right Section */}
        <div className="p-10 text-white">{children}</div>
      </div>
    </div>
  );
}
