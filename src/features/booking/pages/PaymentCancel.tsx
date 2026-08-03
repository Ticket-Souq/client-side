import { useLocation, useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

interface CancelState {
  seats: unknown[];
  eventId: string;
}

export default function PaymentCancel() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: CancelState };

  return (
    <div className="container py-5 text-center" style={{ maxWidth: "500px" }}>
      <XCircle size={64} style={{ color: "var(--danger)" }} className="mb-3" />
      <h2
        className="fw-bold mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Payment Cancelled
      </h2>
      <p className="text-secondary-custom mb-4">
        Your payment was not processed. No charges have been made.
      </p>
      <div className="d-flex gap-3 justify-content-center">
        <button
          className="btn btn-accent px-4"
          onClick={() => navigate("/customer/booking/checkout", { state })}
        >
          Try Again
        </button>
        <button
          className="btn btn-outline-accent px-4"
          onClick={() => navigate("/customer/events")}
        >
          Browse Events
        </button>
      </div>
    </div>
  );
}