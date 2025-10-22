# Architecture Overview

## System Design

The Selector Repository follows a modular architecture with clear separation of concerns:

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┬──────────────┬──────────────────────┐ │
│  │  Discover    │  Repository  │    Validation        │ │
│  │  Component   │  Component   │    Component         │ │
│  └──────────────┴──────────────┴──────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              State Management (React Hooks)             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  useSelectors, useValidation, useDiscovery      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Storage Layer                              │
│  ┌──────────────────┬──────────────────────────────┐   │
│  │  LocalStorage    │  Supabase (PostgreSQL)      │   │
│  │  (Browser)       │  (Cloud)                    │   │
│  └──────────────────┴──────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
\`\`\`

## Component Structure

### Main Components

1. **SelectorManagementUI** (`components/selector-management-ui.tsx`)
   - Main container component
   - Manages tab navigation
   - Coordinates between sub-components

2. **Discover Tab**
   - URL input form
   - Analysis trigger
   - Results display with confidence scores
   - Save to repository button

3. **Repository Tab**
   - Selector list view
   - Filter and search functionality
   - Edit/delete operations
   - Export functionality

4. **Validation Tab**
   - Selector input
   - URL input for testing
   - Validation results
   - History view

## Pattern Identification System

### Algorithm Flow

\`\`\`
Input URL
    ↓
Fetch Page Content
    ↓
Parse DOM Structure
    ↓
┌─────────────────────────────────────────┐
│  Pattern Recognition Engines            │
├─────────────────────────────────────────┤
│ • Container Detection                   │
│ • Title Pattern Matching                │
│ • Image Recognition                     │
│ • Price Pattern Matching                │
└─────────────────────────────────────────┘
    ↓
Generate Candidate Selectors
    ↓
Score & Rank Results
    ↓
Return Top Matches with Confidence
\`\`\`

### Pattern Identifiers

Located in `lib/pattern-identifiers.ts`:

- **identifyProductContainers()**: Finds repeating container elements
- **identifyProductTitles()**: Locates product title elements
- **identifyProductImages()**: Finds image elements
- **identifyProductPrices()**: Identifies price elements

Each identifier returns:
\`\`\`typescript
{
  selector: string;
  confidence: number;
  matchCount: number;
  examples: string[];
}
\`\`\`

## Storage Architecture

### LocalStorage (Default)

\`\`\`typescript
// Key: 'selector-repository'
{
  selectors: Selector[];
  validationHistory: ValidationRecord[];
  lastUpdated: Date;
}
\`\`\`

### Supabase (Optional)

#### Tables

**selectors**
\`\`\`sql
- id (UUID, Primary Key)
- url (TEXT)
- domain (TEXT)
- selector_type (ENUM: container, title, image, price)
- selector (TEXT)
- confidence (INTEGER 0-100)
- description (TEXT)
- created_at (TIMESTAMP)
- last_validated (TIMESTAMP)
- is_valid (BOOLEAN)
- user_id (UUID, Foreign Key)
\`\`\`

**validation_history**
\`\`\`sql
- id (UUID, Primary Key)
- selector_id (UUID, Foreign Key)
- url (TEXT)
- is_valid (BOOLEAN)
- match_count (INTEGER)
- validated_at (TIMESTAMP)
- error_message (TEXT)
\`\`\`

**sites**
\`\`\`sql
- id (UUID, Primary Key)
- domain (TEXT, Unique)
- name (TEXT)
- last_analyzed (TIMESTAMP)
- selector_count (INTEGER)
- created_at (TIMESTAMP)
\`\`\`

## Data Flow

### Discovering Selectors

\`\`\`
User Input (URL)
    ↓
Validate URL Format
    ↓
Fetch Page Content
    ↓
Run Pattern Identifiers
    ↓
Score Results
    ↓
Display in UI
    ↓
User Reviews & Saves
    ↓
Store in Repository
\`\`\`

### Validating Selectors

\`\`\`
User Input (Selector + URL)
    ↓
Fetch Page Content
    ↓
Query DOM with Selector
    ↓
Count Matches
    ↓
Record Result
    ↓
Display Validation Status
    ↓
Update History
\`\`\`

## Performance Considerations

1. **Caching**: Frequently analyzed URLs are cached
2. **Lazy Loading**: Selectors loaded on demand
3. **Debouncing**: URL input debounced to prevent excessive analysis
4. **Pagination**: Large selector lists paginated for performance
5. **Indexing**: Supabase indexes on domain and selector_type

## Security Architecture

1. **Input Validation**: All URLs validated before processing
2. **DOM Queries Only**: No data extraction, only selector validation
3. **CORS Handling**: Requests respect CORS policies
4. **Rate Limiting**: API endpoints rate-limited to prevent abuse
5. **Data Privacy**: No sensitive data stored in selectors

## Extensibility Points

1. **Custom Pattern Identifiers**: Add new pattern recognition algorithms
2. **Storage Backends**: Implement alternative storage providers
3. **Validation Strategies**: Add custom validation logic
4. **Export Formats**: Support additional export formats
5. **Integration Hooks**: Connect with external tools and services
