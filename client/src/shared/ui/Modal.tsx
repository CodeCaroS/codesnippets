import type { ReactNode } from 'react';

export const Modal = ({
  title,
  children,
  open,
  onClose,
}: {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <h2>{title}</h2>
          <button className="button button--ghost" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <div className="modal__content">{children}</div>
      </div>
    </div>
  );
};
