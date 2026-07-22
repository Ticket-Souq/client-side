interface Props {
  eyebrow: string;
  title: string;
  description?: string;
}

export default function AuthCardHeader({ eyebrow, title, description }: Props) {
  return (
    <div className="auth-card-header">
      <a href="/" className="auth-logo">
        <span className="dot" />
        <span className="auth-logo-text">TICKET SOUQ</span>
      </a>
      <p className="auth-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
