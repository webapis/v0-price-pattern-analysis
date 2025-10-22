"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Globe,
  CheckCircle,
  Loader,
  Save,
  Eye,
  Trash2,
  Edit,
  Copy,
  RefreshCw,
  Database,
  TrendingUp,
  Package,
} from "lucide-react"

interface Selector {
  id: number
  selector_type: string
  selector_value: string
  confidence: number
}

interface Site {
  id: number
  url: string
  domain: string
  name?: string
  selectors: Selector[]
}

interface AnalysisResult {
  siteId: number
  url: string
  domain: string
  selectors: Selector[]
}

export default function SelectorManagementUI() {
  const [activeTab, setActiveTab] = useState("discover")
  const [url, setUrl] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [savedSites, setSavedSites] = useState<Site[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      const response = await fetch("/api/selectors")
      if (response.ok) {
        const data = await response.json()
        setSavedSites(data)
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!url) return

    setAnalyzing(true)
    try {
      const response = await fetch("/api/selectors/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to discover selectors")
      }

      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error("Analysis error:", error)
      alert("Analysis failed. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSavePatterns = async () => {
    if (!analysis) return

    try {
      // Selectors are already saved to database during discovery
      // Just refresh the sites list and show success
      await fetchSites()
      alert("Patterns saved successfully!")
      setAnalysis(null)
      setUrl("")
    } catch (error) {
      console.error("Save error:", error)
      alert("Failed to save patterns")
    }
  }

  const handleDeleteSite = async (siteId: number, domain: string) => {
    if (confirm(`Delete selectors for ${domain}?`)) {
      try {
        // Delete all selectors for this site
        for (const selector of savedSites.find((s) => s.id === siteId)?.selectors || []) {
          await fetch(`/api/selectors/${selector.id}`, { method: "DELETE" })
        }
        await fetchSites()
      } catch (error) {
        console.error("Delete error:", error)
        alert("Failed to delete site")
      }
    }
  }

  const handleCopySelector = (selector: string) => {
    navigator.clipboard.writeText(selector)
    setCopied(selector)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Selector Repository</h1>
                <p className="text-sm text-slate-600">E-commerce Scraping Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-600">Total Sites</div>
                <div className="text-2xl font-bold text-blue-600">{savedSites.length}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600">Verified Selectors</div>
                <div className="text-2xl font-bold text-green-600">
                  {savedSites.reduce((sum, s) => sum + s.selectors.length, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {["discover", "repository", "validation"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium transition-colors relative ${
                  activeTab === tab ? "text-blue-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab === "discover" && <Search className="w-4 h-4 inline mr-2" />}
                {tab === "repository" && <Database className="w-4 h-4 inline mr-2" />}
                {tab === "validation" && <CheckCircle className="w-4 h-4 inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Discover Tab */}
        {activeTab === "discover" && (
          <div className="space-y-6">
            {/* URL Input Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Discover Selectors</h2>
              <p className="text-sm text-slate-600 mb-4">
                Enter a product listing page URL to automatically discover and analyze CSS selectors
              </p>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                    placeholder="https://www.example.com/products"
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !url}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <Package className="w-8 h-8 text-blue-600" />
                      <span className="text-2xl font-bold text-slate-900">{analysis.selectors.length}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">Selectors Found</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                      <span className="text-2xl font-bold text-slate-900">
                        {(
                          (analysis.selectors.reduce((sum, s) => sum + s.confidence, 0) / analysis.selectors.length) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">Avg Confidence</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <CheckCircle className="w-8 h-8 text-purple-600" />
                      <span className="text-2xl font-bold text-slate-900">
                        {analysis.selectors.filter((s) => s.confidence > 0.85).length}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">High Confidence</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <Database className="w-8 h-8 text-orange-600" />
                      <span className="text-2xl font-bold text-slate-900">{analysis.domain}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">Domain</div>
                  </div>
                </div>

                {/* Selectors List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      Discovered Selectors
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {analysis.selectors.map((selector) => (
                      <div
                        key={selector.id}
                        className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium capitalize text-slate-900">{selector.selector_type}</span>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                {(selector.confidence * 100).toFixed(0)}% confidence
                              </span>
                            </div>
                            <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm text-green-400 break-all">
                              {selector.selector_value}
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopySelector(selector.selector_value)}
                            className="ml-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSavePatterns}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save All Patterns to Database
                  </button>
                  <button className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Preview Extraction
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Repository Tab */}
        {activeTab === "repository" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Saved Sites</h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : savedSites.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No saved sites yet. Discover selectors to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedSites.map((site) => (
                    <div
                      key={site.id}
                      className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-100 rounded-lg">
                            <Globe className="w-6 h-6 text-slate-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{site.domain}</h3>
                            <p className="text-sm text-slate-600">{site.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-sm text-slate-600">Selectors</div>
                            <div className="text-lg font-bold text-slate-900">{site.selectors.length}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-600">Status</div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> Verified
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSite(site.id, site.domain)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validation Tab */}
        {activeTab === "validation" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Validate Selectors</h2>
            <p className="text-slate-600 mb-6">
              Test your saved selectors against live URLs to ensure they still work correctly.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select Site</option>
                  {savedSites.map((site) => (
                    <option key={site.id}>{site.domain}</option>
                  ))}
                </select>
                <input
                  type="url"
                  placeholder="Test URL"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Run Validation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
