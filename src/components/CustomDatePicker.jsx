import { useState, useMemo } from 'react'
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCalendar
} from 'react-icons/hi2'
import './CustomDatePicker.css'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export default function CustomDatePicker({
  currentDate,
  onSelect,
  minDate
}) {
  // Determine initial month/year from currentDate or tomorrow
  const initialDate = useMemo(() => {
    if (currentDate) {
      const parts = currentDate.split('-')
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
      }
    }
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }, [currentDate])

  const [viewYear, setViewYear] = useState(initialDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth())

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const effectiveMinDate = useMemo(() => {
    if (minDate) {
      const d = new Date(minDate)
      d.setHours(0, 0, 0, 0)
      return d
    }
    return today
  }, [minDate, today])

  // Can we navigate to previous month?
  const canGoPrev = useMemo(() => {
    const minMonthDate = new Date(effectiveMinDate.getFullYear(), effectiveMinDate.getMonth(), 1)
    const currentMonthDate = new Date(viewYear, viewMonth, 1)
    return currentMonthDate > minMonthDate
  }, [effectiveMinDate, viewYear, viewMonth])

  const handlePrevMonth = () => {
    if (!canGoPrev) return
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((prev) => prev - 1)
    } else {
      setViewMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((prev) => prev + 1)
    } else {
      setViewMonth((prev) => prev + 1)
    }
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

    const days = []

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        isPrev: true,
        disabled: true
      })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const thisDate = new Date(viewYear, viewMonth, day)
      thisDate.setHours(0, 0, 0, 0)

      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isPast = thisDate < effectiveMinDate
      const isSelected = currentDate === iso
      const isToday = thisDate.getTime() === today.getTime()
      const isSunday = thisDate.getDay() === 0

      days.push({
        dayNumber: day,
        iso,
        isCurrentMonth: true,
        isPast,
        isSelected,
        isToday,
        isSunday,
        disabled: isPast
      })
    }

    // Next month padding days to complete 35 or 42 cells
    const totalCells = days.length > 35 ? 42 : 35
    const remaining = totalCells - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        isNext: true,
        disabled: true
      })
    }

    return days
  }, [viewYear, viewMonth, effectiveMinDate, currentDate, today])

  // Quick jump shortcuts
  const selectQuickDate = (offsetDays) => {
    const target = new Date()
    target.setDate(target.getDate() + offsetDays)
    const iso = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`
    setViewYear(target.getFullYear())
    setViewMonth(target.getMonth())
    if (onSelect) onSelect(iso)
  }

  return (
    <div className="custom-calendar-root">
      {/* Quick Select Buttons */}
      <div className="calendar-quick-bar">
        <button
          type="button"
          onClick={() => selectQuickDate(1)}
          className="quick-date-pill"
        >
          Besok
        </button>
        <button
          type="button"
          onClick={() => selectQuickDate(2)}
          className="quick-date-pill"
        >
          Lusa
        </button>
        <button
          type="button"
          onClick={() => selectQuickDate(7)}
          className="quick-date-pill"
        >
          +1 Minggu
        </button>
      </div>

      {/* Month/Year Navigation */}
      <div className="calendar-header-bar">
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
          className="calendar-nav-btn"
          aria-label="Bulan Sebelumnya"
        >
          <HiOutlineChevronLeft size={18} />
        </button>

        <div className="calendar-title-wrap">
          <span className="calendar-month-name">{MONTH_NAMES[viewMonth]}</span>
          <span className="calendar-year-num">{viewYear}</span>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="calendar-nav-btn"
          aria-label="Bulan Selanjutnya"
        >
          <HiOutlineChevronRight size={18} />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="calendar-weekdays-grid">
        {DAY_NAMES.map((name, idx) => (
          <div
            key={name}
            className={`calendar-weekday-cell ${idx === 0 ? 'is-sunday-head' : ''}`}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Days Matrix */}
      <div className="calendar-days-grid">
        {calendarDays.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return (
              <div key={idx} className="calendar-day-cell is-outside-month">
                <span>{cell.dayNumber}</span>
              </div>
            )
          }

          return (
            <button
              key={cell.iso}
              type="button"
              disabled={cell.disabled}
              onClick={() => onSelect && onSelect(cell.iso)}
              className={`calendar-day-cell ${cell.isSelected ? 'is-selected' : ''} ${cell.isToday ? 'is-today' : ''} ${cell.isSunday ? 'is-sunday' : ''} ${cell.disabled ? 'is-disabled' : ''}`}
            >
              <span className="day-number-text">{cell.dayNumber}</span>
              {cell.isToday && !cell.isSelected && <span className="today-dot-indicator" />}
            </button>
          )
        })}
      </div>

      {/* Calendar Footer Note */}
      <div className="calendar-footer-note">
        <HiOutlineCalendar size={14} className="footer-note-icon" />
        <span>Pilih tanggal untuk reservasi servis Sun Margahayu</span>
      </div>
    </div>
  )
}
