import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthCard({ children, footer }: Props) {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div
            className="p-4"
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "12px",
              border: "1px solid var(--color-border)",
              boxShadow: "0 6px 16px -4px rgba(0,0,0,0.06)",
            }}
          >
            {children}
            {footer && (
              <>
                <hr style={{ borderColor: "var(--color-border)", margin: "16px 0" }} />
                {footer}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
