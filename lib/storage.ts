export interface SavedSite {
  id: string
  domain: string
  name: string
  lastUpdated: string
  status: "verified" | "pending"
  selectorsCount: number
  selectors: {
    container?: any
    title?: any
    image?: any
    price?: any
  }
}

const STORAGE_KEY = "selector_repository_sites"

export function getSavedSites(): SavedSite[] {
  if (typeof window === "undefined") return []

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error reading from localStorage:", error)
    return []
  }
}

export function saveSite(site: SavedSite): void {
  if (typeof window === "undefined") return

  try {
    const sites = getSavedSites()
    const existingIndex = sites.findIndex((s) => s.domain === site.domain)

    if (existingIndex >= 0) {
      sites[existingIndex] = site
    } else {
      sites.push(site)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sites))
  } catch (error) {
    console.error("Error writing to localStorage:", error)
  }
}

export function deleteSite(domain: string): void {
  if (typeof window === "undefined") return

  try {
    const sites = getSavedSites()
    const filtered = sites.filter((s) => s.domain !== domain)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error deleting from localStorage:", error)
  }
}

export function getSiteByDomain(domain: string): SavedSite | undefined {
  return getSavedSites().find((s) => s.domain === domain)
}
