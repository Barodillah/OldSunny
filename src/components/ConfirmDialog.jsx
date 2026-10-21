import { useEffect, useRef } from 'react'
import {
  HiOutlineExclamationTriangle,
  HiOutlineTrash,
  HiOutlineInformationCircle,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineArrowPath
} from 'react-icons/hi2'
import './ConfirmDialog.css'

/**
 * Reusable Confirm Dialog Modal for Public Components
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls dialog visibility
 * @param {Function} props.onClose - Callback when dialog is cancelled or closed
 * @param {Function} props.onConfirm - Callback when the confirm action button is clicked
 * @param {string} [props.title] - Dialog title heading
 * @param {React.ReactNode} [props.message] - Dialog description or content
 * @param {string} [props.confirmText] - Label for primary confirm button
 * @param {string} [props.cancelText] - Label for cancel button
 * @param {'danger' | 'warning' | 'info' | 'success'} [props.variant='danger'] - Visual style theme
 * @param {React.ReactNode} [props.icon] - Optional custom icon override
 * @param {boolean} [props.isLoading=false] - Show loading state on confirm button
 * @param {string} [props.itemIdentifier] - Optional badge/snippet for the targeted item (e.g. Session snippet or ID)
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger',
  icon = null,
  isLoading = false,
  itemIdentifier = null
}) {
  const dialogRef = useRef(null)
  const confirmBtnRef = useRef(null)

  // Keyboard navigation & body scroll management
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        e.stopPropagation()
        onClose()
      }
    }

    // Auto-focus confirm button on open for easy keyboard interaction
    const timer = setTimeout(() => {
      if (confirmBtnRef.current) {
        confirmBtnRef.current.focus()
      }
    }, 50)

    window.addEventListener('keydown', handleKeyDown, true)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  // Determine icon based on variant
  const renderIcon = () => {
    if (icon) return icon

    switch (variant) {
      case 'danger':
        return <HiOutlineTrash className="confirm-dialog-icon danger" size={26} />
      case 'warning':
        return <HiOutlineExclamationTriangle className="confirm-dialog-icon warning" size={26} />
      case 'success':
        return <HiOutlineCheckCircle className="confirm-dialog-icon success" size={26} />
      case 'info':
      default:
        return <HiOutlineInformationCircle className="confirm-dialog-icon info" size={26} />
    }
  }

  return (
    <div
      className="confirm-dialog-backdrop"
      onClick={(e) => {
        if (!isLoading && e.target === e.currentTarget) {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div className={`confirm-dialog-card variant-${variant}`} ref={dialogRef}>
        {/* Close Button (X) */}
        <button
          type="button"
          className="confirm-dialog-close-btn"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Tutup dialog"
        >
          <HiOutlineXMark size={18} />
        </button>

        {/* Top Visual Accent & Icon */}
        <div className="confirm-dialog-header">
          <div className={`confirm-dialog-icon-badge ${variant}`}>
            {renderIcon()}
          </div>
        </div>

        {/* Content Body */}
        <div className="confirm-dialog-body">
          <h3 id="confirm-dialog-title" className="confirm-dialog-title">
            {title}
          </h3>

          <div id="confirm-dialog-desc" className="confirm-dialog-message">
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>

          {itemIdentifier && (
            <div className="confirm-dialog-identifier-box">
              <span className="confirm-dialog-identifier-label">Target:</span>
              <span className="confirm-dialog-identifier-value">{itemIdentifier}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="confirm-dialog-btn btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>

          <button
            ref={confirmBtnRef}
            type="button"
            className={`confirm-dialog-btn btn-confirm ${variant}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="confirm-dialog-loading-wrap">
                <HiOutlineArrowPath className="confirm-dialog-spin" size={16} />
                <span>Memproses...</span>
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

