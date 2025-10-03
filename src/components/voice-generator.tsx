'use client'

import { useState } from 'react'
import { Settings, Mic } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ApiKeysManager from '@/components/api-keys-manager'
import TTSGenerator from '@/components/tts-generator'
import { ApiKeyInfo } from '@/types/elevenLabs'

export default function VoiceGenerator() {
  const [apiKeys, setApiKeys] = useState<string[]>([])
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyInfo[]>([])
  const [apiKey, setApiKey] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>('tts')

  const handleApiKeysUpdate = (keys: string[]) => {
    setApiKeys(keys)
  }

  const handleApiKeyStatusUpdate = (status: ApiKeyInfo[]) => {
    setApiKeyStatus(status)
  }

  const handleApiKeyUpdate = (key: string) => {
    setApiKey(key)
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='tts' className='flex items-center gap-2 cursor-pointer text-center'>
              <Mic className='h-4 w-4 flex-shrink-0' />
              <span className='break-words'>
                Tạo giọng nói <br className='sm:hidden' />
                (ElevenLabs)
              </span>
            </TabsTrigger>
            <TabsTrigger value='api-keys' className='flex items-center gap-2 cursor-pointer text-center'>
              <Settings className='h-4 w-4 flex-shrink-0' />
              <span className='break-words'>
                Tra cứu API Keys <br className='sm:hidden' />
                (ElevenLabs)
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className='space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)] pb-6'>
          <div className={activeTab === 'api-keys' ? 'block' : 'hidden'}>
            <ApiKeysManager
              onApiKeysUpdate={handleApiKeysUpdate}
              onApiKeyStatusUpdate={handleApiKeyStatusUpdate}
              initialApiKeys={apiKeys}
              initialApiKeyStatus={apiKeyStatus}
            />
          </div>
          <div className={activeTab === 'tts' ? 'block' : 'hidden'}>
            <TTSGenerator globalApiKey={apiKey} onApiKeyUpdate={handleApiKeyUpdate} />
          </div>
        </div>
      </div>
    </div>
  )
}
