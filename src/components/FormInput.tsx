import React, { useState, useRef, useEffect } from 'react'
import { IoEye, IoEyeOff } from 'react-icons/io5'

interface FormInputProps {
  label: string
  placeholder: string
  type?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  datalist?: string[]
  maxLength?: number
  error?: string,
  className?: string,
  name: string,
  disabled?: boolean,
  isUpperCase?: boolean
}

export default function FormInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  required = false,
  datalist,
  maxLength,
  error,
  name,
  disabled = false,
  className: inputClassName,
  isUpperCase = false
}: FormInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState<string[]>(datalist || [])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showPassword, setShowPassword] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (datalist) {
      const filtered = datalist.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredOptions(filtered)
      setSelectedIndex(-1) // Reset selection when options change
    }
  }, [value, datalist])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(isUpperCase ? e.target.value.toUpperCase() : e.target.value)
    if (datalist && datalist.length > 0 && e.target.value.length >= 2) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredOptions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
          handleOptionClick(filteredOptions[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleOptionClick = (option: string) => {
    onChange(option)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    if (value.length < 2) {
      return
    };

    if (datalist && datalist.length > 0) {
      setIsOpen(true)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Determine the actual input type
  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className="mb-4" ref={containerRef}>
      <label className="block text-gray-700 text-sm font-medium">
        {label}
        {required && <span className="text-red-500 text-lg ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          title={label}
          disabled={disabled}
          maxLength={maxLength}
          onChange={handleInputChange}
          name={name}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className={`w-full text-sm px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-[#F5F5F5] disabled:bg-gray-200 disabled:text-gray-400 ${
            error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          } ${type === 'password' ? 'pr-10' : ''} ${inputClassName}`}
          required={required}
          autoComplete="off"
        />
        
        {/* Password visibility toggle */}
        {type === 'password' && (
          <button
            type="button"
            title="Toggle password visibility"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 cursor-pointer active:scale-95 active:-rotate-6 transition-transform duration-200 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <IoEyeOff className="h-5 w-5" />
            ) : (
              <IoEye className="h-5 w-5" />
            )}
          </button>
        )}
        {datalist && isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleOptionClick(option)}
                className={`px-3 py-2 text-sm cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  index === selectedIndex 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
