import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { GetSpeechHistoryResponse, VoiceSettings, VoicesGetSharedRequest } from '@elevenlabs/elevenlabs-js/api'

import { ApiKeyInfo } from '@/types/elevenLabs'
import { voiceSettingsOptions, voicesOptions } from '@/lib/elevenlabs'
import { errorMessage } from '@/lib/response'
import { VOICE_USE_CASE_LABELS } from '@/constants/common'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination'

interface ElevenLabsError {
  detail?: {
    message?: string
    status?: string
  }
  body?: {
    detail?: {
      message?: string
      status?: string
    }
  }
}

let apiKeysInfo: ApiKeyInfo[] = []
let clientGlobal: ElevenLabsClient | null = null

async function initElevenLabsClient(apiKey: string): Promise<ElevenLabsClient> {
  const client = new ElevenLabsClient({
    apiKey: apiKey,
  })

  return client
}

async function getUserInfo(client: ElevenLabsClient, apiKey: string): Promise<ApiKeyInfo> {
  try {
    const user = await client.user.get()
    return { key: apiKey, isActive: true, client, user }
  } catch (error) {
    console.error('Error fetching user info:', error)
    return { key: apiKey, isActive: false }
  }
}

export async function initializeApiKeys(apiKeys: string[]) {
  try {
    apiKeysInfo = []

    for (const apiKey of apiKeys) {
      try {
        const elevenLabsClient = await initElevenLabsClient(apiKey)
        const userInfo = await getUserInfo(elevenLabsClient, apiKey)
        apiKeysInfo.push(userInfo)
      } catch (error) {
        console.error(`Error initializing API KEY ${apiKey.substring(0, 8)}...:`, error)
        apiKeysInfo.push({ key: apiKey, isActive: false })
      }
    }

    apiKeysInfo.sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0))

    return apiKeysInfo
  } catch (error) {
    console.error('Error initializing API KEYS:', error)
    return []
  }
}

export async function getUserInfoFromApiKey(apiKey: string) {
  try {
    const elevenLabsClient = await initElevenLabsClient(apiKey)
    clientGlobal = elevenLabsClient
    const userInfo = await getUserInfo(elevenLabsClient, apiKey)
    return userInfo.isActive ? userInfo : { key: apiKey, isActive: false }
  } catch (error) {
    console.error('Error initializing API KEYS:', error)
    return { key: apiKey, isActive: false }
  }
}

export async function getModels(language: string = 'vi') {
  try {
    if (!clientGlobal) {
      return {
        success: false,
        error: 'API KEY không khả dụng',
      }
    }

    const models = await clientGlobal.models.list()
    const filteredModels = models.filter((model) => model.languages?.some((lang) => lang.languageId === language))

    return {
      success: true,
      data: filteredModels,
    }
  } catch (error) {
    console.error('Error fetching models:', error)
    const elevenLabsError = error as ElevenLabsError
    const message =
      elevenLabsError?.detail?.message ||
      elevenLabsError?.body?.detail?.message ||
      errorMessage(error) ||
      'Đã có lỗi xãy ra'

    return {
      success: false,
      error: message,
    }
  }
}

export async function getVoices(options: VoicesGetSharedRequest) {
  try {
    if (!clientGlobal) {
      return {
        success: false,
        error: 'API KEY không khả dụng',
      }
    }

    const optionsRequest = {
      ...voicesOptions,
      ...options,
    }
    const listVoices = await clientGlobal.voices.getShared(optionsRequest)

    const filteredVoices = listVoices?.voices?.map((voice) => {
      return {
        ...voice,
        useCase: VOICE_USE_CASE_LABELS[voice.useCase],
      }
    })

    return {
      success: true,
      data: filteredVoices,
    }
  } catch (error) {
    console.error('Error fetching voices:', error)
    const elevenLabsError = error as ElevenLabsError
    const message =
      elevenLabsError?.detail?.message ||
      elevenLabsError?.body?.detail?.message ||
      errorMessage(error) ||
      'Đã có lỗi xãy ra'

    return {
      success: false,
      error: message,
    }
  }
}

export async function textToSpeech(text: string, voiceId: string, modelId: string, voiceSettings?: VoiceSettings) {
  try {
    if (!clientGlobal) {
      return {
        success: false,
        error: 'API KEY không khả dụng',
      }
    }

    const audio: ReadableStream<Uint8Array> = await clientGlobal.textToSpeech.convert(voiceId, {
      text: text,
      modelId: modelId,
      voiceSettings: voiceSettings || voiceSettingsOptions,
      outputFormat: 'mp3_44100_128',
    })

    return {
      success: true,
      data: audio,
    }
  } catch (error) {
    console.error('Error generating speech:', error)
    const elevenLabsError = error as ElevenLabsError
    const message =
      elevenLabsError?.detail?.message ||
      elevenLabsError?.body?.detail?.message ||
      errorMessage(error) ||
      'Đã có lỗi xãy ra'

    return {
      success: false,
      error: message,
    }
  }
}

export async function getHistory(pageSize: number = DEFAULT_PAGE_SIZE) {
  try {
    if (!clientGlobal) {
      return {
        success: false,
        error: 'API KEY không khả dụng',
      }
    }

    const history: GetSpeechHistoryResponse = await clientGlobal.history.list({
      pageSize: pageSize,
      source: 'TTS',
      sortDirection: 'desc',
    })

    return {
      success: true,
      data: history,
    }
  } catch (error) {
    console.error('Error fetching history:', error)
    const elevenLabsError = error as ElevenLabsError
    const message =
      elevenLabsError?.detail?.message ||
      elevenLabsError?.body?.detail?.message ||
      errorMessage(error) ||
      'Đã có lỗi xãy ra'

    return {
      success: false,
      error: message,
    }
  }
}

export async function getAudioHistoryItem(historyItemId: string) {
  try {
    if (!clientGlobal) {
      return {
        success: false,
        error: 'API KEY không khả dụng',
      }
    }

    const audioStream: ReadableStream<Uint8Array> = await clientGlobal.history.getAudio(historyItemId)
    const response = new Response(audioStream)
    const arrayBuffer = await response.arrayBuffer()

    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' })
    const audioUrl = URL.createObjectURL(blob)

    return {
      success: true,
      data: {
        audioUrl,
        blob,
        arrayBuffer: new Uint8Array(arrayBuffer),
      },
    }
  } catch (error) {
    console.error('Error getting audio history item:', error)
    const elevenLabsError = error as ElevenLabsError
    const message =
      elevenLabsError?.detail?.message ||
      elevenLabsError?.body?.detail?.message ||
      errorMessage(error) ||
      'Đã có lỗi xãy ra'

    return {
      success: false,
      error: message,
    }
  }
}

export function resetClients() {
  apiKeysInfo = []
  clientGlobal = null
}
