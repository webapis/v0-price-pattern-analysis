import { sql, type Site, type Selector, type Pattern, type SelectorHistory } from "./db"

// Site operations
export async function getSiteByUrl(url: string): Promise<Site | null> {
  const result = await sql<Site[]>`SELECT * FROM sites WHERE url = ${url}`
  return result.length > 0 ? result[0] : null
}

export async function createSite(url: string, domain: string, name?: string): Promise<Site> {
  const result = await sql<
    Site[]
  >`INSERT INTO sites (url, domain, name) VALUES (${url}, ${domain}, ${name}) RETURNING *`
  return result[0]
}

export async function getAllSites(): Promise<Site[]> {
  return sql<Site[]>`SELECT * FROM sites ORDER BY created_at DESC`
}

// Selector operations
export async function getSelectorsBySiteId(siteId: number): Promise<Selector[]> {
  return sql<Selector[]>`SELECT * FROM selectors WHERE site_id = ${siteId} ORDER BY selector_type`
}

export async function createSelector(
  siteId: number,
  selectorType: string,
  selectorValue: string,
  confidence: number,
): Promise<Selector> {
  const result = await sql<Selector[]>`
    INSERT INTO selectors (site_id, selector_type, selector_value, confidence) 
    VALUES (${siteId}, ${selectorType}, ${selectorValue}, ${confidence}) 
    ON CONFLICT (site_id, selector_type) DO UPDATE 
    SET selector_value = ${selectorValue}, confidence = ${confidence}, updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  return result[0]
}

export async function updateSelectorConfidence(selectorId: number, confidence: number): Promise<Selector> {
  const result = await sql<Selector[]>`
    UPDATE selectors SET confidence = ${confidence}, updated_at = CURRENT_TIMESTAMP WHERE id = ${selectorId} RETURNING *
  `
  return result[0]
}

export async function deleteSelector(selectorId: number): Promise<void> {
  await sql`DELETE FROM selectors WHERE id = ${selectorId}`
}

// Pattern operations
export async function getAllPatterns(): Promise<Pattern[]> {
  return sql<Pattern[]>`SELECT * FROM patterns ORDER BY usage_count DESC`
}

export async function getPatternsByType(patternType: string): Promise<Pattern[]> {
  return sql<Pattern[]>`SELECT * FROM patterns WHERE pattern_type = ${patternType} ORDER BY confidence DESC`
}

export async function createPattern(
  name: string,
  patternType: string,
  selectorPattern: string,
  confidence: number,
  description?: string,
): Promise<Pattern> {
  const result = await sql<Pattern[]>`
    INSERT INTO patterns (name, pattern_type, selector_pattern, confidence, description) 
    VALUES (${name}, ${patternType}, ${selectorPattern}, ${confidence}, ${description}) RETURNING *
  `
  return result[0]
}

// History operations
export async function addSelectorHistory(
  selectorId: number,
  action: string,
  newValue?: string,
  oldValue?: string,
  testResult?: boolean,
  errorMessage?: string,
): Promise<SelectorHistory> {
  const result = await sql<SelectorHistory[]>`
    INSERT INTO selector_history (selector_id, action, new_value, old_value, test_result, error_message) 
    VALUES (${selectorId}, ${action}, ${newValue}, ${oldValue}, ${testResult}, ${errorMessage}) RETURNING *
  `
  return result[0]
}

export async function getSelectorHistory(selectorId: number): Promise<SelectorHistory[]> {
  return sql<
    SelectorHistory[]
  >`SELECT * FROM selector_history WHERE selector_id = ${selectorId} ORDER BY created_at DESC`
}
