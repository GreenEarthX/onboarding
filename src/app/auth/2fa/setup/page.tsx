'use client';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import speakeasy from 'speakeasy';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TwoFactorSetup() {
  const { data: session } = useSession();
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (session?.user.email) {
      const generatedSecret = speakeasy.generateSecret({ name: `GEX:${session.user.email}` });
      setSecret(generatedSecret.base32);
      if (generatedSecret.otpauth_url) {
        QRCode.toDataURL(generatedSecret.otpauth_url, (err, data_url) => {
          if (!err) setQrCode(data_url);
        });
      }
    }
  }, [session]);

  const handleEnable2FA = async () => {
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });

    if (isValid) {
      await fetch('/api/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      });
      router.push('/profile');
    } else {
      alert('Invalid token');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Setup Two-Factor Authentication</h1>
      <div className="flex justify-center mb-4">{qrCode && <img src={qrCode} alt="QR Code" />}</div>
      <input
        type="text"
        value={token}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
        className="w-full px-4 py-2 rounded border mb-4"
        placeholder="Enter 6-digit code"
      />
      <button
        onClick={handleEnable2FA}
        className="w-full py-2 bg-gradient-to-r from-[#0072BC] to-[#00B140] text-white rounded"
      >
        Enable 2FA
      </button>
    </div>
  );
}