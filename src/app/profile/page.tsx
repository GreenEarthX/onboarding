import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/nextAuth";
import SigninWithGoogle from "@/app/_components/SigninWithGoogle";
import Signout from "@/app/_components/Signout";

const Profile = async () => {
  const session = await getServerSession(authOptions);
  const twoFactorEnabled = session?.user?.twoFactorEnabled || false;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      {session ? (
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-sm w-full text-center animate-fadeIn">
          <div className="flex justify-center mb-4">
            <Image
              className="rounded-full shadow-md"
              src={session.user?.image || "/default-avatar.png"}
              alt="User Avatar"
              width={100}
              height={100}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Welcome, {session.user?.name}!
          </h1>
          <p className="text-gray-500 text-sm mb-4">{session.user?.email}</p>
          <Signout />
          <div className="mt-4">
            {!twoFactorEnabled && (
              <form action="/api/profile/2fa/enable" method="POST">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Enable 2FA
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl p-8 animate-fadeIn">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sign in to continue</h2>
          <SigninWithGoogle />
        </div>
      )}
    </div>
  );
};

export default Profile;
