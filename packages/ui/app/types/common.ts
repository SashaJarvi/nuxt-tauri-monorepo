// Common shared types across all apps

export type Platform = 'web' | 'desktop' | 'mobile'

export interface AppConfig {
  apiBaseUrl: string
  platform: Platform
}
