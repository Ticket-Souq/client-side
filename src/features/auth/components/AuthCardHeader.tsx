import { BRAND_NAME } from '../../../shared/constants'

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
}

export default function AuthCardHeader({ eyebrow, title, description }: Props) {
  return (
    <div className="auth-card-header">
      <a href="/" className="auth-logo">
        <img src="/Logo.png" alt="" style={{ height: 28, width: 'auto' }} />
        <span className="auth-logo-text">{BRAND_NAME.toUpperCase()}</span>
      </a>
      <p className="auth-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
