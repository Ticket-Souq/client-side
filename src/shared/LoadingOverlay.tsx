export default function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(255, 255, 255, 0.92)",
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
        TicketSouq
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
