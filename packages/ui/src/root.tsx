import React from 'react'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>
export const Button: React.FC<ButtonProps> = ({ children, style, ...props }) => (
  <button
    {...props}
    style={{
      padding: '8px 12px',
      borderRadius: 6,
      border: '1px solid #ddd',
      background: '#111',
      color: '#fff',
      cursor: 'pointer',
      ...style
    }}
  >
    {children}
  </button>
)

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>
export const Input: React.FC<InputProps> = ({ style, ...props }) => (
  <input
    {...props}
    style={{
      padding: '8px 10px',
      borderRadius: 6,
      border: '1px solid #ddd',
      outline: 'none',
      width: '100%',
      ...style
    }}
  />
)

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>
export const Textarea: React.FC<TextareaProps> = ({ style, ...props }) => (
  <textarea
    {...props}
    style={{
      padding: '8px 10px',
      borderRadius: 6,
      border: '1px solid #ddd',
      outline: 'none',
      width: '100%',
      ...style
    }}
  />
)
