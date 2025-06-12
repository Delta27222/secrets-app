'use client';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ClientOnlyPortal from '@/components/V2/portal/Portal';
import Toast from '@/components/V2/toast/Toast';
import { v4 as uuid } from 'uuid';

interface IToastContext {
  alerts?: Array<TAlert>;
  notify?: (
    content: string,
    type: 'success' | 'error' | 'warning' | 'info',
    err?: Error
  ) => void;
}

type TAlert = {
  content: string;
  type: 'success' | 'error' | 'warning' | 'info';
  id: string;
  timeOut: NodeJS.Timeout;
};

interface ToastContextProvider {
  children?: React.ReactNode;
}

export const ToastContext = React.createContext<IToastContext>({
  alerts: [],
  notify: (content, type, err) => {
    console.log('');
  },
});

export function ToastContextProvider({ children }: ToastContextProvider) {
  const [alerts, setAlerts] = React.useState<TAlert[]>([]);
  console.log("🚀 ~ ToastContextProvider ~ alerts:", alerts)
  interface NotifyFunction {
    (
      content: string,
      type: 'success' | 'error' | 'warning' | 'info',
      err?: Error
    ): void;
  }

  const notify: NotifyFunction = React.useCallback((content, type, err) => {
    if (err) {
      // Sentry.captureException(err);
    }
    const id = uuid();
    setAlerts((_alerts) => [
      ..._alerts,
      {
        content,
        type,
        id,
        timeOut: setTimeout(() => {
          setAlerts((__alerts) => __alerts.filter((alert) => alert.id !== id));
        }, 6000),
      },
    ]);
  }, []);

  const onDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const { id } = e.currentTarget.dataset;
    setAlerts((_alerts) => _alerts.filter((alert) => alert.id !== id));
  };
  const context = React.useMemo(() => ({ alerts, notify }), [alerts, notify]);
  return (
    <ToastContext.Provider value={context}>
      <ClientOnlyPortal selector="#toast">
        {alerts?.length > 0 ? (
          <div
            className="fixed right-4 top-4"
            style={{
              zIndex: 200,
            }}
          >
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1.0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.5,
                    transition: { duration: 0.2 },
                  }}
                  transition={{ type: 'spring', stiffness: 100 }}
                >
                  <Toast
                    key={alert.id}
                    type={alert.type}
                    id={alert.id}
                    onDelete={onDelete}
                  >
                    {alert.content}
                  </Toast>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : null}
      </ClientOnlyPortal>
      {children}
    </ToastContext.Provider>
  );
}
