'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'indigo' | 'pink' | 'orange'
  loading?: boolean
  fullWidth?: boolean
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  color = 'blue',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  // Color and variant combinations
  const getVariantStyles = () => {
    const colorMap = {
      blue: {
        primary: `bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`,
        secondary: `bg-blue-100 text-blue-900 hover:bg-blue-200 focus:ring-blue-500`,
        outline: `border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500`,
        ghost: `text-blue-600 hover:bg-blue-50 focus:ring-blue-500`,
        danger: `bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`
      },
      green: {
        primary: `bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`,
        secondary: `bg-green-100 text-green-900 hover:bg-green-200 focus:ring-green-500`,
        outline: `border border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500`,
        ghost: `text-green-600 hover:bg-green-50 focus:ring-green-500`,
        danger: `bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`
      },
      red: {
        primary: `bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`,
        secondary: `bg-red-100 text-red-900 hover:bg-red-200 focus:ring-red-500`,
        outline: `border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500`,
        ghost: `text-red-600 hover:bg-red-50 focus:ring-red-500`,
        danger: `bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`
      },
      yellow: {
        primary: `bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500`,
        secondary: `bg-yellow-100 text-yellow-900 hover:bg-yellow-200 focus:ring-yellow-500`,
        outline: `border border-yellow-600 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500`,
        ghost: `text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500`,
        danger: `bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500`
      },
      purple: {
        primary: `bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500`,
        secondary: `bg-purple-100 text-purple-900 hover:bg-purple-200 focus:ring-purple-500`,
        outline: `border border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500`,
        ghost: `text-purple-600 hover:bg-purple-50 focus:ring-purple-500`,
        danger: `bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500`
      },
      gray: {
        primary: `bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500`,
        secondary: `bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500`,
        outline: `border border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-500`,
        ghost: `text-gray-600 hover:bg-gray-50 focus:ring-gray-500`,
        danger: `bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500`
      },
      indigo: {
        primary: `bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500`,
        secondary: `bg-indigo-100 text-indigo-900 hover:bg-indigo-200 focus:ring-indigo-500`,
        outline: `border border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500`,
        ghost: `text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500`,
        danger: `bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500`
      },
      pink: {
        primary: `bg-pink-600 text-white hover:bg-pink-700 focus:ring-pink-500`,
        secondary: `bg-pink-100 text-pink-900 hover:bg-pink-200 focus:ring-pink-500`,
        outline: `border border-pink-600 text-pink-600 hover:bg-pink-50 focus:ring-pink-500`,
        ghost: `text-pink-600 hover:bg-pink-50 focus:ring-pink-500`,
        danger: `bg-pink-600 text-white hover:bg-pink-700 focus:ring-pink-500`
      },
      orange: {
        primary: `bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500`,
        secondary: `bg-orange-100 text-orange-900 hover:bg-orange-200 focus:ring-orange-500`,
        outline: `border border-orange-600 text-orange-600 hover:bg-orange-50 focus:ring-orange-500`,
        ghost: `text-orange-600 hover:bg-orange-50 focus:ring-orange-500`,
        danger: `bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500`
      }
    }
    
    return colorMap[color][variant]
  }
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : ''
  
  // Combine all styles
  const combinedStyles = [
    baseStyles,
    sizeStyles[size],
    getVariantStyles(),
    widthStyles,
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      className={combinedStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  )
}

export default Button
