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
    <fieldset className='space-y-4' disabled={disabled}>
      <legend className='text-sm font-medium text-slate-100'>Resume</legend>
      <div className='rounded-xl border border-dashed border-slate-600 bg-slate-950/40 p-5'>
        <input
          ref={inputRef}
          type='file'
          accept='.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          className='sr-only'
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
        {file ? (
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <p className='text-sm font-medium text-slate-100'>{file.name}</p>
              <p className='text-xs text-slate-400'>{(file.size / 1024).toFixed(0)} KB · ready to extract</p>
            </div>
            <button type='button' className='text-sm text-brand-200 hover:text-brand-100' onClick={() => { onFileChange(null); if (inputRef.current) inputRef.current.value = '' }}>
              Remove
            </button>
          </div>
        ) : (
          <div>
            <p className='text-sm text-slate-200'>Upload your latest PDF or DOCX resume</p>
            <p className='mt-1 text-xs text-slate-400'>Maximum 5 MB. Your file is used only to build your candidate profile.</p>
            <button type='button' onClick={() => inputRef.current?.click()} className='mt-4 rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800'>
              Choose resume
            </button>
          </div>
        )}
        {fileError ? <p className='mt-3 text-xs text-rose-300'>{fileError}</p> : null}
      </div>
    </fieldset>
  )
}
