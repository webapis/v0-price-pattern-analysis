import { type NextRequest, NextResponse } from "next/server"
import { getAllSites, getSelectorsBySiteId } from "@/lib/db-operations"

export async function GET(request: NextRequest) {
  try {
    const sites = await getAllSites()

    // Get selectors for each site
    const sitesWithSelectors = await Promise.all(
      sites.map(async (site) => ({
        ...site,
        selectors: await getSelectorsBySiteId(site.id),
      })),
    )

    return NextResponse.json(sitesWithSelectors)
  } catch (error) {
    console.error("Error fetching selectors:", error)
    return NextResponse.json({ error: "Failed to fetch selectors" }, { status: 500 })
  }
}
