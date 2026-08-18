import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { formatPrice } from "../../../shared/format";

interface SuccessState {
  tickets?: { label: string; sectionName: string; price: number }[];
  total?: number;
  eventId?: string;
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: SuccessState };
  const tickets = state?.tickets ?? [];
  const total = state?.total ?? 0;

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
        {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} confirmed
      </p>
      {tickets.length > 0 && (
        <ul className="text-secondary-custom mb-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {tickets.map((t, i) => (
            <li key={i} style={{ fontSize: 14 }}>
              {t.label}
              {t.sectionName ? ` (${t.sectionName})` : ""}
            </li>
          ))}
        </ul>
      )}
      <p
        className="fw-bold mb-4"
        style={{ color: "var(--color-accent)", fontSize: "18px" }}
      >
        {formatPrice(total)}
      </p>
      <div className="d-flex gap-3 justify-content-center flex-wrap">
        <button
          className="btn btn-accent px-4"
          onClick={() => navigate("/customer/tickets")}
        >
          View My Tickets
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
