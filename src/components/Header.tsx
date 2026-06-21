import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MenuIcon, X, Sparkles, LogOut, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const scrollToSupport = (e: React.MouseEvent) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById('faq');
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate('/#faq');
    }
  };

  return (
    <>
      {/* Announcement banner */}
      <div className="block w-full bg-cosmic-deep border-b border-white/10 py-2.5 px-4 text-center fixed top-0 left-0 right-0 z-50 shadow-lg">
        <div className="flex items-center justify-center space-x-2 text-white">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <p className="text-sm font-medium">
            <span className="text-cosmic-gold font-bold">🚧 Website Under Construction</span> — <Link to="/waitlist" className="underline underline-offset-4 hover:text-primary transition-colors decoration-white/30">Join the waitlist</Link>
          </p>
          <Sparkles size={16} className="text-accent animate-pulse" />
        </div>
      </div>
    
      <header className={`fixed left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled 
          ? "glass-strong py-2 top-10 border-b border-border shadow-lg" 
          : "bg-transparent py-4 top-10"
      }`}>
        <div className="container max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center group">
                <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-md" style={{ background: 'linear-gradient(135deg, #D43D51 0%, #9333EA 100%)' }}>
                  <span className="text-primary-foreground font-bold text-lg">s</span>
                </div>
                <span className="ml-3 text-2xl font-semibold text-foreground tracking-wide font-heading">Sync365</span>
              </a>
            </div>
            
            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/about" className="text-sm text-foreground hover:text-primary transition-colors duration-300">About</Link>
              <Link to="/pricing" className="text-sm text-foreground hover:text-primary transition-colors duration-300">Pricing</Link>
              <a 
                href="/#faq" 
                onClick={scrollToSupport}
                className="text-sm text-foreground hover:text-primary transition-colors duration-300"
              >
                Support
              </a>
            </nav>
            
            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="px-4 py-2 text-sm text-foreground/80 hover:text-primary transition-colors duration-300">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/account/subscription" className="px-4 py-2 text-sm text-foreground/80 hover:text-primary transition-colors duration-300">
                    Billing
                  </Link>
                  <Link to="/dashboard" className="px-4 py-2 text-sm text-foreground/80 hover:text-primary transition-colors duration-300 flex items-center gap-1">
                    <LayoutDashboard size={14} />
                    Account
                  </Link>
                  <span className="text-sm text-foreground flex items-center gap-1">
                    <User size={14} />
                    {profile?.username || 'Guest'}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="text-foreground/80 hover:text-primary"
                  >
                    <LogOut size={16} className="mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-lilacMid/50 text-sm font-medium">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/waitlist">
                    <Button className="btn-cosmic text-primary-foreground text-sm px-6 py-2.5 h-auto rounded-full font-medium relative z-10">
                      <span className="relative z-10">Join Waitlist</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass border-t border-border/50 py-6 px-4 mt-2">
            <nav className="flex flex-col space-y-4">
              <Link to="/about" className="text-base text-foreground hover:text-primary py-2 transition-colors">About</Link>
              <Link to="/pricing" className="text-base text-foreground hover:text-primary py-2 transition-colors">Pricing</Link>
              <a 
                href="/#faq" 
                onClick={(e) => {
                  scrollToSupport(e);
                  setIsMobileMenuOpen(false);
                }}
                className="text-base text-foreground hover:text-primary py-2 transition-colors"
              >
                Support
              </a>
              
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="text-base text-foreground/80 hover:text-primary py-2 transition-colors">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/account/subscription" className="text-base text-foreground/80 hover:text-primary py-2 transition-colors">
                    Billing
                  </Link>
                  <Link to="/dashboard" className="text-base text-foreground/80 hover:text-primary py-2 transition-colors flex items-center gap-2">
                    <LayoutDashboard size={16} />
                    Account
                  </Link>
                  <div className="text-sm text-foreground/90 py-2 flex items-center gap-1">
                    <User size={14} />
                    {profile?.username || 'Guest'}
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="justify-start text-foreground/80 hover:text-primary"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="text-base text-foreground/80 hover:text-primary py-2 transition-colors">
                    Sign In
                  </Link>
                </>
              )}
              
              <Link to="/waitlist">
                <Button className="btn-cosmic text-primary-foreground w-full mt-2 rounded-full">
                  <span className="relative z-10">Join Waitlist</span>
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
