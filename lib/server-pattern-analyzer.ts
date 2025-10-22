import * as cheerio from "cheerio"

/**
 * Server-side pattern analyzer using cheerio for HTML parsing
 * Identifies product containers, titles, images, and prices from HTML
 */

export interface PatternResult {
  type: string
  value: string
  confidence: number
  description: string
  examples: string[]
}

/**
 * Analyze HTML and identify product containers
 */
export function analyzeProductContainers(html: string): PatternResult | null {
  const $ = cheerio.load(html)

  const containerPatterns = [
    { selector: "[class*='product-card']", weight: 0.95 },
    { selector: "[class*='product-item']", weight: 0.93 },
    { selector: "[class*='product'][class*='container']", weight: 0.9 },
    { selector: "[data-product]", weight: 0.88 },
    { selector: "[class*='item-card']", weight: 0.85 },
    { selector: "[class*='urun']", weight: 0.85 }, // Turkish: product
    { selector: "[class*='produit']", weight: 0.85 }, // French: product
    { selector: "[class*='producto']", weight: 0.85 }, // Spanish: product
    { selector: "[class*='product']", weight: 0.8 },
    { selector: "article[class*='product']", weight: 0.82 },
    { selector: "li[class*='product']", weight: 0.8 },
    { selector: "div[class*='card']", weight: 0.75 },
    { selector: "div[class*='item']", weight: 0.7 },
  ]

  for (const pattern of containerPatterns) {
    const elements = $(pattern.selector)
    if (elements.length > 2) {
      // Found multiple matching elements
      const examples = elements
        .slice(0, 3)
        .map((_, el) => {
          const $el = $(el)
          return $el.attr("class") || $el.attr("data-product") || "product-container"
        })
        .get()

      return {
        type: "container",
        value: pattern.selector,
        confidence: pattern.weight,
        description: `Product container selector matching ${elements.length} elements`,
        examples,
      }
    }
  }

  return null
}

/**
 * Analyze HTML and identify product titles
 */
export function analyzeProductTitles(html: string): PatternResult | null {
  const $ = cheerio.load(html)

  const titlePatterns = [
    { selector: "[class*='product-title']", weight: 0.95 },
    { selector: "[class*='product-name']", weight: 0.93 },
    { selector: "h2[class*='product']", weight: 0.9 },
    { selector: "h3[class*='product']", weight: 0.88 },
    { selector: "h2[class*='title']", weight: 0.85 },
    { selector: "h3[class*='title']", weight: 0.83 },
    { selector: "[class*='title'][class*='product']", weight: 0.82 },
    { selector: "a[class*='product-title']", weight: 0.85 },
    { selector: "[class*='urun-adi']", weight: 0.85 }, // Turkish: product name
    { selector: "[class*='nom-produit']", weight: 0.85 }, // French: product name
    { selector: "[class*='nombre-producto']", weight: 0.85 }, // Spanish: product name
    { selector: "h1, h2, h3, h4", weight: 0.6 },
  ]

  for (const pattern of titlePatterns) {
    const elements = $(pattern.selector)
    if (elements.length > 0) {
      const examples = elements
        .slice(0, 3)
        .map((_, el) => {
          const text = $(el).text().trim()
          return text.substring(0, 50)
        })
        .get()
        .filter((text) => text.length > 5)

      if (examples.length > 0) {
        return {
          type: "title",
          value: pattern.selector,
          confidence: pattern.weight,
          description: `Product title selector matching ${elements.length} elements`,
          examples,
        }
      }
    }
  }

  return null
}

/**
 * Analyze HTML and identify product prices
 */
export function analyzeProductPrices(html: string): PatternResult | null {
  const $ = cheerio.load(html)

  const pricePatterns = [
    { selector: "[class*='price']", weight: 0.95 },
    { selector: "[class*='product-price']", weight: 0.93 },
    { selector: "[data-price]", weight: 0.9 },
    { selector: "span[class*='price']", weight: 0.88 },
    { selector: "div[class*='price']", weight: 0.85 },
    { selector: "[class*='fiyat']", weight: 0.85 }, // Turkish: price
    { selector: "[class*='prix']", weight: 0.85 }, // French: price
    { selector: "[class*='precio']", weight: 0.85 }, // Spanish: price
    { selector: "[class*='cost']", weight: 0.8 },
    { selector: "[class*='amount']", weight: 0.75 },
  ]

  const priceRegex = /\$?\d+(?:[.,]\d{2,3})*(?:[.,]\d{2})?|₺\s*\d+|EUR\s*\d+|USD\s*\d+|€\s*\d+|£\s*\d+|¥\s*\d+/

  for (const pattern of pricePatterns) {
    const elements = $(pattern.selector)
    if (elements.length > 0) {
      const examples = elements
        .slice(0, 3)
        .map((_, el) => {
          const text = $(el).text().trim()
          const match = text.match(priceRegex)
          return match ? match[0] : text.substring(0, 20)
        })
        .get()
        .filter((text) => priceRegex.test(text))

      if (examples.length > 0) {
        return {
          type: "price",
          value: pattern.selector,
          confidence: pattern.weight,
          description: `Product price selector matching ${elements.length} elements`,
          examples,
        }
      }
    }
  }

  return null
}

/**
 * Analyze HTML and identify product images
 */
export function analyzeProductImages(html: string): PatternResult | null {
  const $ = cheerio.load(html)

  const imagePatterns = [
    { selector: "img[class*='product-image']", weight: 0.95 },
    { selector: "img[class*='product-img']", weight: 0.93 },
    { selector: "img[class*='product']", weight: 0.9 },
    { selector: "img[alt*='product']", weight: 0.88 },
    { selector: "img[src*='product']", weight: 0.85 },
    { selector: "img[class*='item-image']", weight: 0.83 },
    { selector: "img[class*='thumbnail']", weight: 0.8 },
    { selector: "img[class*='urun-resim']", weight: 0.85 }, // Turkish: product image
    { selector: "img[class*='image-produit']", weight: 0.85 }, // French: product image
    { selector: "img[class*='imagen-producto']", weight: 0.85 }, // Spanish: product image
    { selector: "img", weight: 0.5 },
  ]

  for (const pattern of imagePatterns) {
    const elements = $(pattern.selector)
    if (elements.length > 0) {
      const examples = elements
        .slice(0, 3)
        .map((_, el) => {
          const $el = $(el)
          return $el.attr("alt") || $el.attr("class") || "product-image"
        })
        .get()

      return {
        type: "image",
        value: pattern.selector,
        confidence: pattern.weight,
        description: `Product image selector matching ${elements.length} elements`,
        examples,
      }
    }
  }

  return null
}

/**
 * Comprehensive HTML analysis
 */
export async function analyzeWebsiteHTML(html: string): Promise<PatternResult[]> {
  const results: PatternResult[] = []

  const containerResult = analyzeProductContainers(html)
  if (containerResult) results.push(containerResult)

  const titleResult = analyzeProductTitles(html)
  if (titleResult) results.push(titleResult)

  const priceResult = analyzeProductPrices(html)
  if (priceResult) results.push(priceResult)

  const imageResult = analyzeProductImages(html)
  if (imageResult) results.push(imageResult)

  return results
}
