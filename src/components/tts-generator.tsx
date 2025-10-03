'use client'

import { useState, useEffect, useCallback, useMemo, useTransition } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { Play, Loader2, Key, Settings2, AudioLines, RotateCcw, BadgePlus } from 'lucide-react'
import { play } from '@elevenlabs/elevenlabs-js'
import { Model, Voice } from '@elevenlabs/elevenlabs-js/api/types'
import { LanguageResponse } from '@elevenlabs/elevenlabs-js/api/types/LanguageResponse'

import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { getVoices, getModels, getUserInfoFromApiKey, textToSpeech } from '@/app/action/elevenlabs'
import { ApiKeyInfo } from '@/types/elevenLabs'
import { toastError, toastSuccess } from '@/lib/toast'
import { getAvatarColor, voiceSettingsOptions } from '@/lib/elevenlabs'
import { errorMessage } from '@/lib/response'
import { cn } from '@/lib/utils'
import TTSHistory from './tts-history'

interface TTSFormData {
  text: string
  voice: string
  language: string
  model: string
  stability: number
  similarityBoost: number
  style: number
  useSpeakerBoost: boolean
  speed: number
}

const defaultValues: TTSFormData = {
  text: '',
  voice: '',
  language: 'vi',
  model: '',
  ...voiceSettingsOptions,
}

interface Language extends LanguageResponse {
  flagImage: string
}

interface IVoice extends Voice {
  useCase: string
}

interface States {
  userInfo: ApiKeyInfo | null
  models: Model[]
  voices: IVoice[]
  languages: Language[]
  playSound: boolean
  currentAudio: HTMLAudioElement | null
}

const initialLanguages: Language[] = [
  {
    languageId: 'vi',
    name: 'Vietnamese',
    flagImage: '/flags/vi.svg',
  },
]

const initialStates: States = {
  userInfo: null,
  models: [],
  voices: [],
  languages: initialLanguages,
  playSound: false,
  currentAudio: null,
}

interface TTSGeneratorProps {
  globalApiKey: string
  onApiKeyUpdate: (key: string) => void
}

