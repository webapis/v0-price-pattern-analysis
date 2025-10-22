import { type NextRequest, NextResponse } from "next/server"
import { createSite, getSiteByUrl, createSelector } from "@/lib/db-operations"
import { analyzeWebsiteHTML } from "@/lib/server-pattern-analyzer"
import { fetchWithScrapingBee } from "@/lib/scrapingbee-client"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Parse URL to get domain
    const urlObj = new URL(url)
    const domain = urlObj.hostname

    // Check if site already exists
    let site = await getSiteByUrl(url)

    if (!site) {
      site = await createSite(url, domain)
    }

    const selectors = await analyzeWebsite(url)

    // Save discovered selectors to database
    const savedSelectors = []
    for (const selector of selectors) {
      const saved = await createSelector(site.id, selector.type, selector.value, selector.confidence)
      savedSelectors.push(saved)
    }

    return NextResponse.json({
      siteId: site.id,
      url: site.url,
      domain: site.domain,
      selectors: savedSelectors,
    })
  } catch (error) {
    console.error("Selector discovery error:", error)
    return NextResponse.json({ error: "Failed to discover selectors" }, { status: 500 })
  }
}

async function analyzeWebsite(url: string) {
  try {
    let html: string
    try {
      html = await fetchWithScrapingBee(url)
    } catch (scrapingBeeError) {
      console.warn("[v0] ScrapingBee failed, falling back to direct fetch:", scrapingBeeError)
      // Fallback to direct fetch if ScrapingBee fails
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        timeout: 10000,
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`)
      }

      html = await response.text()
    }

    const results = await analyzeWebsiteHTML(html)

    if (results.length === 0) {
      console.warn("[v0] No selectors found, returning empty results")
    }

    return results.map((result) => ({
      type: result.type,
      value: result.value,
      confidence: result.confidence,
    }))
  } catch (error) {
    console.error("Website analysis error:", error)
    return []
  }
}
