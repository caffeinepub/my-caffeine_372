interface Props {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  rightContent?: React.ReactNode;
}

const GOLD = "#D4AF37";

export default function ModuleHeader({
  title,
  subtitle,
  icon,
  rightContent,
}: Props) {
  return (
    <div
      className="rounded-xl p-5 text-white mb-6 no-print"
      style={{
        background: "linear-gradient(135deg, #1a4d2e 0%, #0f2d1a 100%)",
        boxShadow: "0 4px 16px rgba(15,45,26,0.25)",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(212,175,55,0.3)",
            }}
          >
            <span style={{ color: GOLD }}>{icon}</span>
          </div>
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-widest mb-0.5"
              style={{ color: "rgba(212,175,55,0.6)" }}
            >
              আপন ফাউন্ডেশন
            </div>
            <h1
              className="text-xl font-bold leading-tight"
              style={{ color: GOLD, fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
      </div>
    </div>
  );
}
