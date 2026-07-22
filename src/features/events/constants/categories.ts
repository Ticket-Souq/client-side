export const CATEGORIES = [
  'Music',
  'Sports',
  'Theatre',
  'Conference',
  'Food',
  'Arts',
  'Family',
  'Comedy',
  'Expo',
  'Jazz',
] as const

export type Category = typeof CATEGORIES[number]
