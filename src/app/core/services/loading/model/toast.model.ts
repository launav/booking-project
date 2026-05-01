export type ToastType = 'error' | 'success' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}
