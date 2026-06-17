import type { ReactNode } from "react";
import logo from "../../assets/beta1.png";
import loginImage from "../../assets/loginImage.jpeg";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#010C06" }}>
      {/* Mobile Layout */}
      <div
        className="flex flex-col min-h-screen lg:hidden"
        style={{
          background:
            "linear-gradient(170deg, #4a8a1a 0%, #1a3a0e 20%, #050f05 50%, #010C06 100%)",
        }}
      >
        <nav className="flex items-center justify-between px-6 pt-12 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 cursor-pointer">
              <div className="w-9 rounded-sm flex items-center justify-center overflow-hidden">
                <img
                  src={logo}
                  alt="Betamind Logo"
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button className="text-white/40 text-sm font-medium hover:text-white transition-colors">
              Terms
            </button>
            <button className="text-white/40 text-sm font-medium hover:text-white transition-colors">
              Help
            </button>
          </div>
        </nav>

        <div className="px-6 pt-10 pb-8">
          <h1 className="text-white text-2xl font-bold leading-tight mb-2">
            {title}
          </h1>
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>

        <div className="px-6 flex flex-col gap-3">{children}</div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl mx-auto flex lg:flex-row lg:rounded-2xl overflow-hidden">
          <div className="lg:w-[50%]">
            <div
              className="w-full h-full rounded-lb-2xl overflow-hidden relative"
              style={{ minHeight: "520px" }}
            >
              <img
                src={loginImage}
                alt="Atmosphere"
                className="w-full h-full object-cover absolute inset-0"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-linear-to-t from-black/90 to-transparent">
                <h2 className="text-white text-2xl font-bold leading-tight mb-1">
                  Enter the Atmosphere.
                </h2>
                <p className="text-gray-300 text-sm">
                  Join an ecosystem where knowledge meets ambition.
                </p>
              </div>
            </div>
          </div>

          <div
            className="flex-1 flex flex-col justify-center px-12 py-12"
            style={{
              background:
                "linear-gradient(160deg, #1a3a1a 0%, #2d4a1a 30%, #010C06 100%)",
            }}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-1 cursor-pointer">
                <div className="w-6 h-6 rounded-sm flex items-center justify-center overflow-hidden">
                  <img
                    src={logo}
                    alt="Betamind Logo"
                    className="w-full object-cover"
                  />
                </div>
              </div>
              <div className="flex items-center gap-5">
                <button className="text-gray-400 text-xs hover:text-white transition-colors">
                  Terms
                </button>
                <button className="text-gray-400 text-xs hover:text-white transition-colors">
                  Help
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-white text-2xl font-bold leading-tight mb-1">
                {title}
              </h1>
              <p className="text-gray-400 text-sm">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
