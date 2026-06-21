import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Activity, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-20 relative overflow-hidden bg-muted/40 border-t border-border">
      {/* Subtle glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-primary/5 blur-[100px]"></div>
      
      <div className="container max-w-[1200px] mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Logo and mission */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #D43D51 0%, #9333EA 100%)' }}>
                <span className="text-primary-foreground font-bold text-lg">s</span>
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Sync365</h2>
            </Link>
            <p className="text-foreground text-sm mb-6 leading-relaxed">
              Empowering women with intelligent cycle tracking through modern AI technology. Your body, your rhythm, your sync365.
            </p>
            
            {/* ABN Display - number only */}
            <p className="text-foreground text-xs mb-6 font-mono">
              ABN 37 679 506 551
            </p>
            
            <div className="flex space-x-4">
              <a 
                href="https://www.linkedin.com/company/sync365-app/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground/90 hover:text-primary hover:glow-primary transition-all duration-300"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              {['instagram', 'tiktok'].map((social) => (
                <a 
                  key={social}
                  href="#" 
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground/90 hover:text-primary hover:glow-primary transition-all duration-300"
                >
                  <Activity className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Company */}
          <div className="md:col-span-1">
            <h3 className="text-foreground font-semibold mb-5 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-foreground hover:text-primary transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-foreground hover:text-primary transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/corporate" className="text-foreground hover:text-primary transition-colors text-sm">
                  Partnerships
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-foreground hover:text-primary transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="md:col-span-1">
            <h3 className="text-foreground font-semibold mb-5 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/page/privacy" className="text-foreground hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/page/terms" className="text-foreground hover:text-primary transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/page/security" className="text-foreground hover:text-primary transition-colors text-sm">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/page/cookies" className="text-foreground hover:text-primary transition-colors text-sm">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-foreground hover:text-primary transition-colors text-sm">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Get Started */}
          <div className="md:col-span-1">
            <h3 className="text-foreground font-semibold mb-5 text-sm uppercase tracking-wider">Get Started</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/waitlist" className="text-foreground hover:text-primary transition-colors text-sm">
                  Join Waitlist
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="mb-8 bg-border/30" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p className="text-foreground text-xs">
              © 2025 sync365.app
            </p>
            <span className="hidden md:inline text-foreground">|</span>
            <p className="text-foreground text-xs font-mono">
              ABN 37 679 506 551
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground font-medium">Empowering cycles, everywhere</span>
            <span className="text-primary">✨</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
