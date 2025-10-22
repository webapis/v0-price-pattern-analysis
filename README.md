# Selector Repository

A powerful web scraping management system that separates CSS selector discovery from data extraction. This application helps you identify, validate, and manage CSS selectors for e-commerce product data across different websites.

## 🎯 Purpose

The Selector Repository solves a critical problem in web scraping: **selector fragility**. When websites update their HTML structure, scraping scripts break because the CSS selectors no longer match the target elements.

This application provides a centralized repository to:
- **Discover** CSS selectors for product data (titles, prices, images, containers)
- **Validate** selectors against live URLs to ensure they still work
- **Store** verified selectors for reuse across multiple scraping tools
- **Manage** your selector library with version control and metadata

## 🚀 Key Features

### 1. **Discover Tab**
- Analyze any e-commerce product listing URL
- Automatically identify CSS selectors for:
  - Product containers
  - Product titles
  - Product images
  - Product prices
- Confidence scoring for each discovered selector
- Visual preview of matched elements

### 2. **Repository Tab**
- View all saved selector patterns
- Organize selectors by website/domain
- Edit selector metadata and descriptions
- Delete outdated selectors
- Export selectors for use in scraping tools

### 3. **Validation Tab**
- Test selectors against live URLs
- Verify selectors still work after website updates
- Track validation history
- Get alerts when selectors break

## 💡 How It Works

### Workflow

\`\`\`
1. Enter Product URL
   ↓
2. System Analyzes Page Structure
   ↓
3. Pattern Recognition Identifies Selectors
   ↓
4. Confidence Scoring Ranks Results
   ↓
5. Review & Save to Repository
   ↓
6. Use in Your Scraping Tools
\`\`\`

### Pattern Identification Algorithm

The system uses multiple strategies to identify selectors:

- **Container Detection**: Identifies repeating product container elements
- **Title Pattern Matching**: Finds product title elements using text analysis
- **Image Recognition**: Locates product image elements
- **Price Pattern Matching**: Identifies price elements using regex patterns
- **Confidence Scoring**: Ranks selectors based on consistency and reliability

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks
- **Storage**: Supabase (PostgreSQL) or Browser LocalStorage
- **Analysis**: DOM pattern recognition algorithms

## 📦 Data Structure

### Selector Object
\`\`\`typescript
{
  id: string;
  url: string;
  domain: string;
  selectorType: 'container' | 'title' | 'image' | 'price';
  selector: string;
  confidence: number; // 0-100
  description: string;
  createdAt: Date;
  lastValidated: Date;
  isValid: boolean;
}
\`\`\`

## 🔄 Integration with Supabase

When connected to Supabase, the application stores:
- **Selectors Table**: All discovered and saved selectors
- **Validation History**: Track when selectors were tested
- **Sites Table**: Metadata about analyzed websites
- **User Preferences**: Saved settings and configurations

## 📖 Usage Guide

### Discovering Selectors

1. Navigate to the **Discover** tab
2. Enter a product listing URL (e.g., `https://example.com/products`)
3. Click "Analyze URL"
4. Review the discovered selectors and confidence scores
5. Click "Save to Repository" to store verified selectors

### Managing Your Repository

1. Go to the **Repository** tab
2. View all saved selectors organized by domain
3. Click on a selector to view details
4. Edit descriptions or delete outdated selectors
5. Copy selectors to use in your scraping scripts

### Validating Selectors

1. Navigate to the **Validation** tab
2. Select a saved selector or enter a new one
3. Enter a URL to test against
4. Click "Validate"
5. View validation results and history

## 🔐 Security Considerations

- Selectors are stored locally or in your Supabase database
- No sensitive data (passwords, API keys) should be stored
- Selectors are read-only when used in external tools
- Validation only performs DOM queries, no data extraction

## 🚀 Future Enhancements

- [ ] Puppeteer integration for real-time page analysis
- [ ] Selector versioning and rollback
- [ ] Team collaboration features
- [ ] Selector performance metrics
- [ ] AI-powered selector optimization
- [ ] Browser extension for one-click selector discovery
- [ ] API for programmatic selector access
- [ ] Webhook notifications for broken selectors

## 📝 API Reference

### Discover Selectors
\`\`\`
POST /api/discover
Body: { url: string }
Response: { selectors: Selector[], analysis: AnalysisResult }
\`\`\`

### Save Selector
\`\`\`
POST /api/selectors
Body: { selector: Selector }
Response: { id: string, success: boolean }
\`\`\`

### Validate Selector
\`\`\`
POST /api/validate
Body: { selector: string, url: string }
Response: { isValid: boolean, matchCount: number }
\`\`\`

## 🤝 Contributing

This project is designed to be extended. You can:
- Add new pattern recognition algorithms
- Integrate with additional data sources
- Build custom validation rules
- Create browser extensions

## 📄 License

MIT License - Feel free to use and modify for your projects.

## 🆘 Support

For issues, questions, or feature requests, please refer to the documentation files in the `/docs` directory.
