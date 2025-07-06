import OAuthButton from './OAuthButton';

export default function SocialAuthButtons() {
  return (
    <div className="grid grid-cols-1 gap-3">
      <OAuthButton provider="google" />
      <OAuthButton provider="apple" /> {/* Add Apple button */}
      {/*<OAuthButton provider="github" />*/}
    </div>
  );
}