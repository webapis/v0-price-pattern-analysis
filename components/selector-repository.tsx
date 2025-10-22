"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"

interface Selector {
  id: number
  site_id: number
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

export function SelectorRepository() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      const response = await fetch("/api/selectors")
      if (response.ok) {
        const data = await response.json()
        setSites(data)
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (sites.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No selectors discovered yet. Start by discovering selectors from a URL.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sites.map((site) => (
        <Card key={site.id}>
          <CardHeader>
            <CardTitle className="text-lg">{site.domain}</CardTitle>
            <CardDescription>{site.url}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {site.selectors.map((selector) => (
                <div key={selector.id} className="flex items-start justify-between rounded-lg border p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{selector.selector_type}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {(selector.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <code className="text-xs text-gray-600 break-all">{selector.selector_value}</code>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
