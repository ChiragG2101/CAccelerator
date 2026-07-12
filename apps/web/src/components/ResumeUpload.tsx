'use client'

import { useRef, useState } from 'react'

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_BYTES = 5 * 1024 * 1024

interface ResumeUploadProps {
  file: File | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
}

export function ResumeUpload({ file, onFileChange, disabled }: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  function selectFile(selected: File | undefined) {
    setFileError(null)
    if (!selected) return
    if (!ACCEPTED_TYPES.includes(selected.type) && !/\.(pdf|docx)$/i.test(selected.name)) {
      setFileError('Choose a PDF or DOCX file.')
      return
    }
    if (selected.size > MAX_BYTES) {
      setFileError('Choose a file smaller than 5 MB.')
      return
    }
    onFileChange(selected)
  }

  return (
    <div className='space-y-3'>
      <label htmlFor='resume' className='block text-sm font-medium text-slate-100'>Resume</label>
      <input
        ref={inputRef}
        id='resume'
        type='file'
        accept='.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        disabled={disabled}
        onChange={(event) => selectFile(event.target.files?.[0])}
        className='sr-only'
      />
      <button
        type='button'
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className='w-full rounded-xl border border-dashed border-slate-600 bg-slate-950/30 px-5 py-8 text-left transition hover:border-brand-400 disabled:cursor-not-allowed disabled:opacity-60'
      >
        <span className='block text-sm font-semibold text-slate-100'>{file?.name ?? 'Choose a PDF or DOCX resume'}</span>
        <span className='mt-1 block text-xs text-slate-400'>{file ? `${Math.ceil(file.size / 1024)} KB selected` : 'Maximum file size: 5 MB'}</span>
      </button>
      {file ? <button type='button' disabled={disabled} onClick={() => onFileChange(null)} className='text-xs font-medium text-slate-300 hover:text-white'>Remove file</button> : null}
      {fileError ? <p className='text-sm text-red-300'>{fileError}</p> : null}
    </div>
  )
}
