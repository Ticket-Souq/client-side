interface Props {
  title: string;
  subtitle: string;
}

export default function HeroBanner({ title, subtitle }: Props) {
  return (
    <div
      className="py-5 text-white"
      style={{
        background: "linear-gradient(135deg, var(--color-accent), var(--color-hero-blue))",
      }}
    >
      <div className="container">
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "32px" }}>
          {title}
        </h1>
        <p className="mb-0" style={{ color: "rgba(255,255,255,0.75)", fontSize: "15px" }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
