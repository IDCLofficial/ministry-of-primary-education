'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ModalOptions {
  title?: string
  message: string
  type: 'alert' | 'confirm'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

interface CustomModalContextType {
  showAlert: (message: string, title?: string) => Promise<void>
  showConfirm: (message: string, title?: string, confirmText?: string, cancelText?: string) => Promise<boolean>
}

const CustomModalContext = createContext<CustomModalContextType | undefined>(undefined)

export const useCustomModal = () => {
  const context = useContext(CustomModalContext)
  if (!context) {
    throw new Error('useCustomModal must be used within a CustomModalProvider')
  }
  return context
}

interface CustomModalProviderProps {
  children: ReactNode
}

export const CustomModalProvider: React.FC<CustomModalProviderProps> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    options: ModalOptions | null
    resolve: ((value: boolean) => void) | null
  }>({
    isOpen: false,
    options: null,
    resolve: null
  })

  const showAlert = (message: string, title?: string): Promise<void> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        options: {
          type: 'alert',
          message,
          title: title || 'Alert',
          confirmText: 'OK'
        },
        resolve: () => {
          resolve()
        }
      })
    })
  }

  const showConfirm = (
    message: string, 
    title?: string, 
    confirmText?: string, 
    cancelText?: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        options: {
          type: 'confirm',
          message,
          title: title || 'Confirm',
          confirmText: confirmText || 'Yes',
          cancelText: cancelText || 'Cancel'
        },
        resolve
      })
    })
  }

  const handleConfirm = () => {
    if (modalState.resolve) {
      modalState.resolve(true)
    }
    setModalState({ isOpen: false, options: null, resolve: null })
  }

  const handleCancel = () => {
    if (modalState.resolve) {
      modalState.resolve(false)
    }
    setModalState({ isOpen: false, options: null, resolve: null })
  }

  const handleClose = () => {
    if (modalState.options?.type === 'alert') {
      handleConfirm()
    } else {
      handleCancel()
    }
  }

  return (
    <CustomModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* Custom Modal */}
      {modalState.isOpen && modalState.options && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
              onClick={handleClose}
            />

            {/* Modal panel */}
            <div className="inline-block align-bottom relative z-50 bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  {/* Icon */}
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                    modalState.options.type === 'alert' 
                      ? 'bg-blue-100' 
                      : 'bg-yellow-100'
                  }`}>
                    {modalState.options.type === 'alert' ? (
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {modalState.options.title}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {modalState.options.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer active:scale-95 active:rotate-1 transition-all duration-150 ${
                    modalState.options.type === 'alert'
                      ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {modalState.options.confirmText}
                </button>
                
                {modalState.options.type === 'confirm' && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer active:scale-95 active:rotate-1 transition-all duration-150"
                  >
                    {modalState.options.cancelText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </CustomModalContext.Provider>
  )
}
