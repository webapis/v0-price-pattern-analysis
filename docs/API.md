# API Reference

## Overview

The Selector Repository provides REST APIs for programmatic access to selector discovery, validation, and management.

## Base URL

\`\`\`
http://localhost:3000/api
\`\`\`

## Authentication

Currently, the API uses localStorage for client-side storage. For Supabase integration, authentication is handled via Supabase Auth.

## Endpoints

### Discover Selectors

**Endpoint:** `POST /api/discover`

**Description:** Analyze a URL and discover CSS selectors for product data.

**Request:**
\`\`\`json
{
  "url": "https://example.com/products",
  "options": {
    "timeout": 30000,
    "retries": 3
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "url": "https://example.com/products",
    "domain": "example.com",
    "selectors": [
      {
        "type": "container",
        "selector": ".product-item",
        "confidence": 95,
        "matchCount": 24,
        "examples": [".product-item:nth-child(1)", ".product-item:nth-child(2)"]
      },
      {
        "type": "title",
        "selector": ".product-item .title",
        "confidence": 92,
        "matchCount": 24
      },
      {
        "type": "price",
        "selector": ".product-item .price",
        "confidence": 88,
        "matchCount": 24
      },
      {
        "type": "image",
        "selector": ".product-item img",
        "confidence": 90,
        "matchCount": 24
      }
    ],
    "analysis": {
      "totalElements": 24,
      "analysisTime": 1250,
      "pageSize": 1024000
    }
  }
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "success": false,
  "error": "Failed to fetch URL",
  "code": "FETCH_ERROR"
}
\`\`\`

### Save Selector

**Endpoint:** `POST /api/selectors`

**Description:** Save a selector to the repository.

**Request:**
\`\`\`json
{
  "selector": {
    "url": "https://example.com/products",
    "domain": "example.com",
    "type": "title",
    "selector": ".product-item .title",
    "confidence": 92,
    "description": "Product title selector for example.com"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "sel_123456",
    "createdAt": "2024-01-15T10:30:00Z",
    "selector": {
      "url": "https://example.com/products",
      "domain": "example.com",
      "type": "title",
      "selector": ".product-item .title",
      "confidence": 92,
      "description": "Product title selector for example.com"
    }
  }
}
\`\`\`

### Get Selectors

**Endpoint:** `GET /api/selectors`

**Description:** Retrieve saved selectors with optional filtering.

**Query Parameters:**
- `domain` (optional): Filter by domain
- `type` (optional): Filter by type (container, title, image, price)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
\`\`\`
GET /api/selectors?domain=example.com&type=title&limit=10
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "selectors": [
      {
        "id": "sel_123456",
        "url": "https://example.com/products",
        "domain": "example.com",
        "type": "title",
        "selector": ".product-item .title",
        "confidence": 92,
        "description": "Product title selector",
        "createdAt": "2024-01-15T10:30:00Z",
        "lastValidated": "2024-01-20T14:22:00Z",
        "isValid": true
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
\`\`\`

### Get Selector by ID

**Endpoint:** `GET /api/selectors/:id`

**Description:** Retrieve a specific selector by ID.

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "sel_123456",
    "url": "https://example.com/products",
    "domain": "example.com",
    "type": "title",
    "selector": ".product-item .title",
    "confidence": 92,
    "description": "Product title selector",
    "createdAt": "2024-01-15T10:30:00Z",
    "lastValidated": "2024-01-20T14:22:00Z",
    "isValid": true
  }
}
\`\`\`

### Update Selector

**Endpoint:** `PUT /api/selectors/:id`

**Description:** Update a selector.

**Request:**
\`\`\`json
{
  "description": "Updated description",
  "selector": ".product-item .product-title"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "sel_123456",
    "updated": true,
    "selector": {
      "id": "sel_123456",
      "selector": ".product-item .product-title",
      "description": "Updated description"
    }
  }
}
\`\`\`

### Delete Selector

**Endpoint:** `DELETE /api/selectors/:id`

**Description:** Delete a selector.

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "sel_123456",
    "deleted": true
  }
}
\`\`\`

### Validate Selector

**Endpoint:** `POST /api/validate`

**Description:** Test a selector against a URL.

**Request:**
\`\`\`json
{
  "selector": ".product-item .title",
  "url": "https://example.com/products"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "isValid": true,
    "matchCount": 24,
    "examples": [
      "Product Title 1",
      "Product Title 2"
    ],
    "validatedAt": "2024-01-20T14:22:00Z"
  }
}
\`\`\`

### Get Validation History

**Endpoint:** `GET /api/selectors/:id/validation-history`

**Description:** Get validation history for a selector.

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "selectorId": "sel_123456",
    "history": [
      {
        "id": "val_789",
        "url": "https://example.com/products",
        "isValid": true,
        "matchCount": 24,
        "validatedAt": "2024-01-20T14:22:00Z"
      },
      {
        "id": "val_788",
        "url": "https://example.com/products",
        "isValid": true,
        "matchCount": 24,
        "validatedAt": "2024-01-19T10:15:00Z"
      }
    ]
  }
}
\`\`\`

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| FETCH_ERROR | 400 | Failed to fetch URL |
| INVALID_URL | 400 | URL format is invalid |
| TIMEOUT | 408 | Request timeout |
| NOT_FOUND | 404 | Selector not found |
| VALIDATION_ERROR | 422 | Validation failed |
| INTERNAL_ERROR | 500 | Internal server error |

## Rate Limiting

- **Discovery**: 10 requests per minute
- **Validation**: 30 requests per minute
- **Storage**: 100 requests per minute

## Examples

### JavaScript/Node.js

\`\`\`javascript
// Discover selectors
const response = await fetch('/api/discover', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com/products'
  })
});

const { data } = await response.json();
console.log(data.selectors);

// Save selector
await fetch('/api/selectors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    selector: data.selectors[0]
  })
});

// Validate selector
const validation = await fetch('/api/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    selector: '.product-item .title',
    url: 'https://example.com/products'
  })
});

const { data: validationResult } = await validation.json();
console.log(`Valid: ${validationResult.isValid}, Matches: ${validationResult.matchCount}`);
\`\`\`

### Python

\`\`\`python
import requests
import json

# Discover selectors
response = requests.post('http://localhost:3000/api/discover', json={
    'url': 'https://example.com/products'
})

data = response.json()['data']
print(f"Found {len(data['selectors'])} selectors")

# Save selector
requests.post('http://localhost:3000/api/selectors', json={
    'selector': data['selectors'][0]
})

# Validate selector
validation = requests.post('http://localhost:3000/api/validate', json={
    'selector': '.product-item .title',
    'url': 'https://example.com/products'
})

result = validation.json()['data']
print(f"Valid: {result['isValid']}, Matches: {result['matchCount']}")
\`\`\`

## Webhooks (Future)

Webhooks will be available for:
- Selector validation failures
- New selectors discovered
- Selector updates
- Validation history changes
