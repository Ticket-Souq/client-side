import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { v4 as uuid } from "uuid";
import { createPaymentIntent } from "../../payment/services/paymentService";
import { mockEvents } from "../../events/data/mockEvents";
import type { SeatObject } from "../../venues/components/SeatPicker";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "pk_test_xxxxxxxxx",
);

interface LocationState {
  seats: SeatObject[];
  eventId: string;
}

const unitPrice = 50;

function CheckoutForm({ seats, event, total }: { seats: SeatObject[]; event: typeof mockEvents[number]; total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      const payment = await createPaymentIntent({
        reservationID: uuid(),
        customerID: uuid(),
        eventID: uuid(),
        amount: total,
        currency: "USD",
      });

      const submitResult = await elements.submit();
      if (submitResult.error) {
        setError(submitResult.error.message ?? "Payment validation failed");
        setLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          clientSecret: payment.clientSecret,
          redirect: "if_required",
          confirmParams: {
            return_url: `${window.location.origin}/customer/booking/success`,
          },
        });

      if (confirmError) {
        setError(confirmError.message ?? "Payment failed");
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        navigate("/customer/booking/success", {
          state: { paymentID: payment.paymentID, seats, event, total },
        });
      } else {
        navigate("/customer/booking/cancel", { state: { seats, eventId: event.id } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="container py-5">
        <div className="row justify-content-center g-4">
          {/* Order Summary */}
          <div className="col-lg-5">
            <div
              className="p-4 shadow-card"
              style={{
                backgroundColor: "var(--color-surface)",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
              }}
            >
              <h5
                className="fw-bold mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {event.title}
              </h5>
              <p className="mb-1 text-secondary-custom" style={{ fontSize: "13px" }}>
                {event.dateTime} · {event.venueName}
              </p>
              <hr />
              <p className="fw-semibold mb-2" style={{ fontSize: "13px" }}>
                Seats ({seats.length})
              </p>
              <div
                className="mb-3"
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                }}
              >
                {seats.map((s) => `${s.rowLabel}${s.colNumber}`).join(", ")}
              </div>
              <div
                className="d-flex justify-content-between fw-bold"
                style={{ fontSize: "15px" }}
              >
                <span>Total</span>
                <span style={{ color: "var(--color-accent)" }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="col-lg-5">
            <div
              className="p-4 shadow-card"
              style={{
                backgroundColor: "var(--color-surface)",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
              }}
            >
              <h5
                className="fw-bold mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Payment
              </h5>
              <PaymentElement />
              {error && (
                <div
                  className="alert alert-danger py-2 mt-3"
                  style={{ fontSize: "13px" }}
                >
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-accent w-100 mt-3 py-2 fw-semibold"
                disabled={!stripe || loading}
                style={{ fontSize: "15px" }}
              >
                {loading ? "Processing…" : `Pay $${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState };
  const event = mockEvents.find((e) => e.id === state?.eventId);
  const seats = state?.seats ?? [];
  const total = seats.length * unitPrice;

  if (!event || seats.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2>No reservation data found</h2>
        <button
          className="btn btn-accent mt-3"
          onClick={() => navigate("/customer/events")}
        >
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "payment",
        amount: Math.round(total * 100),
        currency: "usd",
      }}
    >
      <CheckoutForm seats={seats} event={event} total={total} />
    </Elements>
  );
}