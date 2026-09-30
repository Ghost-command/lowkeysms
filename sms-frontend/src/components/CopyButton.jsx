import { useState } from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { copyToClipboard } from '../utils/helpers'

export default function CopyButton({ text, label = '' }) {
  const [copied, setCopied] = useState(false)

  const handle = async () => {
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button className="copy-btn" onClick={handle} title="Copy to clipboard">
      {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
      {label && <span>{copied ? 'Copied!' : label}</span>}
    </button>
  )
}
