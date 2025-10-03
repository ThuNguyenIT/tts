import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { SubscriptionExtrasResponseModel } from '@elevenlabs/elevenlabs-js/api/types/SubscriptionExtrasResponseModel'
import { SubscriptionResponse } from '@elevenlabs/elevenlabs-js/api/types/SubscriptionResponse'
import { VOICE_USE_CASES } from '@/constants/common'

export type VoiceUseCase = (typeof VOICE_USE_CASES)[number]

interface ElevenLabsUser {
  userId: string
  subscription: SubscriptionResponse
  subscriptionExtras?: SubscriptionExtrasResponseModel
  isNewUser: boolean
  xiApiKey?: string
  canUseDelayedPaymentMethods: boolean
  isOnboardingCompleted: boolean
  isOnboardingChecklistCompleted: boolean
  firstName?: string
  isApiKeyHashed?: boolean
  xiApiKeyPreview?: string
  referralLinkCode?: string
  partnerstackPartnerDefaultLink?: string
  createdAt: number
}

export interface ApiKeyInfo {
  key: string
  isActive: boolean
  client?: ElevenLabsClient
  user?: ElevenLabsUser
}
