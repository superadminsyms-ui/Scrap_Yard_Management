import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function OTPInput({ value, onChange, error, disabled }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.split('').slice(0, 6)

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return

    const newDigits = [...digits]
    newDigits[index] = char
    const newValue = newDigits.join('').slice(0, 6)
    onChange(newValue)

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    if (pasted.length > 0) {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  return (
    <div className={cn('flex gap-2 justify-center', disabled && 'opacity-50')}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          value={digits[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className={cn(
            'w-12 h-14 text-center text-2xl font-semibold rounded-xl border-2 transition-all duration-200 ease-emphasized focus:outline-none focus:ring-2 focus:ring-offset-1',
            error
              ? 'border-error-400 focus:border-error-500 focus:ring-error-500'
              : 'border-outline focus:border-primary-500 focus:ring-primary-500',
            'text-secondary-800 bg-surface',
            disabled && 'bg-secondary-100 cursor-not-allowed',
          )}
        />
      ))}
    </div>
  )
}
