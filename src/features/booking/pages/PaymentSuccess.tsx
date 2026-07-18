import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

interface SuccessState {
  paymentID: string;
  seats: { rowLabel: string; colNumber: number }[];
  event: { title: string };
  total: number;
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: SuccessState };

  return (
    <div className="container py-5 text-center" style={{ maxWidth: "500px" }}>
      <CheckCircle
        size={64}
        style={{ color: "var(--color-accent)" }}
        className="mb-3"
      />
      <h2
        className="fw-bold mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Payment Successful
      </h2>
      <p className="text-secondary-custom mb-1">
        {state?.event?.title ?? "Your tickets"}
      </p>
      <p className="text-secondary-custom mb-1">
        {state?.seats?.map((s) => `${s.rowLabel}${s.colNumber}`).join(", ")}
      </p>
      <p
        className="fw-bold mb-4"
        style={{ color: "var(--color-accent)", fontSize: "18px" }}
      >
        ${state?.total?.toFixed(2)}
      </p>
      <div className="d-flex gap-3 justify-content-center">
        <button
          className="btn btn-accent px-4"
          onClick={() => navigate("/tickets")}
        >
          View My Tickets
        </button>
        <button
          className="btn btn-outline-accent px-4"
          onClick={() => navigate("/events")}
        >
          Browse Events
        </button>
      </div>
    </div>
  );
}