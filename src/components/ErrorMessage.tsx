'use client';

/**
 * =============================================================================
 * ERROR MESSAGE COMPONENT
 * =============================================================================
 * 
 * Displays error messages with an optional retry button.
 * Used throughout the app when saga operations fail.
 * =============================================================================
 */

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
        <div className="error-message">
            <span className="error-icon">❌</span>
            <p>{message}</p>
            {onRetry && (
                <button className="btn btn-secondary btn-sm" onClick={onRetry}>
                    🔄 Retry
                </button>
            )}
        </div>
    );
}
