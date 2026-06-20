import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const hasBgOverride = className && (className.includes("bg-") || className.includes("bg-["));
  return (
    <div
      {...rest}
      className={cn(
        hasBgOverride ? "" : "glass",
        "rounded-2xl p-5 transition-all hover:border-white/15",
        className
      )}
    >
      {children}
    </div>
  );
}

export function GradientCard({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const hasBgOverride = className && (className.includes("bg-") || className.includes("bg-["));
  return (
    <div {...rest} className={cn(hasBgOverride ? "" : "gradient-border", "rounded-2xl p-5", className)}>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, icon: Icon, accent }: { title: string; subtitle?: string; icon?: React.ComponentType<{ className?: string }>; accent?: string }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-white border border-slate-200 shadow-sm overflow-hidden p-0.5", accent)}>
        <img
          src="/Gyaansetu AI logo.png"
          alt="GyaanSetu AI"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="min-w-0">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-[#0b1530]">{title}</h1>
        {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
