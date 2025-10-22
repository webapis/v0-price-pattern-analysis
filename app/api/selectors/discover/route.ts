import { type NextRequest, NextResponse } from "next/server"
import { createSite, getSiteByUrl, createSelector } from "@/lib/db-operations"

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

    // Simulate selector discovery with different results based on domain
    const selectors = generateSelectorsForDomain(domain)

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

function generateSelectorsForDomain(domain: string) {
  const domainPatterns: Record<string, Array<{ type: string; value: string; confidence: number }>> = {
    "amazon.com": [
      { type: "container", value: 'div[data-component-type="s-search-result"]', confidence: 0.95 },
      { type: "title", value: "h2 a span", confidence: 0.92 },
      { type: "price", value: ".a-price-whole", confidence: 0.88 },
      { type: "image", value: "img.s-image", confidence: 0.9 },
    ],
    "ebay.com": [
      { type: "container", value: "div.s-item", confidence: 0.94 },
      { type: "title", value: ".s-item__title", confidence: 0.91 },
      { type: "price", value: ".s-item__price", confidence: 0.89 },
      { type: "image", value: ".s-item__image-wrapper img", confidence: 0.92 },
    ],
    "walmart.com": [
      { type: "container", value: 'div[data-testid="ProductTile"]', confidence: 0.93 },
      { type: "title", value: 'a[data-testid="productTitle"]', confidence: 0.9 },
      { type: "price", value: 'div[data-testid="productPrice"]', confidence: 0.87 },
      { type: "image", value: 'img[data-testid="productImage"]', confidence: 0.91 },
    ],
    "target.com": [
      { type: "container", value: 'div[data-test="ProductCardWrapper"]', confidence: 0.92 },
      { type: "title", value: 'a[data-test="productTitle"]', confidence: 0.89 },
      { type: "price", value: 'span[data-test="productPrice"]', confidence: 0.86 },
      { type: "image", value: 'img[data-test="productImage"]', confidence: 0.9 },
    ],
  }

  // Return domain-specific selectors or generic ones
  return (
    domainPatterns[domain] || [
      { type: "container", value: "div.product-item", confidence: 0.75 },
      { type: "title", value: "h2.product-title", confidence: 0.72 },
      { type: "price", value: "span.product-price", confidence: 0.7 },
      { type: "image", value: "img.product-image", confidence: 0.73 },
    ]
  )
}
