"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export interface AlertComment {
  id: string;
  author: string;
  text: string;
  at: number;
}

export type ActivityKind =
  | "done"
  | "reopen"
  | "assigned"
  | "unassigned"
  | "tag_add"
  | "tag_remove"
  | "comment"
  | "outcome";

/** A logged outcome: which response was chosen, keyed by group so it re-localises. */
export interface Outcome {
  group: string;
  key: string;
}

export interface AlertActivity {
  id: string;
  kind: ActivityKind;
  value?: string;
  author: string;
  at: number;
}

export interface AlertState {
  read: boolean;
  done: boolean;
  assignee: string | null;
  /** The response the company logged for this action (what was done). */
  outcome: Outcome | null;
  tags: string[];
  comments: AlertComment[];
  activity: AlertActivity[];
}

/** Teams an action can be assigned to. */
export const ASSIGNEES = [
  "Legal Team",
  "Procurement",
  "Finance",
  "HR",
  "IT",
  "Operations",
];
/** Suggested tags for quick tagging. */
export const SUGGESTED_TAGS_AR = ["أولوية عالية", "قيد التنفيذ", "بانتظار رد", "معلّق"];
export const SUGGESTED_TAGS_EN = ["High priority", "In progress", "Waiting", "Blocked"];

const CURRENT_USER = "Eman Wed";
const EMPTY: AlertState = {
  read: false,
  done: false,
  assignee: null,
  outcome: null,
  tags: [],
  comments: [],
  activity: [],
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const log = (kind: ActivityKind, value?: string): AlertActivity => ({
  id: uid(),
  kind,
  value,
  author: CURRENT_USER,
  at: Date.now(),
});

interface NotificationsContextValue {
  currentUser: string;
  getState: (id: string) => AlertState;
  unreadCount: (ids: string[]) => number;
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
  toggleDone: (id: string) => void;
  resolveWithOutcome: (id: string, group: string, key: string) => void;
  setAssignee: (id: string, assignee: string | null) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
  addComment: (id: string, text: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

/**
 * Per-alert task state (read/unread, done, assignee, tags, comments) plus an
 * activity log. Keyed by the alert's stable id; in-memory (matches the demo).
 */
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [states, setStates] = useState<Record<string, AlertState>>({});

  const patch = useCallback(
    (id: string, fn: (s: AlertState) => AlertState) =>
      setStates((prev) => ({ ...prev, [id]: fn(prev[id] ?? EMPTY) })),
    [],
  );

  const markRead = useCallback(
    (id: string) => patch(id, (s) => (s.read ? s : { ...s, read: true })),
    [patch],
  );

  const markAllRead = useCallback(
    (ids: string[]) =>
      setStates((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = { ...(next[id] ?? EMPTY), read: true };
        return next;
      }),
    [],
  );

  const toggleDone = useCallback(
    (id: string) =>
      patch(id, (s) => {
        const done = !s.done;
        return {
          ...s,
          done,
          read: true,
          // Reopening clears any logged outcome — the action is open again.
          outcome: done ? s.outcome : null,
          activity: [log(done ? "done" : "reopen"), ...s.activity],
        };
      }),
    [patch],
  );

  const resolveWithOutcome = useCallback(
    (id: string, group: string, key: string) =>
      patch(id, (s) => ({
        ...s,
        done: true,
        read: true,
        outcome: { group, key },
        activity: [log("outcome", `${group}:${key}`), ...s.activity],
      })),
    [patch],
  );

  const setAssignee = useCallback(
    (id: string, assignee: string | null) =>
      patch(id, (s) => ({
        ...s,
        assignee,
        read: true,
        activity: [
          log(assignee ? "assigned" : "unassigned", assignee ?? undefined),
          ...s.activity,
        ],
      })),
    [patch],
  );

  const addTag = useCallback(
    (id: string, tag: string) =>
      patch(id, (s) =>
        s.tags.includes(tag)
          ? s
          : {
              ...s,
              read: true,
              tags: [...s.tags, tag],
              activity: [log("tag_add", tag), ...s.activity],
            },
      ),
    [patch],
  );

  const removeTag = useCallback(
    (id: string, tag: string) =>
      patch(id, (s) => ({
        ...s,
        tags: s.tags.filter((t) => t !== tag),
        activity: [log("tag_remove", tag), ...s.activity],
      })),
    [patch],
  );

  const addComment = useCallback(
    (id: string, text: string) =>
      patch(id, (s) => ({
        ...s,
        read: true,
        comments: [
          ...s.comments,
          { id: uid(), author: CURRENT_USER, text, at: Date.now() },
        ],
        activity: [log("comment"), ...s.activity],
      })),
    [patch],
  );

  const getState = useCallback((id: string) => states[id] ?? EMPTY, [states]);
  const unreadCount = useCallback(
    (ids: string[]) => ids.filter((id) => !(states[id] ?? EMPTY).read).length,
    [states],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      currentUser: CURRENT_USER,
      getState,
      unreadCount,
      markRead,
      markAllRead,
      toggleDone,
      resolveWithOutcome,
      setAssignee,
      addTag,
      removeTag,
      addComment,
    }),
    [
      getState,
      unreadCount,
      markRead,
      markAllRead,
      toggleDone,
      resolveWithOutcome,
      setAssignee,
      addTag,
      removeTag,
      addComment,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error("useNotifications must be used within <NotificationsProvider>");
  return ctx;
}
