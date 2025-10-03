'use client'

import { useState, useEffect } from 'react'
import { CircleCheck, Loader2, Ban, Copy, CircleX, Search, Plus, Minus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { initializeApiKeys, resetClients } from '@/app/action/elevenlabs'
import { ApiKeyInfo } from '@/types/elevenLabs'
import { toastError, toastSuccess } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { errorMessage } from '@/lib/response'

interface ApiKeysManagerProps {
  onApiKeysUpdate: (keys: string[]) => void
  onApiKeyStatusUpdate: (status: ApiKeyInfo[]) => void
  initialApiKeys: string[]
  initialApiKeyStatus: ApiKeyInfo[]
}

export default function ApiKeysManager({
  onApiKeysUpdate,
  onApiKeyStatusUpdate,
  initialApiKeys,
  initialApiKeyStatus,
}: ApiKeysManagerProps) {
  const [apiKeys, setApiKeys] = useState<string[]>(initialApiKeys)
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyInfo[]>(initialApiKeyStatus)
  const [newApiKey, setNewApiKey] = useState('')
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    setApiKeys(initialApiKeys)
  }, [initialApiKeys])

  useEffect(() => {
    setApiKeyStatus(initialApiKeyStatus)
  }, [initialApiKeyStatus])

  const initializeKeys = async () => {
    if (apiKeys.length === 0) {
      toastError('Vui lòng thêm ít nhất một API key')
      return
    }

    setIsInitializing(true)
    try {
      const result = await initializeApiKeys(apiKeys)
      setApiKeyStatus(result)
      onApiKeyStatusUpdate(result)
    } catch (error) {
      console.error('Error initializing API keys:', error)
      toastError(errorMessage(error) || 'Có lỗi xảy ra khi khởi tạo API keys')
    } finally {
      setIsInitializing(false)
    }
  }

  const addApiKey = () => {
    if (!newApiKey.trim()) return

    const keys = newApiKey
      .split(/[\n\s,]+/)
      .map((key) => key.trim())
      .filter((key) => key.length > 0)

    const newKeys = keys.filter((key) => !apiKeys.includes(key))

    if (newKeys.length) {
      const updatedKeys = [...apiKeys, ...newKeys]
      setApiKeys(updatedKeys)
      onApiKeysUpdate(updatedKeys)
      setNewApiKey('')
    }
  }

  const removeApiKey = (index: number) => {
    const newKeys = apiKeys.filter((_, i) => i !== index)
    setApiKeys(newKeys)
    onApiKeysUpdate(newKeys)
    if (newKeys.length === 0) {
      resetClients()
      setApiKeyStatus([])
      onApiKeyStatusUpdate([])
    }
  }

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toastSuccess('API key đã được copy')
  }

  const clearApiKeys = () => {
    setApiKeys([])
    onApiKeysUpdate([])
    setApiKeyStatus([])
    onApiKeyStatusUpdate([])
    setNewApiKey('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg font-bold'>Tra cứu API Keys</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex flex-col items-center gap-4'>
          <Textarea
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.target.value)}
            placeholder='Nhập API key, mỗi API key là một dòng hoặc được ngăn cách bởi dấu cách (Space) hoặc dấu phẩy (,)'
            rows={3}
          />
          <div className='flex justify-between gap-2'>
            <Button onClick={clearApiKeys} disabled={!apiKeys.length}>
              <Minus className='w-4 h-4 mr-2' /> Xóa
            </Button>
            <Button variant='outline' onClick={addApiKey} disabled={!newApiKey.trim()}>
              <Plus className='w-4 h-4 mr-2' /> Thêm
            </Button>
          </div>
        </div>
        <div className='space-y-2'>
          <h4 className='font-medium'>Danh sách API Keys đã thêm</h4>
          {apiKeys.length ? (
            apiKeys.map((key, index) => (
              <div key={index} className='flex items-center justify-between p-2 bg-gray-100 rounded'>
                <span className='font-mono text-sm font-medium truncate max-w-[120px]' title={key}>
                  {key}
                </span>
                <Button variant='outline' size='sm' onClick={() => removeApiKey(index)}>
                  <CircleX className='w-4 h-4 text-red-500' /> Xóa
                </Button>
              </div>
            ))
          ) : (
            <Skeleton className='w-full h-20' />
          )}
        </div>
        <div className='flex justify-center'>
          <Button
            variant='outline'
            onClick={initializeKeys}
            disabled={apiKeys.length === 0 || isInitializing}
            className='w-42 h-10'
          >
            {isInitializing ? <Loader2 className='h-4 w-4 mr-2 animate-spin' /> : <Search className='w-4 h-4 mr-2' />}
            Tra cứu
          </Button>
        </div>
        {apiKeyStatus.length > 0 && (
          <div className='space-y-2'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {apiKeyStatus.map((status, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    status.isActive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <div className='font-mono text-sm font-medium truncate max-w-[120px]' title={status.key}>
                        {status.key}
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          status.user?.subscription.tier === 'free'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {status.user?.subscription.tier.toUpperCase() || 'N/A'}
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <div className='text-xs text-gray-600'>
                        Credits: {status.user?.subscription.characterCount.toLocaleString() || 0} /{' '}
                        {status.user?.subscription.characterLimit.toLocaleString() || 0}
                      </div>
                      <div className='text-xs text-gray-600'>
                        Voices: {status.user?.subscription.voiceSlotsUsed || 0} /{' '}
                        {status.user?.subscription.voiceLimit || 0}
                      </div>
                      <div className='text-xs text-gray-600'>
                        Pro Voices: {status.user?.subscription.professionalVoiceSlotsUsed || 0} /{' '}
                        {status.user?.subscription.professionalVoiceLimit || 0}
                      </div>
                      <div className='text-xs text-gray-600'>
                        Làm mới vào:{' '}
                        {status.user?.subscription.nextCharacterCountResetUnix
                          ? new Date(status.user?.subscription.nextCharacterCountResetUnix * 1000).toLocaleDateString(
                              'vi-VN'
                            )
                          : 'N/A'}
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div
                        className={cn(
                          'flex items-center gap-1 text-xs font-medium',
                          status.isActive ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {status.isActive ? (
                          <>
                            <CircleCheck className='w-4 h-4' /> Hoạt động
                          </>
                        ) : (
                          <>
                            <Ban className='w-4 h-4' /> Không hoạt động
                          </>
                        )}
                      </div>
                    </div>
                    {status.user && (
                      <div className='flex items-center justify-end'>
                        <div className='flex items-center gap-1'>
                          <div
                            className='text-xs text-blue-600 font-medium cursor-pointer'
                            onClick={() => copyApiKey(status.key)}
                          >
                            <Copy className='w-4 h-4' />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
