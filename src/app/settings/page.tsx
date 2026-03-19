"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
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
  TestTube,
  Shield,
  Lock,
  Zap,
  Newspaper,
  Globe,
} from "lucide-react";
import {
  getAPIConfig,
  saveAPIConfig,
  clearAPIConfig,
  isAPIConfigured,
  PREDEFINED_ENDPOINTS,
} from "@/lib/api-config";
import { maskAPIKey } from "@/lib/encryption-utils";
import { createChatCompletion } from "@/lib/api-service";
import { detectLocalServices, DetectedService } from "@/lib/service-detection";
import { NewsSettingsDB, type NewsApiSettings, clearAllData, DEFAULT_NEWS_SETTINGS } from "@/lib/local-db";
import Link from "next/link";

export default function SettingsPage() {
  const [config, setConfig] = useState({
    endpoint: "",
    apiKey: "",
    model: "",
    temperature: 0.7,
    maxTokens: 2048,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(
    null,
  );
  const [testMessage, setTestMessage] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("Custom");
  const [customModel, setCustomModel] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [detectedServices, setDetectedServices] = useState<DetectedService[]>(
    [],
  );
  const [newsSettings, setNewsSettings] = useState<NewsApiSettings>(DEFAULT_NEWS_SETTINGS);

  useEffect(() => {
    const savedConfig = getAPIConfig();
    setConfig({
      endpoint: savedConfig.endpoint,
      apiKey: savedConfig.apiKey,
      model: savedConfig.model,
      temperature: savedConfig.temperature || 0.7,
      maxTokens: savedConfig.maxTokens || 2048,
    });

    // Find matching provider
    const provider = PREDEFINED_ENDPOINTS.find(
      (p) => p.endpoint === savedConfig.endpoint,
    );
    if (provider) {
      setSelectedProvider(provider.name);
    }

    // Auto-detect local services on mount
    detectLocalServices().then(setDetectedServices);

    // Load news settings
    setNewsSettings(NewsSettingsDB.get());
  }, []);

  const handleProviderChange = (providerName: string) => {
    setSelectedProvider(providerName);
    const provider = PREDEFINED_ENDPOINTS.find((p) => p.name === providerName);
    if (provider && provider.endpoint) {
      setConfig((prev) => ({
        ...prev,
        endpoint: provider.endpoint,
        model: provider.models[0] || "",
      }));
    }
  };

  const handleSave = () => {
    saveAPIConfig({
      endpoint: config.endpoint,
      apiKey: config.apiKey,
      model: config.model || customModel,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    });
    setTestResult(null);
    setTestMessage("Settings saved successfully!");
    
    // Save news settings too
    NewsSettingsDB.update(newsSettings);
    
    setTimeout(() => setTestMessage(""), 3000);
  };

  const handleClear = () => {
    if (!confirm("Are you sure you want to PERMANENTLY delete all local data, analyses, and news articles? This cannot be undone.")) return;
    
    clearAllData();
    setConfig({
      endpoint: "",
      apiKey: "",
      model: "",
      temperature: 0.7,
      maxTokens: 2048,
    });
    setNewsSettings(DEFAULT_NEWS_SETTINGS);
    setSelectedProvider("Custom");
    setTestResult(null);
    alert("All local data has been wiped.");
  };

  const handleTest = async () => {
    const isLocal = config.endpoint.includes("localhost");

    // For local services, only need endpoint and model
    if (isLocal) {
      if (!config.endpoint || !config.model) {
        setTestResult("error");
        setTestMessage("Please configure endpoint and model for local service");
        return;
      }
    } else {
      // For remote services, need API key and endpoint
      if (!config.apiKey || !config.endpoint) {
        setTestResult("error");
        setTestMessage("Please configure API key and endpoint first");
        return;
      }
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Test with a simple completion
      const response = await createChatCompletion(
        [{ role: "user", content: 'Say "OK" if you can hear me.' }],
        {
          endpoint: config.endpoint,
          apiKey: config.apiKey || "local", // Use "local" placeholder for local services
          model: config.model || customModel,
          temperature: 0.1,
          maxTokens: 10,
        },
      );

      setTestResult("success");
      setTestMessage(
        `Connection successful! Model responded: "${response.substring(0, 50)}..."`,
      );
    } catch (error: any) {
      setTestResult("error");
      setTestMessage(error.message || "Connection failed");
    } finally {
      setTesting(false);
    }
  };

  const handleAutoDetect = async () => {
    setDetecting(true);
    setTestResult(null);

    try {
      const services = await detectLocalServices();
      setDetectedServices(services);

      if (services.length === 0) {
        setTestResult("error");
        setTestMessage(
          "No local services detected. Make sure Ollama or LM-Studio is running.",
        );
      } else {
        // Auto-connect to the first detected service
        const service = services[0];
        const modelToUse = service.models?.[0] || "llama3.2";

        setConfig((prev) => ({
          ...prev,
          endpoint: service.endpoint,
          model: modelToUse,
          apiKey: prev.apiKey || "local", // Use "local" as placeholder if not set
        }));

        setSelectedProvider(service.name);
        setTestResult("success");
        setTestMessage(
          `✓ Detected ${service.name} at ${service.endpoint}${
            service.models ? ` with ${service.models.length} model(s)` : ""
          }`,
        );
      }
    } catch (error: any) {
      setTestResult("error");
      setTestMessage(
        error.message || "Failed to detect local services. Please try again.",
      );
    } finally {
      setDetecting(false);
    }
  };

  const currentProvider = PREDEFINED_ENDPOINTS.find(
    (p) => p.name === selectedProvider,
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">
              API Configuration
            </h1>
          </div>
          <p className="text-slate-600">
            Configure your OpenAI-compatible API endpoint for bias analysis.
            Supports local models (Ollama), cloud services, or any compatible
            API.
          </p>
        </div>

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
                ? "Your API is configured and ready for bias analysis."
                : "Configure your API settings to start analyzing text for bias."}
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
                <Select
                  value={selectedProvider}
                  onValueChange={handleProviderChange}
                >
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
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, endpoint: e.target.value }))
                  }
                />
                <p className="text-xs text-slate-500">
                  For Ollama: http://localhost:11434/v1 • For LM-Studio:
                  http://localhost:8000/v1
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Auto-Detect Local Services */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-600" />
                Quick Setup - Local Services
              </CardTitle>
              <CardDescription>
                Auto-detect and connect to Ollama or LM-Studio running on your
                machine (checks common ports: Ollama 11434/11435/8080, LM-Studio
                8000/8001/1234)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleAutoDetect}
                disabled={detecting}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
              >
                {detecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Auto Detect Local Services
                  </>
                )}
              </Button>

              {detectedServices.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">
                    Detected Services:
                  </Label>
                  {detectedServices.map((service) => (
                    <div
                      key={service.name}
                      className="p-3 bg-white rounded-lg border border-indigo-200 flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">
                          {service.name}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">
                          {service.endpoint}
                        </p>
                        {service.models && service.models.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {service.models.slice(0, 3).map((model) => (
                              <Badge key={model} variant="secondary">
                                {model}
                              </Badge>
                            ))}
                            {service.models.length > 3 && (
                              <Badge variant="secondary">
                                +{service.models.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 ml-2 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {detectedServices.length === 0 && !detecting && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    No services found. If you have Ollama or LM-Studio running
                    on a custom port, manually configure below.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Local Service Configuration */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-purple-600" />
                Manual Local Setup
              </CardTitle>
              <CardDescription>
                Configure Ollama or LM-Studio with custom port and model name
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select
                    value={
                      selectedProvider === "Ollama (Local)"
                        ? "ollama"
                        : selectedProvider === "LM-Studio"
                          ? "lmstudio"
                          : "custom"
                    }
                    onValueChange={(value) => {
                      if (value === "ollama") {
                        handleProviderChange("Ollama (Local)");
                      } else if (value === "lmstudio") {
                        handleProviderChange("LM-Studio");
                      }
                    }}
                  >
                    <SelectTrigger id="serviceType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ollama">Ollama</SelectItem>
                      <SelectItem value="lmstudio">LM-Studio</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customPort">Port (optional)</Label>
                  <Input
                    id="customPort"
                    type="number"
                    placeholder="e.g., 11434"
                    defaultValue={
                      config.endpoint.split(":").pop()?.replace("/v1", "") || ""
                    }
                    onChange={(e) => {
                      const port = e.target.value;
                      if (port) {
                        const serviceType =
                          selectedProvider === "Ollama (Local)"
                            ? "11434"
                            : "8000";
                        const newEndpoint = config.endpoint.replace(
                          /:(\d+)/,
                          `:${port}`,
                        );
                        setConfig((prev) => ({
                          ...prev,
                          endpoint: newEndpoint,
                        }));
                      }
                    }}
                  />
                  <p className="text-xs text-slate-500">
                    Ollama default: 11434 • LM-Studio default: 8000
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manualModel">Model Name</Label>
                <Input
                  id="manualModel"
                  type="text"
                  placeholder="e.g., llama3.2, llama2, mistral, neural-chat"
                  value={config.model || customModel}
                  onChange={(e) => {
                    setCustomModel(e.target.value);
                    setConfig((prev) => ({ ...prev, model: e.target.value }));
                  }}
                />
                <p className="text-xs text-slate-500">
                  Enter any model name that's installed on your local service
                </p>
              </div>
            </CardContent>
          </Card>

          {/* API Key */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                Authentication
              </CardTitle>
              <CardDescription>
                Your API key is encrypted in local storage and never exposed to
                external services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">
                  API Key{" "}
                  <span className="text-xs text-slate-500">
                    (optional for local)
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    placeholder="sk-... (required for cloud APIs, optional for local)"
                    value={config.apiKey}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, apiKey: e.target.value }))
                    }
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  🔒 Encrypted before storage • For remote APIs only • Local
                  services don't need an API key
                </p>
                {config.apiKey && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-slate-600">
                      Saved as:{" "}
                      <code className="font-mono text-blue-700">
                        {maskAPIKey(config.apiKey)}
                      </code>
                    </p>
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  <strong>Optional for local services:</strong> Leave blank for
                  Ollama/LM-Studio, or enter any placeholder value
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
              {currentProvider?.models &&
              currentProvider.models.length > 0 &&
              selectedProvider !== "Custom" ? (
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={config.model}
                    onValueChange={(value) =>
                      setConfig((prev) => ({ ...prev, model: value }))
                    }
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
                      setCustomModel(e.target.value);
                      setConfig((prev) => ({ ...prev, model: e.target.value }));
                    }}
                  />
                  <p className="text-xs text-slate-500">
                    Enter the exact model identifier (e.g., llama3.2, mistral,
                    gpt-4o)
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Temperature: {config.temperature.toFixed(1)}</Label>
                  <Slider
                    value={[config.temperature]}
                    onValueChange={(value) =>
                      setConfig((prev) => ({ ...prev, temperature: value[0] }))
                    }
                    min={0}
                    max={2}
                    step={0.1}
                  />
                  <p className="text-xs text-slate-500">
                    Lower values are more deterministic, higher values more
                    creative
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        maxTokens: parseInt(e.target.value) || 2048,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* News API Configuration */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-blue-600" />
                News API Configuration
              </CardTitle>
              <CardDescription>
                Configure free news API keys to fetch latest articles for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="preferredNewsProvider">Preferred Provider</Label>
                  <Select
                    value={newsSettings.preferredProvider}
                    onValueChange={(v: any) => setNewsSettings(prev => ({ ...prev, preferredProvider: v }))}
                  >
                    <SelectTrigger id="preferredNewsProvider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gnews">GNews (Recommended)</SelectItem>
                      <SelectItem value="newsapi">NewsAPI.org</SelectItem>
                      <SelectItem value="currents">Currents API</SelectItem>
                      <SelectItem value="google-rss">Google RSS (No Key Required)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Highest priority source for news fetching
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsCountries">Countries</Label>
                  <div className="flex gap-2 flex-wrap min-h-[40px] items-center">
                    {["us", "pk", "gb", "ca", "in"].map(c => (
                      <Badge
                        key={c}
                        variant={newsSettings.fetchCountries.includes(c) ? "default" : "outline"}
                        className="cursor-pointer uppercase"
                        onClick={() => {
                          const countries = newsSettings.fetchCountries.includes(c)
                            ? newsSettings.fetchCountries.filter(x => x !== c)
                            : [...newsSettings.fetchCountries, c];
                          setNewsSettings(prev => ({ ...prev, fetchCountries: countries }));
                        }}
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="gnewsApiKey">GNews API Key</Label>
                  <Input
                    id="gnewsApiKey"
                    type="password"
                    placeholder="Enter GNews API key"
                    value={newsSettings.gnewsApiKey}
                    onChange={(e) => setNewsSettings(prev => ({ ...prev, gnewsApiKey: e.target.value }))}
                  />
                  <p className="text-xs text-slate-500">
                    Get a free key at <a href="https://gnews.io/" target="_blank" className="text-blue-600 underline">gnews.io</a> (100 free requests/day)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsApiKey">NewsAPI.org Key</Label>
                  <Input
                    id="newsApiKey"
                    type="password"
                    placeholder="Enter NewsAPI.org key"
                    value={newsSettings.newsApiKey}
                    onChange={(e) => setNewsSettings(prev => ({ ...prev, newsApiKey: e.target.value }))}
                  />
                  <p className="text-xs text-slate-500">
                    Get a free key at <a href="https://newsapi.org/" target="_blank" className="text-blue-600 underline">newsapi.org</a> (Developer tier)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentsApiKey">Currents API Key</Label>
                  <Input
                    id="currentsApiKey"
                    type="password"
                    placeholder="Enter Currents API key"
                    value={newsSettings.currentsApiKey}
                    onChange={(e) => setNewsSettings(prev => ({ ...prev, currentsApiKey: e.target.value }))}
                  />
                  <p className="text-xs text-slate-500">
                    Get a free key at <a href="https://currentsapi.services/" target="_blank" className="text-blue-600 underline">currentsapi.services</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Result */}
          {testResult && (
            <Alert
              variant={testResult === "success" ? "default" : "destructive"}
            >
              {testResult === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {testResult === "success" ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{testMessage}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
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
            <Button
              onClick={handleClear}
              variant="destructive"
              className="sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Quick Links */}
          <Card className="border-0 shadow-lg bg-slate-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-slate-900 mb-4">
                Quick Setup Guides
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <h4 className="font-medium text-slate-800 mb-2">
                    Ollama (Local)
                  </h4>
                  <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                    <li>Install Ollama from ollama.ai</li>
                    <li>
                      Run:{" "}
                      <code className="bg-slate-100 px-1 rounded">
                        ollama serve
                      </code>
                    </li>
                    <li>
                      Pull any model (e.g.:{" "}
                      <code className="bg-slate-100 px-1 rounded">
                        ollama pull llama3.2
                      </code>
                      )
                    </li>
                    <li>
                      Endpoint: http://localhost:11434/v1 (or custom port)
                    </li>
                    <li>Model: Use any installed model name</li>
                    <li>API Key: Use any value (e.g., "local")</li>
                  </ol>
                </div>
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <h4 className="font-medium text-slate-800 mb-2">
                    LM-Studio (Local)
                  </h4>
                  <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                    <li>Install LM-Studio from lmstudio.ai</li>
                    <li>Load a model in LM-Studio</li>
                    <li>Start the local server (port 8000 by default)</li>
                    <li>Endpoint: http://localhost:8000/v1 (or custom port)</li>
                    <li>Model: Use loaded model name</li>
                    <li>API Key: Use any value (e.g., "local")</li>
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
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                <Link href="/analyze">Start Analyzing →</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
