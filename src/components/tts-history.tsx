'use client'

import { useState, useEffect, useCallback, useTransition, useMemo } from 'react'
import { Play, Pause, Download, Info, Loader2, Clock, RefreshCw } from 'lucide-react'
import { GetSpeechHistoryResponse, Model } from '@elevenlabs/elevenlabs-js/api'

import { ApiKeyInfo } from '@/types/elevenLabs'
import { getAudioHistoryItem, getHistory } from '@/app/action/elevenlabs'
import { toastError } from '@/lib/toast'
import { usePaginate } from '@/hooks'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { PaginationWithHook } from '@/components/pagination/pagination-with-hook'
import { errorMessage } from '@/lib/response'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination'

interface TTSHistoryProps {
  userInfo: ApiKeyInfo | null
  models: Model[]
}

interface HistoryItemProps {
  item: GetSpeechHistoryResponse['history'][0]
  models: Model[]
  playingId: string | null
  onPlayPause: (e: React.MouseEvent, historyItemId: string) => void
  onDownload: (e: React.MouseEvent, historyItemId: string) => void
}

function HistoryItem({ item, models, playingId, onPlayPause, onDownload }: HistoryItemProps) {
  const modelName = useMemo(() => {
    if (!models || !item?.modelId) return 'Không xác định'
    const model = models?.find((m) => m.modelId === item?.modelId)
    return model?.name || item?.modelId || 'Không xác định'
  }, [models, item?.modelId])

  const formatDate = (dateUnix: number) => {
    const date = new Date(dateUnix * 1000)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className='border border-gray-200'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-2'>
              <Badge variant='secondary' className='text-xs'>
                {item?.voiceName || item?.dialogue?.[0]?.voiceName || ''}
              </Badge>
              <Badge variant='outline' className='text-xs'>
                {modelName}
              </Badge>
              <span className='text-xs text-gray-500'>
                {item.characterCountChangeTo - item.characterCountChangeFrom} ký tự
              </span>
            </div>
            <p className='text-sm text-gray-700 mb-2 truncate max-w-ful'>
              {item?.text || item?.dialogue?.[0]?.text || ''}
            </p>
            <div className='flex items-center gap-4 text-xs text-gray-500'>
              <span className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                {formatDate(item.dateUnix)}
              </span>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={(e) => onPlayPause(e, item.historyItemId)}
              disabled={!item.historyItemId}
            >
              {playingId === item.historyItemId ? <Pause className='h-4 w-4' /> : <Play className='h-4 w-4' />}
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={(e) => onDownload(e, item.historyItemId)}
              disabled={!item.historyItemId}
            >
              <Download className='h-4 w-4' />
            </Button>
          </div>
        </div>
        <Accordion type='single' collapsible className='mt-3'>
          <AccordionItem value={`details-${item.historyItemId}`} className='border-none'>
            <AccordionTrigger className='text-xs text-gray-600 hover:no-underline py-1 cursor-pointer'>
              <div className='flex items-center gap-1'>
                <Info className='h-3 w-3' />
                Chi tiết
              </div>
            </AccordionTrigger>
            <AccordionContent className='pt-2'>
              <div className='space-y-2 text-xs'>
                <div>
                  <strong>Văn bản:</strong>
                  <p className='text-gray-700 mt-1 p-2 bg-gray-50 rounded'>
                    {item?.text || item?.dialogue?.[0]?.text || ''}
                  </p>
                </div>
                <div>
                  <strong>Cài đặt:</strong>
                  <div className='grid grid-cols-5 gap-2 mt-1 text-gray-600'>
                    <span>
                      Tốc độ: {typeof item.settings?.speed === 'number' ? item.settings.speed.toFixed(2) : ''}
                    </span>
                    <span>
                      Độ ổn định:{' '}
                      {typeof item.settings?.stability === 'number' ? item.settings.stability.toFixed(2) : ''}
                    </span>
                    <span>
                      Độ tương đồng:{' '}
                      {typeof item.settings?.similarityBoost === 'number'
                        ? item.settings.similarityBoost.toFixed(2)
                        : ''}
                    </span>
                    <span>
                      Phong cách: {typeof item.settings?.style === 'number' ? item.settings.style.toFixed(2) : ''}
                    </span>
                    <span>Speaker Boost: {item.settings?.useSpeakerBoost ? 'Có' : 'Không'}</span>
                  </div>
                </div>

                {item.feedback && (
                  <div>
                    <strong>Feedback:</strong>
                    <div className='mt-1 text-gray-600'>
                      <span>Thumbs up: {item.feedback.thumbsUp ? 'Có' : 'Không'}</span>
                      {item.feedback.feedback && <p className='mt-1'>{item.feedback.feedback}</p>}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}

export default function TTSHistory({ userInfo, models }: TTSHistoryProps) {
  const [isPending, startTransition] = useTransition()
  const [historyItems, setHistoryItems] = useState<GetSpeechHistoryResponse | null>(null)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioBlobs, setAudioBlobs] = useState<Record<string, Blob>>({})

  const pagination = usePaginate(historyItems?.history || [], {
    initialPageSize: DEFAULT_PAGE_SIZE,
    initialPageIndex: 0,
  })

  const fetchHistory = useCallback(
    async (e?: React.MouseEvent) => {
      e?.preventDefault()
      e?.stopPropagation()

      if (!userInfo) return

      startTransition(async () => {
        try {
          const result = await getHistory()
          if (result.success && result.data) {
            setHistoryItems(result.data)
          } else {
            toastError(result.error || 'Không thể tải lịch sử')
          }
        } catch (error) {
          console.error('Error fetching history:', error)
          toastError(errorMessage(error) || 'Có lỗi xảy ra khi tải lịch sử')
        }
      })
    },
    [userInfo]
  )

  useEffect(() => {
    if (!userInfo) return
    fetchHistory()
  }, [fetchHistory, userInfo])

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }
    }
  }, [currentAudio])

  const handlePlayPause = async (e: React.MouseEvent, historyItemId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!historyItemId) {
      toastError('Không có audio để phát')
      return
    }

    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
      setPlayingId(null)
    }

    if (playingId === historyItemId) {
      setPlayingId(null)
      return
    }

    try {
      let blob = audioBlobs[historyItemId]

      if (!blob) {
        const result = await getAudioHistoryItem(historyItemId)
        if (!result.success || !result.data) {
          toastError(result.error || 'Không thể tải audio')
          return
        }

        blob = result.data.blob
        setAudioBlobs((prev) => ({ ...prev, [historyItemId]: blob }))
      }

      const audioUrl = URL.createObjectURL(blob)
      const audio = new Audio(audioUrl)
      setCurrentAudio(audio)
      setPlayingId(historyItemId)

      audio.addEventListener('ended', () => {
        setPlayingId(null)
        setCurrentAudio(null)
        URL.revokeObjectURL(audioUrl)
      })

      audio.addEventListener('error', () => {
        toastError('Lỗi phát audio')
        setPlayingId(null)
        setCurrentAudio(null)
        URL.revokeObjectURL(audioUrl)
      })

      await audio.play()
    } catch (error) {
      console.error('Error playing audio:', error)
      toastError('Không thể phát audio')
      setPlayingId(null)
      setCurrentAudio(null)
    }
  }

  const handleDownload = async (e: React.MouseEvent, historyItemId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!historyItemId) {
      toastError('Vui lòng chọn 1 TTS để tải về')
      return
    }

    let blob = audioBlobs[historyItemId]

    if (!blob) {
      const result = await getAudioHistoryItem(historyItemId)
      if (!result.success || !result.data) {
        toastError(result.error || 'Không thể tải audio')
        return
      }
      blob = result.data.blob
      setAudioBlobs((prev) => ({ ...prev, [historyItemId]: blob }))
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${historyItemId}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  const isLoading = isPending

  return (
    <Card className='w-full'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <CardTitle className='text-lg font-bold flex items-center gap-2'>
              <Clock className='h-5 w-5' />
              Lịch sử TTS
            </CardTitle>
            {historyItems?.history.length && historyItems.history.length > 0 && (
              <span className='text-sm text-gray-500'>({pagination.paginationInfo.totalItems} items)</span>
            )}
          </div>
          {historyItems?.history.length && (
            <Button type='button' size='sm' onClick={(e) => fetchHistory(e)} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <>
                  <RefreshCw className='h-4 w-4' />
                  Làm mới
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex items-center justify-center h-32'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        ) : historyItems?.history.length === 0 ? (
          <div className='text-center text-gray-500 py-8'>
            <Clock className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p>Chưa có lịch sử TTS nào</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {pagination.paginatedData.map((item) => (
              <HistoryItem
                key={item.historyItemId}
                item={item}
                models={models}
                playingId={playingId}
                onPlayPause={handlePlayPause}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </CardContent>
      {historyItems?.history.length && historyItems.history.length > 0 && (
        <div className='px-6 pb-6'>
          <PaginationWithHook pagination={pagination} />
        </div>
      )}
    </Card>
  )
}
