import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const UIContext = createContext(null);
export const useUI = () => useContext(UIContext);

function ConfirmDialog({ dialog, onClose }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose(false);
      }}
    >
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" aria-describedby="dlg-msg">
        <h2 id="dlg-title">{dialog.title}</h2>
        <p id="dlg-msg">{dialog.message}</p>
        <div className="modal-actions">
          <button ref={cancelRef} className="btn btn-quiet" onClick={() => onClose(false)}>
            {dialog.cancelText || 'Cancel'}
          </button>
          <button className={`btn ${dialog.danger ? 'btn-solid-danger' : ''}`} onClick={() => onClose(true)}>
            {dialog.confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const idRef = useRef(0);
  const resolverRef = useRef(null);

  const toast = useCallback((message, type = 'success') => {
    idRef.current += 1;
    const id = idRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolverRef.current = resolve;
        setDialog(options);
      }),
    []
  );

  const close = useCallback((result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setDialog(null);
  }, []);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <UIContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
      {dialog && <ConfirmDialog dialog={dialog} onClose={close} />}
    </UIContext.Provider>
  );
}
