import jwt from 'jsonwebtoken';

export interface GeoMapTokenPayload {
  userId: string;
  email: string;
  verified: boolean;
  permissions: string[];
  name?: string;
}

export function generateGeoMapToken(user: any): string {
  const payload: GeoMapTokenPayload = {
    userId: user.id,
    email: user.email,
    verified: user.emailVerified || false,
    permissions: user.emailVerified ? ['read', 'edit'] : ['read'], // Only verified users can edit
    name: user.name
  };
  
  return jwt.sign(payload, process.env.GEOMAP_JWT_SECRET!, {
    expiresIn: '24h',
    issuer: 'onboarding-app',
    audience: 'geomap-app'
  });
}

export function verifyGeoMapToken(token: string): GeoMapTokenPayload | null {
  try {
    return jwt.verify(token, process.env.GEOMAP_JWT_SECRET!, {
      issuer: 'onboarding-app',
      audience: 'geomap-app'
    }) as GeoMapTokenPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
