import React from 'react';
import { ToastContext } from '../context/ToastContext';

export function useNotify(): (
  content: string,
  type: 'success' | 'error' | 'warning' | 'info',
  err?: Error
) => void {
  const toastContext = React.useContext(ToastContext);
  if (!toastContext.notify) {
    throw new Error('ToastContext.notify is undefined');
  }
  return toastContext.notify;
}
