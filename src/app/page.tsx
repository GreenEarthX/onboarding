import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="relative w-48 h-20 mb-8">
        <Image
          src="/gex-logo.png"
          alt="GreenEarthXchange Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Welcome Phrase */}
      <h1 className="text-2xl font-light text-gray-700 mb-12 text-center">
        Welcome to Green Energy Exchange
      </h1>

      {/* Continue Button */}
      <Link
        href="/auth/authenticate"
        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg"
      >
        Continue to platform
      </Link>
    </div>
  );
}