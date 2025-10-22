const SCRAPINGBEE_API_KEY = "W4CVB5OA3OP77B1BVSCIQKTN9689BE4BCE0AAF5NEVMWUC8L86YNYG184G07WI99ZT8L706TG2716NIE"
const SCRAPINGBEE_API_URL = "https://api.scrapingbee.com/api/v1/"

export interface ScrapingBeeResponse {
  statusCode: number
  body: string
  headers: Record<string, string>
}

/**
 * Fetch and render a webpage using ScrapingBee
 * Handles JavaScript execution and dynamic content loading
 */
export async function fetchWithScrapingBee(url: string): Promise<string> {
  try {
    const params = new URLSearchParams({
      api_key: SCRAPINGBEE_API_KEY,
      url: url,
      render_javascript: "true",
      wait_for: "2000", // Wait 2 seconds for dynamic content
      timeout: "30000",
    })

    const response = await fetch(`${SCRAPINGBEE_API_URL}?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`ScrapingBee API error: ${response.statusText}`)
    }

    const data = (await response.json()) as ScrapingBeeResponse

    if (data.statusCode !== 200) {
      throw new Error(`ScrapingBee returned status ${data.statusCode}`)
    }

    return data.body
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] ScrapingBee fetch error:", errorMessage)
    throw new Error(`ScrapingBee failed: ${errorMessage}`)
  }
}
