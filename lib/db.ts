import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Type definitions for database operations
export interface Site {
  id: number
  url: string
  domain: string
  name?: string
  created_at: string
  updated_at: string
}

export interface Selector {
  id: number
  site_id: number
  selector_type: string
  selector_value: string
  confidence: number
  test_count: number
  success_count: number
  last_tested?: string
  created_at: string
  updated_at: string
}

export interface Pattern {
  id: number
  name: string
  description?: string
  pattern_type: string
  selector_pattern: string
  confidence: number
  usage_count: number
  created_at: string
  updated_at: string
}

export interface SelectorHistory {
  id: number
  selector_id: number
  action: string
  old_value?: string
  new_value?: string
  test_result?: boolean
  error_message?: string
  created_at: string
}
