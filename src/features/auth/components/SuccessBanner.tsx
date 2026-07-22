interface Props {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
}

export default function SuccessBanner({ message, actionLabel, onAction, actionLoading }: Props) {
  return (
    <div className="auth-success-banner">
      <span>{message}</span>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} disabled={actionLoading}>
          {actionLoading ? 'Sending...' : actionLabel}
        </button>
      )}
    </div>
  );
}
