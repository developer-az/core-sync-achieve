import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-navy-lighter shadow-lg px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">
                CoreSync
              </span>
            </div>

            {/* Navigation links */}
            <div className="hidden md:flex items-center gap-8">
              <a 
                href="#features" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-foreground hover:text-cyan transition-colors cursor-pointer"
              >
                Features
              </a>
              <a 
                href="#features" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-foreground hover:text-cyan transition-colors cursor-pointer"
              >
                How It Works
              </a>
              <a 
                href="#cta" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-foreground hover:text-cyan transition-colors cursor-pointer"
              >
                Pricing
              </a>
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-3">
              {user ? (
                <Button 
                  variant="ghost" 
                  className="hover:text-cyan"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="hidden sm:inline-flex hover:text-cyan"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-cyan to-purple hover:shadow-cyan text-white rounded-full"
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
