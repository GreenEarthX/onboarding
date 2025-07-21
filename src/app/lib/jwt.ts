import jwt from 'jsonwebtoken';

export interface GeoMapTokenPayload {
  userId: string;
  email: string;
  verified: boolean;
  permissions: string[];
  name?: string;
  type?: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export function generateGeoMapTokenPair(user: any): TokenPair {
  const payload: GeoMapTokenPayload = {
    userId: user.id,
    email: user.email,
    verified: user.emailVerified || false,
    permissions: user.emailVerified ? ['read', 'edit'] : ['read'],
    name: user.name
  };
  
  const accessToken = jwt.sign(
    { ...payload, type: 'access' }, 
    process.env.GEOMAP_JWT_SECRET!, 
    {
      expiresIn: '1h', // Shorter lifespan for access tokens
      issuer: 'onboarding-app',
      audience: 'geomap-app'
    }
  );

  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' }, 
    process.env.GEOMAP_JWT_SECRET!, 
    {
      expiresIn: '7d', // Longer lifespan for refresh tokens
      issuer: 'onboarding-app',
      audience: 'geomap-app'
    }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: '1h'
  };
}

// Keep the old function for backward compatibility
export function generateGeoMapToken(user: any): string {
  const payload: GeoMapTokenPayload = {
    userId: user.id,
    email: user.email,
    verified: user.emailVerified || false,
    permissions: user.emailVerified ? ['read', 'edit'] : ['read'],
    name: user.name,
    type: 'access'
  };
  
  return jwt.sign(payload, process.env.GEOMAP_JWT_SECRET!, {
    expiresIn: '1h', // Reduced from 24h to 1h
    issuer: 'onboarding-app',
    audience: 'geomap-app'
  });
}

export function verifyGeoMapToken(token: string, expectedType?: 'access' | 'refresh'): GeoMapTokenPayload | null {
  try {
    const payload = jwt.verify(token, process.env.GEOMAP_JWT_SECRET!, {
      issuer: 'onboarding-app',
      audience: 'geomap-app'
    }) as GeoMapTokenPayload;

    if (expectedType && payload.type !== expectedType) {
      throw new Error(`Expected ${expectedType} token, got ${payload.type}`);
    }

    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
