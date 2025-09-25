import React, { useState, useRef, useEffect } from 'react'

interface FormInputProps {
  label: string
  placeholder: string
  type?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  datalist?: string[]
  error?: string
  name: string
}

export default function FormInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  required = false,
  datalist,
  error,
  name
}: FormInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState<string[]>(datalist || [])
  const [selectedIndex, setSelectedIndex] = useState(-1)
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
    onChange(e.target.value)
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

  return (
    <div className="mb-4" ref={containerRef}>
      <label className="block text-gray-700 text-sm font-medium">
        {label}
        {required && <span className="text-red-500 text-lg ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          name={name}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className={`w-full text-sm px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-[#F5F5F5] ${
            error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          required={required}
          autoComplete="off"
        />
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
