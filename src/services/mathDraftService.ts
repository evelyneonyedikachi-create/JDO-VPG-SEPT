/**
 * mathDraftService.ts
 *
 * Isolated draft storage keyed strictly by stable taskId.
 * Ensures no draft or answer state can leak between different math tasks.
 */

const DRAFT_STORAGE_KEY = 'jd_math_task_drafts_v1';

export interface MathTaskDraft {
  taskId: string;
  typedAnswer?: string;
  typedRemainder?: string;
  extraValues?: Record<string, string>;
  updatedAt: number;
}

export function getTaskDraft(taskId: string): MathTaskDraft | null {
  if (!taskId) return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw);
    const draft = all[taskId];
    if (draft && draft.taskId === taskId) {
      return draft;
    }
  } catch {
    // Ignore storage issues
  }
  return null;
}

export function saveTaskDraft(taskId: string, draft: Partial<MathTaskDraft>): void {
  if (!taskId) return;
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[taskId] = {
      ...draft,
      taskId,
      updatedAt: Date.now(),
    };
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Ignore storage issues
  }
}

export function clearTaskDraft(taskId: string): void {
  if (!taskId) return;
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return;
    const all = JSON.parse(raw);
    delete all[taskId];
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Ignore storage issues
  }
}

export function clearAllMathDrafts(): void {
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Ignore storage issues
  }
}
