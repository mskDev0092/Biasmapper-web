'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { 
  Settings, 
  Key, 
  Server, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  TestTube
} from 'lucide-react'
import { 
  getAPIConfig, 
  saveAPIConfig, 
  clearAPIConfig, 
  isAPIConfigured,
  PREDEFINED_ENDPOINTS 
} from '@/lib/api-config'
import { createChatCompletion } from '@/lib/api-service'
import Link from 'next/link'

export default function SettingsPage() {
  const [config, setConfig] = useState({
    endpoint: '',
    apiKey: '',
    model: '',
    temperature: 0.7,
    maxTokens: 2048,
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [testMessage, setTestMessage] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('Custom')
  const [customModel, setCustomModel] = useState('')

  useEffect(() => {
    const savedConfig = getAPIConfig()
    setConfig({
      endpoint: savedConfig.endpoint,
      apiKey: savedConfig.apiKey,
      model: savedConfig.model,
      temperature: savedConfig.temperature || 0.7,
      maxTokens: savedConfig.maxTokens || 2048,
    })
    
    // Find matching provider
    const provider = PREDEFINED_ENDPOINTS.find(p => p.endpoint === savedConfig.endpoint)
    if (provider) {
      setSelectedProvider(provider.name)
    }
  }, [])

  const handleProviderChange = (providerName: string) => {
    setSelectedProvider(providerName)
    const provider = PREDEFINED_ENDPOINTS.find(p => p.name === providerName)
    if (provider && provider.endpoint) {
      setConfig(prev => ({
        ...prev,
        endpoint: provider.endpoint,
        model: provider.models[0] || '',
      }))
    }
  }

  const handleSave = () => {
    saveAPIConfig({
      endpoint: config.endpoint,
      apiKey: config.apiKey,
      model: config.model || customModel,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    })
    setTestResult(null)
    setTestMessage('Settings saved successfully!')
    setTimeout(() => setTestMessage(''), 3000)
  }

  const handleClear = () => {
    clearAPIConfig()
    setConfig({
      endpoint: '',
      apiKey: '',
      model: '',
      temperature: 0.7,
      maxTokens: 2048,
    })
    setSelectedProvider('Custom')
    setTestResult(null)
  }

  const handleTest = async () => {
    if (!config.apiKey || !config.endpoint) {
      setTestResult('error')
      setTestMessage('Please configure API key and endpoint first')
      return
    }

    setTesting(true)
    setTestResult(null)
    
    try {
      // Test with a simple completion
      const response = await createChatCompletion(
        [{ role: 'user', content: 'Say "OK" if you can hear me.' }],
        {
          endpoint: config.endpoint,
          apiKey: config.apiKey,
          model: config.model || customModel,
          temperature: 0.1,
          maxTokens: 10,
        }
      )
      
      setTestResult('success')
      setTestMessage(`Connection successful! Model responded: "${response.substring(0, 50)}..."`)
    } catch (error: any) {
      setTestResult('error')
      setTestMessage(error.message || 'Connection failed')
    } finally {
      setTesting(false)
    }
  }

  const currentProvider = PREDEFINED_ENDPOINTS.find(p => p.name === selectedProvider)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">API Configuration</h1>
          </div>
          <p className="text-slate-600">
            Configure your OpenAI-compatible API endpoint for bias analysis. Supports local models (Ollama), cloud services, or any compatible API.
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isAPIConfigured() ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>API Configured</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <span>API Not Configured</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isAPIConfigured() 
                ? 'Your API is configured and ready for bias analysis.'
                : 'Configure your API settings to start analyzing text for bias.'}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Configuration Form */}
        <div className="space-y-6">
          {/* Provider Selection */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-600" />
                Provider
              </CardTitle>
              <CardDescription>
                Select a predefined provider or configure a custom endpoint
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">API Provider</Label>
                <Select value={selectedProvider} onValueChange={handleProviderChange}>
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_ENDPOINTS.map((provider) => (
                      <SelectItem key={provider.name} value={provider.name}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Input
                  id="endpoint"
                  type="url"
                  placeholder="https://api.openai.com/v1"
                  value={config.endpoint}
                  onChange={(e) => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                />
                <p className="text-xs text-slate-500">
                  For Ollama, use: http://localhost:11434/v1
                </p>
              </div>
            </CardContent>
          </Card>

          {/* API Key */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                Authentication
              </CardTitle>
              <CardDescription>
                Your API key is stored locally and never sent to our servers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="sk-..."
                    value={config.apiKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  For local models like Ollama, you can use any placeholder value like "ollama"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Model Selection */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-600" />
                Model Configuration
              </CardTitle>
              <CardDescription>
                Select or specify the model to use for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentProvider?.models && currentProvider.models.length > 0 && selectedProvider !== 'Custom' ? (
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select 
                    value={config.model} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentProvider.models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="customModel">Model Name</Label>
                  <Input
                    id="customModel"
                    type="text"
                    placeholder="llama3.2"
                    value={config.model || customModel}
                    onChange={(e) => {
                      setCustomModel(e.target.value)
                      setConfig(prev => ({ ...prev, model: e.target.value }))
                    }}
                  />
                  <p className="text-xs text-slate-500">
                    Enter the exact model identifier (e.g., llama3.2, mistral, gpt-4o)
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Temperature: {config.temperature.toFixed(1)}</Label>
                  <Slider
                    value={[config.temperature]}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, temperature: value[0] }))}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                  <p className="text-xs text-slate-500">
                    Lower values are more deterministic, higher values more creative
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 2048 }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Result */}
          {testResult && (
            <Alert variant={testResult === 'success' ? 'default' : 'destructive'}>
              {testResult === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{testResult === 'success' ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>{testMessage}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Save Configuration
            </Button>
            <Button 
              onClick={handleTest} 
              variant="outline" 
              disabled={testing}
              className="flex-1"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            <Button onClick={handleClear} variant="destructive" className="sm:w-auto">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Quick Links */}
          <Card className="border-0 shadow-lg bg-slate-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Setup Guides</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <h4 className="font-medium text-slate-800 mb-2">Ollama (Local)</h4>
                  <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                    <li>Install Ollama from ollama.ai</li>
                    <li>Run: <code className="bg-slate-100 px-1 rounded">ollama serve</code></li>
                    <li>Pull model: <code className="bg-slate-100 px-1 rounded">ollama pull llama3.2</code></li>
                    <li>Set endpoint: <code className="bg-slate-100 px-1 rounded">http://localhost:11434/v1</code></li>
                    <li>Use any API key (e.g., "ollama")</li>
                  </ol>
                </div>
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <h4 className="font-medium text-slate-800 mb-2">OpenAI (Cloud)</h4>
                  <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                    <li>Get API key from platform.openai.com</li>
                    <li>Set endpoint: <code className="bg-slate-100 px-1 rounded">https://api.openai.com/v1</code></li>
                    <li>Paste your API key</li>
                    <li>Select model (gpt-4o-mini recommended)</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" asChild>
              <Link href="/">← Back to Home</Link>
            </Button>
            {isAPIConfigured() && (
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <Link href="/analyze">Start Analyzing →</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
