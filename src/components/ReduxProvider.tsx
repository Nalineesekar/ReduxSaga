'use client';

/**
 * =============================================================================
 * REDUX PROVIDER
 * =============================================================================
 * 
 * TEACHING NOTE:
 * In Next.js App Router, the Redux Provider must be a Client Component
 * because it uses React Context (which requires client-side rendering).
 * 
 * We wrap the entire app with this provider in layout.tsx so every
 * page and component can access the Redux store.
 * 
 * The 'use client' directive at the top tells Next.js this component
 * runs on the client side.
 * =============================================================================
 */

import { Provider } from 'react-redux';
import { store } from '@/store';

interface ReduxProviderProps {
    children: React.ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
    return <Provider store={store}>{children}</Provider>;
}
