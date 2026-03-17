// API Configuration for OpenAI-compatible endpoints
export interface APIConfig {
  endpoint: string
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
}

const DEFAULT_CONFIG: APIConfig = {
  endpoint: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2048,
}

const STORAGE_KEY = 'biasmapper_api_config'

export function getAPIConfig(): APIConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Failed to load API config:', e)
  }
  return DEFAULT_CONFIG
}

export function saveAPIConfig(config: Partial<APIConfig>): void {
  if (typeof window === 'undefined') return
  
  try {
    const current = getAPIConfig()
    const updated = { ...current, ...config }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('Failed to save API config:', e)
  }
}

export function clearAPIConfig(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function isAPIConfigured(): boolean {
  const config = getAPIConfig()
  return !!(config.apiKey && config.endpoint)
}

// Predefined endpoints
export const PREDEFINED_ENDPOINTS = [
  { name: 'OpenAI', endpoint: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { name: 'Ollama (Local)', endpoint: 'http://localhost:11434/v1', models: ['llama3.2', 'llama3.1', 'mistral', 'codellama'] },
  { name: 'Together AI', endpoint: 'https://api.together.xyz/v1', models: ['meta-llama/Llama-3-70b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1'] },
  { name: 'Groq', endpoint: 'https://api.groq.com/openai/v1', models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'] },
  { name: 'Anthropic (via proxy)', endpoint: 'https://api.anthropic.com/v1', models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'] },
  { name: 'Custom', endpoint: '', models: [] },
]
