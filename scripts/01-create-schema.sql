-- Create sites table to store website information
CREATE TABLE IF NOT EXISTS sites (
  id SERIAL PRIMARY KEY,
  url VARCHAR(255) UNIQUE NOT NULL,
  domain VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create selectors table to store CSS selectors for different data types
CREATE TABLE IF NOT EXISTS selectors (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  selector_type VARCHAR(50) NOT NULL, -- 'container', 'title', 'price', 'image', 'description'
  selector_value VARCHAR(500) NOT NULL,
  confidence DECIMAL(3, 2) DEFAULT 0.00, -- 0.00 to 1.00
  test_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_tested TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(site_id, selector_type)
);

-- Create selector_history table to track selector changes and validations
CREATE TABLE IF NOT EXISTS selector_history (
  id SERIAL PRIMARY KEY,
  selector_id INTEGER NOT NULL REFERENCES selectors(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'tested', 'validated'
  old_value VARCHAR(500),
  new_value VARCHAR(500),
  test_result BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create patterns table to store identified patterns for reuse
CREATE TABLE IF NOT EXISTS patterns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  pattern_type VARCHAR(50) NOT NULL, -- 'container', 'title', 'price', 'image'
  selector_pattern VARCHAR(500) NOT NULL,
  confidence DECIMAL(3, 2) DEFAULT 0.00,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_sites_domain ON sites(domain);
CREATE INDEX idx_selectors_site_id ON selectors(site_id);
CREATE INDEX idx_selectors_type ON selectors(selector_type);
CREATE INDEX idx_selector_history_selector_id ON selector_history(selector_id);
CREATE INDEX idx_patterns_type ON patterns(pattern_type);
