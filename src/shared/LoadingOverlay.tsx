import { BRAND_NAME } from './constants'

export default function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "color-mix(in srgb, var(--white) 92%, transparent)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "28px",
          fontWeight: 700,
          color: "var(--color-accent)",
          marginBottom: "20px",
        }}
      >
        <img src="/Logo.png" alt="" style={{ height: 28, width: 'auto', marginRight: 8 }} />{BRAND_NAME.replace(' ', '')}
      </div>
      <div
        className="spinner-border"
        style={{ color: "var(--color-accent)", width: "40px", height: "40px" }}
        role="status"
      />
      {message && (
        <div
          style={{
            marginTop: "16px",
            fontSize: "14px",
            color: "var(--color-text-secondary)",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
