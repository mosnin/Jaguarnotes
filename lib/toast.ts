export type ToastType = "success" | "error" | "info" | "copy";
export interface Toast { id: string; message: string; type: ToastType; }
type Listener = (toast: Toast) => void;

const listeners = new Set<Listener>();

export const toast = {
  show(message: string, type: ToastType = "info") {
    const t: Toast = { id: crypto.randomUUID(), message, type };
    listeners.forEach((fn) => fn(t));
  },
  success: (m: string) => toast.show(m, "success"),
  error: (m: string) => toast.show(m, "error"),
  copy: (m: string) => toast.show(m, "copy"),
  subscribe: (fn: Listener) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
