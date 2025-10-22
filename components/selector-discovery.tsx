"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"

interface DiscoveredSelector {
  id: number
  selector_type: string
  selector_value: string
  confidence: number
}

interface DiscoveryResult {
  siteId: number
  url: string
  domain: string
  selectors: DiscoveredSelector[]
}

export function SelectorDiscovery() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiscoveryResult | null>(null)
  const [error, setError] = useState("")

  const handleDiscover = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

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
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Discover Selectors</CardTitle>
          <CardDescription>Enter a product listing URL to discover CSS selectors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/products"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleDiscover()}
              disabled={loading}
            />
            <Button onClick={handleDiscover} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Discover"
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Discovered Selectors</CardTitle>
            <CardDescription>
              {result.domain} - {result.selectors.length} selectors found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.selectors.map((selector) => (
                <div key={selector.id} className="flex items-start justify-between rounded-lg border p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{selector.selector_type}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {(selector.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <code className="text-xs text-gray-600 break-all">{selector.selector_value}</code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(selector.selector_value)
                    }}
                  >
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
