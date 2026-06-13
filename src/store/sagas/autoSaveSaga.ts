/**
 * =============================================================================
 * AUTO-SAVE SAGA (Debounce)
 * =============================================================================
 * 
 * Demonstrates: debounce
 * 
 * CONCEPT EXPLAINED:
 * 
 * debounce(ms, actionType, workerSaga):
 * - Waits until `ms` milliseconds have passed since the LAST dispatched
 *   action of `actionType`.
 * - If more actions arrive within the window, the timer resets.
 * - Only when the user STOPS dispatching does the worker finally execute.
 * 
 * REAL-WORLD USE CASE:
 * Auto-saving a document as the user types.
 * We don't want to save on every keystroke — that would overwhelm the API.
 * Instead, we wait until the user pauses typing for 1 second, then save.
 * 
 * COMPARISON:
 * - debounce: Waits for silence. "Call me 1s after the user STOPS typing."
 * - throttle: Limits frequency. "Call me at most once every 3s."
 * 
 * Timeline example (debounce 1000ms):
 *   User types: H-e-l-l-o (each 200ms apart)
 *   Time: 0ms  200ms  400ms  600ms  800ms  ... 1800ms → SAVE!
 *   The save happens 1000ms after the last keystroke ("o" at 800ms).
 * =============================================================================
 */

import { debounce, call, put, select } from 'redux-saga/effects';
import { CreateTaskPayload } from '@/types';
import { fakeSaveDraft } from '@/services/api';
import {
    updateDraft,
    saveDraftRequest,
    saveDraftSuccess,
    saveDraftFailure,
} from '@/store/slices/tasksSlice';

// ─────────────────────────────────────────────────────────────────────────────
// WORKER: Handle Auto-Save
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Worker saga that saves the current draft to the API.
 * This is called by the debounce watcher after the user stops typing.
 */
function* handleAutoSave(): Generator {
    console.log('🔄 [AUTO-SAVE SAGA] Debounce triggered — user stopped typing');
    console.log('📌 [AUTO-SAVE SAGA] Saving draft to server...');

    try {
        // Signal that saving has started (shows "Saving..." in UI)
        yield put(saveDraftRequest());

        // Read the current draft from Redux state using select
        const draft = (yield select(
            (state: { tasks: { draftTask: Partial<CreateTaskPayload> | null } }) =>
                state.tasks.draftTask
        )) as Partial<CreateTaskPayload> | null;

        if (!draft) {
            console.log('⚠️ [AUTO-SAVE SAGA] No draft to save');
            yield put(saveDraftFailure());
            return;
        }

        // Call the API to save the draft
        const result = (yield call(fakeSaveDraft, draft)) as { savedAt: string };

        console.log('✅ [AUTO-SAVE SAGA] Draft saved at:', result.savedAt);
        yield put(saveDraftSuccess(result.savedAt));
    } catch (error: unknown) {
        console.warn('❌ [AUTO-SAVE SAGA] Auto-save failed:', error);
        yield put(saveDraftFailure());
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// WATCHER SAGA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Watcher saga using debounce.
 * 
 * TEACHING NOTE:
 * debounce(1000, updateDraft.type, handleAutoSave) works like this:
 * 
 * 1. User types → dispatches updateDraft → timer starts (1000ms)
 * 2. User types again → dispatches updateDraft → timer RESETS to 1000ms
 * 3. User types again → dispatches updateDraft → timer RESETS to 1000ms
 * 4. User stops typing... 1000ms passes...
 * 5. handleAutoSave() runs with the LAST dispatched action
 * 
 * This prevents saving on every keystroke while ensuring
 * the latest content is always saved.
 */
export function* watchAutoSave(): Generator {
    console.log(
        '👀 [AUTO-SAVE SAGA] Watcher started — debouncing updateDraft (1000ms)'
    );

    // Wait 1 second after the last updateDraft action before saving
    yield debounce(1000, updateDraft.type, handleAutoSave);
}
