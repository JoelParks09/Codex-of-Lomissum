import { X } from 'lucide-react';

type ImageModalProps = {
  alt: string;
  ariaLabel: string;
  src: string;
  onClose: () => void;
};

function ImageModal({ alt, ariaLabel, src, onClose }: ImageModalProps) {
  return (
    <div
      className="image-modal"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClose}
    >
      <div className="image-modal-panel" onClick={(event) => event.stopPropagation()}>
        <button
          className="image-modal-close"
          type="button"
          aria-label="Close map preview"
          onClick={onClose}
        >
          <X size={24} strokeWidth={2.2} aria-hidden="true" />
        </button>
        <img src={src} alt={alt} />
      </div>
    </div>
  );
}

export default ImageModal;
