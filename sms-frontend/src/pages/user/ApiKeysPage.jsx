import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Key, Copy, Check, Trash2, RefreshCw, Code, Terminal, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { generateApiKey, revokeApiKey, getApiKeyStatus } from '../../api/user'
import { MaintenanceGuard } from '../../components/common/MaintenanceGuard'
import { Button } from '../../components/ui/button'

export default function ApiKeysPage() {
  const [plainKey, setPlainKey] = useState('')
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedCurl, setCopiedCurl] = useState(false)
  const [copiedNode, setCopiedNode] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [revoking, setRevoking] = useState(false)

  const { data: statusData, refetch } = useQuery({
    queryKey: ['api-key-status'],
    queryFn: () => getApiKeyStatus().then((r) => r.data?.data),
  })

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await generateApiKey()
      if (res.data?.data?.apiKey) {
        setPlainKey(res.data.data.apiKey)
        toast.success('New API Key generated!')
        refetch()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate API Key.')
    } finally {
      setGenerating(false)
    }
  }

  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke your API key? Applications using it will stop working immediately.')) return
    setRevoking(true)
    try {
      await revokeApiKey()
      setPlainKey('')
      toast.success('API Key revoked.')
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke API Key.')
    } finally {
      setRevoking(false)
    }
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'key') setCopiedKey(true)
    if (type === 'curl') setCopiedCurl(true)
    if (type === 'node') setCopiedNode(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => {
      setCopiedKey(false)
      setCopiedCurl(false)
      setCopiedNode(false)
    }, 2000)
  }

  const curlSnippet = `curl -X POST http://localhost:5000/api/orders \\
  -H "x-api-key: ${plainKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"country": "ng", "service": "whatsapp"}'`

  const nodeSnippet = `const axios = require('axios');

const res = await axios.post('http://localhost:5000/api/orders', {
  country: 'ng',
  service: 'whatsapp'
}, {
  headers: { 'x-api-key': '${plainKey || 'YOUR_API_KEY'}' }
});

console.log(res.data);`

  return (
    <MaintenanceGuard moduleName="apiAccess">
      <div className="space-y-space-xl max-w-4xl mx-auto">
        <div>
          <h1 className="font-headline-lg text-[24px] sm:text-[32px] font-semibold text-on-surface tracking-tight">
            Developer API Keys
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Programmatically purchase virtual numbers and poll SMS codes using standard REST APIs.
          </p>
        </div>

        {/* Key Card */}
        <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm space-y-space-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> Active API Credential
            </h3>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-code-md border uppercase font-bold ${
              statusData?.hasKey ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-surface-container-high border-white/10 text-on-surface-variant'
            }`}>
              {statusData?.hasKey ? 'Active Key' : 'No Key Generated'}
            </span>
          </div>

          {plainKey && (
            <div className="p-space-md rounded-[16px] bg-primary/10 border border-primary/20 space-y-3">
              <div className="flex items-center gap-2 text-[12px] font-code-md text-primary font-bold">
                <AlertCircle className="w-4 h-4" /> Copy your new key now. It won't be shown again!
              </div>
              <div className="flex items-center justify-between bg-surface-container-lowest p-3 rounded-[12px] border border-white/5 font-code-md text-[13px] text-on-surface shadow-inner">
                <span className="truncate mr-4 font-bold">{plainKey}</span>
                <Button
                  onClick={() => copyToClipboard(plainKey, 'key')}
                  className="bg-primary-container hover:bg-primary text-on-primary-container shrink-0 font-code-md text-[12px] h-8 px-4"
                >
                  {copiedKey ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  {copiedKey ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-space-sm pt-2">
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-primary-container hover:bg-primary text-on-primary-container h-11 px-6 font-code-md font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Key className="w-4 h-4" /> {statusData?.hasKey ? 'Regenerate API Key' : 'Generate API Key'}
                </span>
              )}
            </Button>

            {statusData?.hasKey && (
              <Button
                variant="outline"
                onClick={handleRevoke}
                disabled={revoking}
                className="h-11 px-6 font-code-md font-bold text-error border-error/30 hover:bg-error/10 hover:text-error"
              >
                {revoking ? 'Revoking...' : <><Trash2 className="w-4 h-4 mr-2" /> Revoke Key</>}
              </Button>
            )}
          </div>
        </div>

        {/* Code Snippets Section */}
        <div className="bg-surface-container-lowest border border-white/5 rounded-[20px] p-space-lg shadow-sm space-y-space-lg">
          <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface flex items-center gap-2">
            <Code className="w-5 h-5 text-secondary" /> Integration Examples
          </h3>

          {/* cURL Snippet */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-code-md text-[13px] text-secondary font-bold flex items-center gap-2 uppercase tracking-wider">
                <Terminal className="w-4 h-4" /> cURL Command
              </span>
              <Button
                variant="ghost"
                onClick={() => copyToClipboard(curlSnippet, 'curl')}
                className="h-8 px-3 text-[11px] font-code-md font-bold text-on-surface-variant hover:text-on-surface"
              >
                {copiedCurl ? 'Copied!' : 'Copy cURL'}
              </Button>
            </div>
            <pre className="bg-surface-container-low p-space-md rounded-[12px] border border-white/5 font-code-md text-[12px] text-primary overflow-x-auto custom-scrollbar">
              {curlSnippet}
            </pre>
          </div>

          {/* Node.js Snippet */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-code-md text-[13px] text-tertiary font-bold flex items-center gap-2 uppercase tracking-wider">
                <Code className="w-4 h-4" /> Node.js (Axios)
              </span>
              <Button
                variant="ghost"
                onClick={() => copyToClipboard(nodeSnippet, 'node')}
                className="h-8 px-3 text-[11px] font-code-md font-bold text-on-surface-variant hover:text-on-surface"
              >
                {copiedNode ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>
            <pre className="bg-surface-container-low p-space-md rounded-[12px] border border-white/5 font-code-md text-[12px] text-tertiary overflow-x-auto custom-scrollbar">
              {nodeSnippet}
            </pre>
          </div>
        </div>
      </div>
    </MaintenanceGuard>
  )
}
