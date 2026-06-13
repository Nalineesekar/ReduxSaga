'use client';

/**
 * =============================================================================
 * LOADING SPINNER COMPONENT
 * =============================================================================
 * 
 * Simple loading indicator shown during async saga operations.
 * =============================================================================
 */

interface LoadingSpinnerProps {
    message?: string;
}

export default function LoadingSpinner({
    message = 'Loading...',
}: LoadingSpinnerProps) {
    return (
        <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{message}</p>
        </div>
    );
}