export default function TTSGenerator({ globalApiKey, onApiKeyUpdate }: TTSGeneratorProps) {
  const [isPending, startTransition] = useTransition()
  const [states, setStates] = useState<States>(initialStates)

  const { userInfo, models, voices, languages, playSound, currentAudio } = states

  const remainingCharacters = useMemo(() => {
    if (!userInfo?.user?.subscription) return 0
    return userInfo?.user?.subscription?.characterLimit - userInfo?.user?.subscription?.characterCount
  }, [userInfo])

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TTSFormData>({
    defaultValues: defaultValues,
    mode: 'onChange',
  })

  const watchedValues = watch()
  const isLoading = isPending || isSubmitting

  const remainingVoices = useMemo(() => {
    return remainingCharacters - watchedValues?.text?.length || 0
  }, [remainingCharacters, watchedValues?.text?.length])

  const selectedModel = useMemo(() => {
    return models.find((m) => m.modelId === watchedValues.model)
  }, [models, watchedValues.model])

  const selectedVoice = useMemo(() => {
    return voices.find((v) => v.voiceId === watchedValues.voice)
  }, [voices, watchedValues.voice])

  const verifiedLanguages = useMemo(() => {
    return selectedVoice?.verifiedLanguages?.find(
      (v) => v.language === watchedValues.language && v.modelId === watchedValues.model
    )
  }, [selectedVoice?.verifiedLanguages, watchedValues.language, watchedValues.model])

  const fetchModels = useCallback(async () => {
    const modelsResult = await getModels()
    if (modelsResult.success && modelsResult.data) {
      setStates((prevStates) => ({
        ...prevStates,
        models: modelsResult.data,
      }))
    }
  }, [])

  useEffect(() => {
    if (globalApiKey && userInfo) {
      fetchModels()
    }
  }, [userInfo, fetchModels, globalApiKey])

  const fetchVoices = useCallback(async () => {
    const voicesResult = await getVoices({ language: watchedValues.language })
    if (voicesResult.success && voicesResult.data) {
      setStates((prevStates) => ({
        ...prevStates,
        voices: voicesResult.data,
      }))
    }
  }, [watchedValues.language])

  useEffect(() => {
    if (globalApiKey && userInfo && models.length > 0) {
      fetchVoices()
    }
  }, [userInfo, models, fetchVoices, globalApiKey])

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }
    }
  }, [currentAudio])

  const getElevenLabs = async () => {
    reset(defaultValues)
    if (!globalApiKey) {
      toastError('Vui lòng nhập API key')
      return
    }

    startTransition(async () => {
      try {
        const userInfo = await getUserInfoFromApiKey(globalApiKey)
        if (!userInfo || !userInfo.isActive) {
          toastError('API key không hợp lệ')
          onApiKeyUpdate('')
          return
        }

        setStates((prevStates) => ({
          ...prevStates,
          userInfo,
        }))
        toastSuccess('API key đã được khởi tạo')
      } catch (error) {
        console.error('Error initializing API key:', error)
        toastError(errorMessage(error) || 'Có lỗi xảy ra khi khởi tạo API key')
      }
    })
  }

  const onSubmit = async (data: TTSFormData) => {
    if (!globalApiKey || !userInfo) {
      toastError('Vui lòng nhập API key và khởi tạo')
      return
    }

    startTransition(async () => {
      try {
        const result = await textToSpeech(data.text, data.voice, data.model, {
          stability: data.stability,
          useSpeakerBoost: data.useSpeakerBoost,
          similarityBoost: data.similarityBoost,
          style: data.style,
          speed: data.speed,
        })

        if (!result.success || !result.data) {
          toastError(result.error || 'Không tạo được giọng nói')
          return
        }

        toastSuccess('Tạo giọng nói thành công!')
        await play(result.data as unknown as AsyncIterable<Uint8Array>)
      } catch (error) {
        console.error('Error generating speech:', error)
        toastError(errorMessage(error) || 'Có lỗi xảy ra khi tạo giọng nói')
      }
    })
  }

  const handlePlaySound = (previewUrl?: string) => {
    if (previewUrl) {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }

      const audio = new Audio(previewUrl)

      setStates((prevStates) => ({
        ...prevStates,
        playSound: true,
        currentAudio: audio,
      }))

      audio.addEventListener('ended', () => {
        setStates((prevStates) => ({
          ...prevStates,
          playSound: false,
          currentAudio: null,
        }))
      })

      audio.addEventListener('error', () => {
        setStates((prevStates) => ({
          ...prevStates,
          playSound: false,
          currentAudio: null,
        }))
      })

      audio.addEventListener('pause', () => {
        setStates((prevStates) => ({
          ...prevStates,
          playSound: false,
          currentAudio: null,
        }))
      })

      audio.play().catch(() => {
        setStates((prevStates) => ({
          ...prevStates,
          playSound: false,
          currentAudio: null,
        }))
      })
    }
  }

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onApiKeyUpdate?.(e.target.value.trim())
  }

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }

    reset(defaultValues, { keepErrors: false })
    setStates((prevStates) => ({
      ...prevStates,
      playSound: false,
      currentAudio: null,
    }))
  }

  const handleModelChange = (value: string) => {
    if (value !== 'placeholder-model') {
      setValue('model', value)
      return
    }

    setValue('voice', '')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <Card className='p-6'>
        <CardHeader className='p-0 pb-4'>
          <CardTitle className='text-lg font-bold flex items-center gap-2'>
            <Key className='h-5 w-5' />
            API Key ElevenLabs
          </CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='flex gap-3 items-center'>
            <Input
              type='password'
              value={globalApiKey}
              onChange={handleApiKeyChange}
              placeholder='Nhập API key của bạn'
              className='flex-1'
            />
            <Button
              type='button'
              onClick={getElevenLabs}
              disabled={!globalApiKey || isLoading}
              className='min-w-[120px]'
            >
              {isLoading ? <Loader2 className='h-4 w-4 mr-2 animate-spin' /> : <BadgePlus className='h-4 w-4 mr-2' />}
              Khởi tạo
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 flex flex-col'>
          <Card className={cn('flex-1', errors.text && 'border border-red-500')}>
            <CardContent className='px-3 py-1 h-full'>
              <div className='flex-1 flex flex-col h-full'>
                <Textarea
                  {...register('text', { required: 'Vui lòng nhập văn bản' })}
                  placeholder='Nhập văn bản của bạn ở đây...'
                  className='flex-1 resize-none border-0 text-lg leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none'
                />
                <div className='flex justify-between items-center my-2 text-xs text-gray-500'>
                  <span>
                    {selectedModel?.maxCharactersRequestFreeUser
                      ? `${watchedValues.text.length.toLocaleString()} / ${selectedModel.maxCharactersRequestFreeUser.toLocaleString()} ký tự`
                      : `${watchedValues.text.length.toLocaleString()} ký tự`}
                  </span>
                  {selectedModel?.maxCharactersRequestFreeUser && (
                    <span
                      className={`font-medium ${
                        watchedValues.text.length > selectedModel.maxCharactersRequestFreeUser
                          ? 'text-red-500'
                          : watchedValues.text.length > selectedModel.maxCharactersRequestFreeUser * 0.8
                            ? 'text-orange-500'
                            : 'text-gray-500'
                      }`}
                    >
                      {watchedValues.text.length > selectedModel.maxCharactersRequestFreeUser
                        ? 'Vượt quá giới hạn'
                        : watchedValues.text.length > selectedModel.maxCharactersRequestFreeUser * 0.8
                          ? 'Gần đạt giới hạn'
                          : `Còn ${remainingVoices.toLocaleString()} ký tự`}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className='relative w-full flex-col gap-5 border-l border-solid border-gray-200 p-6 flex overflow-x-hidden'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Settings2 className='h-4 w-4' />
              <span className='text-sm font-bold text-gray-700'>Cài đặt giọng nói</span>
            </div>
          </div>
          <div className='flex flex-col gap-4'>
            {!userInfo ? (
              <div className='flex items-center justify-center h-32 text-gray-500'>
                <div className='text-center'>
                  <Key className='h-8 w-8 mx-auto mb-2 opacity-50' />
                  <p className='text-sm'>Vui lòng nhập API key để sử dụng</p>
                </div>
              </div>
            ) : (
              <>
                <div className='flex flex-col gap-4'>
                  <div className='text-sm font-medium text-gray-700'>Ngôn ngữ</div>
                  {isLoading ? (
                    <div className='flex items-center justify-center h-10'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                    </div>
                  ) : (
                    <Select
                      value={getValues('language')}
                      onValueChange={(value) => {
                        if (value !== 'placeholder-language') {
                          setValue('language', value)
                        }
                      }}
                      disabled
                    >
                      <SelectTrigger className='h-10 rounded-full px-4'>
                        <div className='flex items-center gap-2'>
                          <SelectValue placeholder='Vui lòng chọn ngôn ngữ' />
                        </div>
                      </SelectTrigger>
                      <SelectContent className='rounded-xl max-h-[200px]'>
                        {languages.map((language) => (
                          <SelectItem key={language.languageId} value={language.languageId}>
                            <div className='flex items-center gap-2'>
                              <Image
                                src={language.flagImage}
                                alt={language.name}
                                width={20}
                                height={20}
                                className='rounded-full'
                              />
                              <span className='truncate font-bold'>{language.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className='flex flex-col gap-4'>
                  <div className='text-sm font-medium text-gray-700'>Model</div>
                  {isLoading ? (
                    <div className='flex items-center justify-center h-10'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                    </div>
                  ) : (
                    <Select value={getValues('model')} onValueChange={(value) => handleModelChange(value)}>
                      <SelectTrigger className='h-10 rounded-full px-4'>
                        <div className='flex items-center gap-2'>
                          <SelectValue placeholder='Vui lòng chọn model' />
                        </div>
                      </SelectTrigger>
                      <SelectContent className='rounded-xl max-h-[300px]'>
                        <SelectItem value='placeholder-model' disabled>
                          <div className='font-medium text-gray-500'>Vui lòng chọn model</div>
                        </SelectItem>
                        {models.map((model) => (
                          <SelectItem key={model.modelId} value={model.modelId}>
                            <div className='flex flex-col'>
                              <div className='font-medium'>{model.name}</div>
                              <div className='flex items-center gap-2 text-xs text-gray-500'>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    model.servesProVoices ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {model.servesProVoices ? 'Pro' : 'Free'}
                                </span>
                                <span>
                                  {model.maxCharactersRequestFreeUser
                                    ? `${model.maxCharactersRequestFreeUser.toLocaleString()} chars`
                                    : 'Unlimited chars'}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className='flex flex-col gap-4'>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='text-sm font-medium text-gray-700'>Giọng nói</div>
                    {verifiedLanguages && (
                      <Button
                        type='button'
                        variant='ghost'
                        onClick={() => handlePlaySound(verifiedLanguages?.previewUrl)}
                        disabled={isLoading}
                        className='gap-0 hover:bg-transparent'
                      >
                        {playSound ? (
                          <Image src='/gifs/play-sound.gif' alt='play' width={50} height={50} />
                        ) : (
                          <>
                            <AudioLines className='h-4 w-4' />
                            <AudioLines className='h-4 w-4' />
                            <AudioLines className='h-4 w-4' />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {isLoading ? (
                    <div className='flex items-center justify-center h-10'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                    </div>
                  ) : (
                    <Select
                      value={getValues('voice')}
                      onValueChange={(value) => {
                        if (value !== 'placeholder-voice') {
                          setValue('voice', value)
                        }
                      }}
                      disabled={!watchedValues.model}
                    >
                      <SelectTrigger className='h-10 rounded-full px-4'>
                        <div className='flex items-center gap-2 w-full min-w-0'>
                          {selectedVoice ? (
                            <div className='flex items-center gap-2 w-full min-w-0'>
                              <span
                                className={`w-5 h-5 rounded-full ${getAvatarColor(
                                  selectedVoice.voiceId
                                )} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                              ></span>
                              <div className='flex flex-col min-w-0 flex-1 text-left'>
                                <span className='truncate font-bold text-sm text-left'>{selectedVoice.name}</span>
                                <span className='truncate text-xs text-gray-500 text-left'>
                                  {selectedVoice.useCase}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <SelectValue placeholder='Vui lòng chọn giọng nói' />
                          )}
                        </div>
                      </SelectTrigger>
                      <SelectContent className='rounded-xl max-h-[300px]'>
                        <SelectItem value='placeholder-voice' disabled>
                          <div className='flex items-center gap-3'>
                            <div className='w-5 h-5 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center text-xs'>
                              ?
                            </div>
                            <span className='truncate font-bold text-gray-500'>Vui lòng chọn giọng nói</span>
                          </div>
                        </SelectItem>
                        {voices.map((voice) => (
                          <SelectItem key={voice.voiceId} value={voice.voiceId}>
                            <div className='flex items-center gap-2 w-full min-w-0'>
                              <span
                                className={`w-5 h-5 rounded-full ${getAvatarColor(
                                  voice.voiceId
                                )} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                              ></span>
                              <div className='flex flex-col min-w-0 flex-1 text-left'>
                                <span className='truncate font-bold text-sm text-left'>{voice.name}</span>
                                <span className='truncate text-xs text-gray-500 text-left'>{voice.useCase}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Accordion type='single' collapsible className='w-full'>
                  <AccordionItem value='advanced-settings' className='border-none'>
                    <AccordionTrigger className='text-sm font-medium text-gray-700 hover:no-underline py-2 cursor-pointer'>
                      Cài đặt nâng cao
                    </AccordionTrigger>
                    <AccordionContent className='space-y-4 pt-4'>
                      <div className='flex flex-col gap-3'>
                        <div className='text-sm font-medium text-gray-700'>
                          Tốc độ ({getValues('speed').toFixed(2)})
                        </div>
                        {isLoading ? (
                          <div className='flex items-center justify-center h-10'>
                            <Loader2 className='h-4 w-4 animate-spin' />
                          </div>
                        ) : (
                          <div className='relative flex flex-col w-full touch-none select-none items-center gap-2'>
                            <Slider
                              value={[getValues('speed')]}
                              onValueChange={(value) => setValue('speed', value[0])}
                              max={1.2}
                              min={0.7}
                              step={0.01}
                              className='w-full'
                            />
                            <small className='text-xs text-gray-500'>
                              (Điều chỉnh tốc độ của giọng nói. Giá trị 1.0 là tốc độ mặc định, các giá trị nhỏ hơn 1.0
                              làm chậm lời nói, và các giá trị lớn hơn 1.0 làm nhanh hơn.)
                            </small>
                          </div>
                        )}
                      </div>
                      <div className='flex flex-col gap-3'>
                        <div className='text-sm font-medium text-gray-700'>
                          Độ ổn định ({getValues('stability').toFixed(2)})
                        </div>
                        {isLoading ? (
                          <div className='flex items-center justify-center h-10'>
                            <Loader2 className='h-4 w-4 animate-spin' />
                          </div>
                        ) : (
                          <div className='relative flex flex-col w-full touch-none select-none items-center gap-2'>
                            <Slider
                              value={[getValues('stability')]}
                              onValueChange={(value) => setValue('stability', value[0])}
                              max={1}
                              min={0}
                              step={0.01}
                              className='w-full'
                            />
                            <small className='text-xs text-gray-500'>
                              (Xác định độ ổn định của giọng nói và tính ngẫu nhiên giữa các lần tạo. Giá trị thấp hơn
                              tạo ra phạm vi cảm xúc rộng hơn cho giọng nói. Giá trị cao hơn có thể dẫn đến giọng nói
                              đơn điệu với cảm xúc hạn chế.)
                            </small>
                          </div>
                        )}
                      </div>
                      <div className='flex flex-col gap-3'>
                        <div className='text-sm font-medium text-gray-700'>
                          Độ tương đồng ({getValues('similarityBoost').toFixed(2)})
                        </div>
                        {isLoading ? (
                          <div className='flex items-center justify-center h-10'>
                            <Loader2 className='h-4 w-4 animate-spin' />
                          </div>
                        ) : (
                          <div className='relative flex flex-col w-full touch-none select-none gap-2'>
                            <Slider
                              value={[getValues('similarityBoost')]}
                              onValueChange={(value) => setValue('similarityBoost', value[0])}
                              max={1}
                              min={0}
                              step={0.01}
                              className='w-full'
                            />
                            <small className='text-xs text-gray-500'>
                              (Xác định mức độ AI nên tuân thủ giọng nói gốc khi cố gắng tái tạo nó.)
                            </small>
                          </div>
                        )}
                      </div>
                      <div className='flex flex-col gap-3'>
                        <div className='text-sm font-medium text-gray-700'>
                          Phong cách ({getValues('style').toFixed(2)})
                        </div>
                        {isLoading ? (
                          <div className='flex items-center justify-center h-10'>
                            <Loader2 className='h-4 w-4 animate-spin' />
                          </div>
                        ) : (
                          <div className='relative flex flex-col w-full touch-none select-none items-center gap-2'>
                            <Slider
                              value={[getValues('style')]}
                              onValueChange={(value) => setValue('style', value[0])}
                              max={1}
                              min={0}
                              step={0.01}
                              className='w-full'
                              disabled={!selectedModel?.canUseStyle}
                            />
                            <small className='text-xs text-gray-500'>
                              (Xác định mức độ phóng đại phong cách của giọng nói. Cài đặt này cố gắng khuếch đại phong
                              cách của người nói gốc. Nó tiêu tốn thêm tài nguyên tính toán và có thể tăng độ trễ nếu
                              được đặt thành giá trị khác 0.)
                            </small>
                          </div>
                        )}
                      </div>
                      <div className='space-y-4'>
                        <div className='flex flex-col space-x-2 gap-2'>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              checked={getValues('useSpeakerBoost')}
                              onCheckedChange={(checked) => setValue('useSpeakerBoost', checked as boolean)}
                              id='useSpeakerBoost'
                              className='rounded border-gray-300'
                            />
                            <Label htmlFor='useSpeakerBoost' className='text-sm font-medium'>
                              Sử dụng Speaker Boost
                            </Label>
                          </div>
                          <small className='text-xs text-gray-500'>
                            (Cài đặt này tăng cường sự tương đồng với người nói gốc. Sử dụng cài đặt này yêu cầu tải
                            tính toán cao hơn một chút, điều này làm tăng độ trễ.)
                          </small>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className='flex gap-3 mt-auto'>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full h-10 rounded-full'
                    disabled={isLoading || !userInfo}
                    onClick={handleReset}
                  >
                    <div className='flex items-center gap-2'>
                      {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <RotateCcw className='h-4 w-4' />} Đặt
                      lại
                    </div>
                  </Button>
                  <Button
                    type='submit'
                    className='w-full h-10 rounded-full bg-black text-white hover:bg-gray-800'
                    disabled={isLoading || !userInfo}
                  >
                    <div className='flex items-center gap-2'>
                      {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Play className='h-4 w-4' />}
                      {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
                      Tạo
                    </div>
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
      <TTSHistory userInfo={userInfo} models={models} />
    </form>
  )
}
