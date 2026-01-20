'use client'

import React from 'react'

interface CustomCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  indeterminate?: boolean
}

export default function CustomCheckbox({
  checked,
  onChange,
  disabled = false,
  className = "",
  size = 'md',
  indeterminate = false
}: CustomCheckboxProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const iconSizes = {
    sm: 'w-2 h-2.5',
    md: 'w-2.5 h-3',
    lg: 'w-3.5 h-4'
  }

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        ${sizeClasses[size]}
        relative
        cursor-pointer
        rounded-md
        border-2
        transition-all
        duration-200
        ease-in-out
        focus:outline-none
        focus:ring-2
        focus:ring-green-500
        focus:ring-offset-1
        ${checked 
          ? 'bg-green-600 border-green-600 text-white'
          : indeterminate
          ? 'border-green-600 text-white'
          : 'bg-white border-gray-300 hover:border-gray-400'
        }
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-sm'
        }
        ${className}
      `}
    >
      {/* Icon Container */}
      <div
        className={`
          absolute
          inset-0
          flex
          items-center
          justify-center
          transition-all
          duration-200
          ease-in-out
          ${checked || indeterminate
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-75'
          }
        `}
      >
        {indeterminate ? (
          /* Minus/Dash Icon for indeterminate state */
          <svg
            className={`${iconSizes[size]} text-green-600`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 12H4"
            />
          </svg>
        ) : (
          /* Checkmark Icon for checked state */
          <svg
            className={`${iconSizes[size]} text-white`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </div>
  )
}
