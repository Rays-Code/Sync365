import { QrCode, Smartphone } from "lucide-react";

/**
 * Centralised QR-code widget for the app download.
 * To swap in a real QR image, replace the placeholder below with:
 *   <img src="/app-qr-code.png" alt="Scan to download sync365" className="w-full h-full object-contain" />
 */

interface AppQrCodeProps {
  /** visual size variant */
  size?: "sm" | "md";
  /** show the helper text beside the code */
  showLabel?: boolean;
}

const AppQrCode = ({ size = "md", showLabel = true }: AppQrCodeProps) => {
  const dim = size === "sm" ? "w-28 h-28" : "w-40 h-40";
  const iconSize = size === "sm" ? "w-12 h-12" : "w-16 h-16";

  return (
    <div className="flex items-center gap-4">
      {/* QR placeholder – replace inner content with <img> when ready */}
      <div
        className={`${dim} rounded-2xl border-2 border-dashed border-primary flex flex-col items-center justify-center gap-2 bg-primary/10 backdrop-blur-sm flex-shrink-0`}
      >
        <QrCode className={`${iconSize} text-primary`} />
        <span className="text-[10px] text-foreground/80 font-semibold">Coming soon</span>
      </div>

      {showLabel && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-foreground text-sm font-semibold">
            <Smartphone className="w-4 h-4 text-primary" />
            Scan to download
          </div>
          <p className="text-xs text-foreground/70 max-w-[160px]">
            Install sync365 and sign in — your plan syncs automatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default AppQrCode;
