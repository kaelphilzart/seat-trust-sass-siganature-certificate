'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import AlertDialog from './alert-dialog';

type AlertType = 'success' | 'error' | 'info' | 'confirm';

interface AlertState {
  open: boolean;
  type: AlertType;
  title?: string;
  message?: string;
  onConfirm?: () => void;
  loading?: boolean;
}

interface AlertContextProps {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  confirm: (message: string, onConfirm: () => void) => void;
  confirmAsync: (
    message: string,
    action: () => Promise<{ success: boolean; message?: string }>
  ) => Promise<void>;
  showLoading: () => void;
  hideLoading: () => void;
  close: () => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    type: 'success',
  });

  const [globalLoading, setGlobalLoading] = useState(false);

  const show = (type: AlertType, message: string, onConfirm?: () => void) => {
    setAlert({
      open: true,
      type,
      title:
        type === 'success'
          ? 'Berhasil'
          : type === 'error'
            ? 'Gagal'
            : type === 'info'
              ? 'Informasi'
              : 'Konfirmasi',
      message,
      onConfirm,
      loading: false,
    });
  };

  const close = () => setAlert((prev) => ({ ...prev, open: false }));

  const showLoading = () => setGlobalLoading(true);
  const hideLoading = () => setGlobalLoading(false);

  const confirmAsync = async (
    message: string,
    action: () => Promise<{ success: boolean; message?: string }>
  ) => {
    return new Promise<void>((resolve) => {
      const onConfirm = async () => {
        setAlert((prev) => ({ ...prev, loading: true }));
        setGlobalLoading(true); // 🔥 GLOBAL LOADING ON

        try {
          const res = await action();

          if (res.success) {
            show('success', res.message || 'Berhasil!');
          } else {
            show('error', res.message || 'Terjadi kesalahan.');
          }
        } catch (err: any) {
          show('error', err?.message || 'Terjadi kesalahan.');
        } finally {
          setGlobalLoading(false); // 🔥 GLOBAL LOADING OFF
          resolve();
        }
      };

      setAlert({
        open: true,
        type: 'confirm',
        title: 'Konfirmasi',
        message,
        onConfirm,
        loading: false,
      });
    });
  };

  return (
    <AlertContext.Provider
      value={{
        success: (msg: string) => show('success', msg),
        error: (msg: string) => show('error', msg),
        info: (msg: string) => show('info', msg),
        confirm: (msg: string, onConfirm: () => void) =>
          show('confirm', msg, onConfirm),
        confirmAsync,
        showLoading,
        hideLoading,
        close,
      }}
    >
      {children}

      {/* 🔥 GLOBAL LOADING OVERLAY */}
      {globalLoading && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-primary text-sm">Processing...</p>
          </div>
        </div>
      )}

      <AlertDialog
        open={alert.open}
        title={alert.title}
        message={alert.message}
        onClose={close}
        onConfirm={alert.onConfirm}
        loading={alert.loading}
        confirmText={alert.type === 'confirm' ? 'Ya' : 'OK'}
        cancelText={alert.type === 'confirm' ? 'Batal' : 'Tutup'}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within AlertProvider');
  return context;
};
