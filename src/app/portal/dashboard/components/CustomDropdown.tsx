'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface DropdownOption {
  value: string
  label: string
}

interface CustomDropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  defaultValue?: string
  searchable?: boolean
  searchPlaceholder?: string
  /**
   * "portal"   — custom portal menu (default, full keyboard nav + search)
   * "datalist" — native <datalist> for free-text + suggestions (no portal, no clickaway issues)
   */
  mode?: 'portal' | 'datalist'
  /** Only used in datalist mode: extra props forwarded to the <input> */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className = "",
  defaultValue,
  searchable = false,
  searchPlaceholder = "Search...",
  mode = 'portal',
  inputProps,
}: CustomDropdownProps) {

  /* ─────────────────────────────────────────────
     DATALIST MODE
  ───────────────────────────────────────────── */
  if (mode === 'datalist') {
    return (
      <DatalistDropdown
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        defaultValue={defaultValue}
        inputProps={inputProps}
      />
    )
  }

  /* ─────────────────────────────────────────────
     PORTAL MODE (original behaviour)
  ───────────────────────────────────────────── */
  return (
    <PortalDropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      defaultValue={defaultValue}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
    />
  )
}

/* ══════════════════════════════════════════════
   DATALIST DROPDOWN
══════════════════════════════════════════════ */

interface DatalistDropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  defaultValue?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

function DatalistDropdown({
  options,
  value,
  onChange,
  placeholder,
  className,
  defaultValue,
  inputProps,
}: DatalistDropdownProps) {
  // Stable unique ID for linking <input> → <datalist>
  const id = useRef(`dl-${Math.random().toString(36).slice(2)}`).current

  // Set default value on mount
  useEffect(() => {
    if (defaultValue && !value && options.some(o => o.value === defaultValue)) {
      onChange(defaultValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    onChange(raw)
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    // On blur, if the typed text exactly matches a label, normalise to that label.
    // This lets callers decide whether to accept free text or only known values.
    const matched = options.find(
      o => o.label.toLowerCase() === e.target.value.toLowerCase()
    )
    if (matched) onChange(matched.label)
    inputProps?.onBlur?.(e)
  }

  return (
    <div className={`relative ${className}`} data-drop="custom">
      <input
        {...inputProps}
        list={id}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        className={[
          'w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2',
          'text-sm text-gray-900 placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
          'hover:bg-gray-50 transition-colors duration-200',
          inputProps?.className ?? '',
        ].join(' ')}
      />
      <datalist id={id}>
        {options.map(o => (
          <option key={o.value} value={o.label} />
        ))}
      </datalist>
    </div>
  )
}

/* ══════════════════════════════════════════════
   PORTAL DROPDOWN  (unchanged logic, extracted)
══════════════════════════════════════════════ */

interface PortalDropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  defaultValue?: string
  searchable?: boolean
  searchPlaceholder?: string
}

function PortalDropdown({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className = "",
  defaultValue,
  searchable = false,
  searchPlaceholder = "Search...",
}: PortalDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [mounted, setMounted] = useState(false)

  const selectedOption = options.find(option => option.value === value)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect()
        setPosition({ top: rect.bottom, left: rect.left, width: rect.width })
      }
    }
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen])

  const filteredOptions = searchable && searchTerm
    ? options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : options

  useEffect(() => {
    if (defaultValue && !value && options.some(option => option.value === defaultValue)) {
      onChange(defaultValue)
    }
  }, [defaultValue, value, onChange, options])

  useEffect(() => {
    if (isOpen && selectedOption && menuRef.current) {
      const selectedIndex = filteredOptions.findIndex(option => option.value === value)
      if (selectedIndex >= 0) {
        const selectedElement = menuRef.current.children[searchable ? selectedIndex + 1 : selectedIndex] as HTMLElement
        selectedElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [isOpen, selectedOption, value, filteredOptions, searchable])

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [isOpen, searchable])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        menuRef.current && !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex(prev => prev < filteredOptions.length - 1 ? prev + 1 : 0)
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex(prev => prev > 0 ? prev - 1 : filteredOptions.length - 1)
          break
        case 'Enter':
          event.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            handleOptionClick(filteredOptions[focusedIndex].value)
          }
          break
        case 'Escape':
          event.preventDefault()
          setIsOpen(false); setSearchTerm(''); setFocusedIndex(-1)
          break
        case 'Tab':
          setIsOpen(false); setSearchTerm(''); setFocusedIndex(-1)
          break
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, focusedIndex, filteredOptions])

  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [focusedIndex])

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
    setFocusedIndex(-1)
  }

  const handleDropdownToggle = () => {
    const willOpen = !isOpen
    setIsOpen(willOpen)
    if (willOpen) {
      const selectedIndex = options.findIndex(opt => opt.value === value)
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0)
    } else {
      setSearchTerm('')
      setFocusedIndex(-1)
    }
  }

  return (
    <div className={`relative ${className}`} data-drop="custom" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleDropdownToggle}
        className="w-full bg-gray-100 border cursor-pointer border-gray-300 rounded-lg px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center justify-between capitalize">
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label.toLowerCase() : placeholder}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && mounted && createPortal(
        <div
          ref={menuRef}
          data-drop-menu="true"
          className="fixed z-[9999] cursor-pointer bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{ top: `${position.top}px`, left: `${position.left}px`, width: `${position.width}px`, marginTop: '4px' }}
        >
          {searchable && (
            <div className="p-2 border-b border-gray-100 sticky top-0 bg-white/75 backdrop-blur-sm">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setFocusedIndex(0) }}
                placeholder={searchPlaceholder}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') e.preventDefault() }}
              />
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">No options found</div>
          ) : (
            filteredOptions.map((option, index) => (
              <button
                key={option.value}
                ref={el => { optionRefs.current[index] = el }}
                type="button"
                onClick={() => handleOptionClick(option.value)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`w-full px-3 py-2 text-sm text-left cursor-pointer hover:bg-gray-50 focus:outline-none transition-colors duration-150 ${option.value === value
                    ? 'bg-green-50 text-green-700 font-medium'
                    : focusedIndex === index
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-900'
                  } ${option === filteredOptions[filteredOptions.length - 1] ? '' : 'border-b border-gray-100'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize">{option.label.toLowerCase()}</span>
                  {option.value === value && (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  )
}