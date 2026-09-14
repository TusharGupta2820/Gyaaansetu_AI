import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const hasBgOverride = className && (className.includes("bg-") || className.includes("bg-["));
  return (
    <div
      {...rest}
      className={cn(
        hasBgOverride
          ? ""
          : "bg-white dark:bg-[#0b1530] border border-sky-200/80 dark:border-blue-500/20 text-slate-900 dark:text-white shadow-xs dark:shadow-lg backdrop-blur-xl",
        "rounded-2xl p-5 transition-all hover:border-sky-300 dark:hover:border-blue-500/40",
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
    <div
      {...rest}
      className={cn(
        hasBgOverride
          ? ""
          : "bg-white dark:bg-[#0b1530] border border-sky-300/70 dark:border-blue-500/30 text-slate-900 dark:text-white shadow-xs dark:shadow-lg",
        "rounded-2xl p-5 transition-all",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, icon: Icon, accent }: { title: string; subtitle?: string; icon?: React.ComponentType<{ className?: string }>; accent?: string }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-white dark:bg-[#0b1530] border border-sky-200 dark:border-blue-500/30 shadow-xs p-2.5 text-sky-600 dark:text-[#3b82f6]", accent)}>
        {Icon ? (
          <Icon className="h-6.5 w-6.5" />
        ) : (
          <img
            src="/Gyaansetu AI logo.png"
            alt="GyaanSetu AI"
            className="h-full w-full object-contain p-0.5"
          />
        )}
      </div>
      <div className="min-w-0">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
