export const BRAND_NAME = 'ThuNguyenIT'

export const MOBILE_NUMBER = '0359399320'

export const FACEBOOK_URL = 'https://www.facebook.com/Jely.Big'

export const ZALO_URL = 'https://zalo.me/0359399320'

export const VOICE_USE_CASES = [
  'informative_educational',
  'entertainment_tv',
  'narrative_story',
  'conversational',
  'social_media',
  'advertisement',
] as const

export const VOICE_USE_CASE_LABELS: Record<string, string> = {
  [VOICE_USE_CASES[0]]: 'Giáo dục & Thông tin',
  [VOICE_USE_CASES[1]]: 'Giải trí & Truyền hình',
  [VOICE_USE_CASES[2]]: 'Kể chuyện & Trần thuật',
  [VOICE_USE_CASES[3]]: 'Hội thoại',
  [VOICE_USE_CASES[4]]: 'Mạng xã hội',
  [VOICE_USE_CASES[5]]: 'Quảng cáo',
}
