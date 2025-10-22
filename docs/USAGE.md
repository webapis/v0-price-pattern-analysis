# User Guide

## Getting Started

### Initial Setup

1. **Open the Application**
   - Navigate to the Selector Repository application
   - You'll see three tabs: Discover, Repository, and Validation

2. **Choose Storage Method**
   - **Browser LocalStorage** (Default): Selectors saved locally in your browser
   - **Supabase** (Optional): Connect to Supabase for cloud storage and team collaboration

## Discovering Selectors

### Step-by-Step Guide

#### 1. Navigate to Discover Tab
Click the "Discover" tab at the top of the application.

#### 2. Enter Product URL
- Paste a product listing URL (e.g., `https://example.com/products`)
- Supported formats:
  - Single product page: `https://example.com/product/123`
  - Product listing: `https://example.com/products`
  - Category page: `https://example.com/category/electronics`

#### 3. Click "Analyze URL"
The system will:
- Fetch the page content
- Analyze the DOM structure
- Identify product elements
- Generate CSS selectors
- Score each selector by confidence

#### 4. Review Results
For each selector type (Container, Title, Image, Price):
- **Selector**: The CSS selector string
- **Confidence**: 0-100 score indicating reliability
- **Match Count**: Number of elements matched
- **Preview**: Sample matched elements

#### 5. Save Selectors
- Click "Save to Repository" to store verified selectors
- Add optional description for future reference
- Selectors are now available in the Repository tab

### Understanding Confidence Scores

| Score | Meaning | Recommendation |
|-------|---------|-----------------|
| 90-100 | Highly reliable | Safe to use in production |
| 70-89 | Good reliability | Test before production use |
| 50-69 | Moderate reliability | Requires validation |
| Below 50 | Low reliability | Not recommended |

## Managing Your Repository

### Viewing Selectors

1. Click the "Repository" tab
2. Selectors are organized by domain
3. Each selector shows:
   - Selector string
   - Type (Container, Title, Image, Price)
   - Confidence score
   - Creation date
   - Last validation date

### Searching Selectors

- Use the search box to filter by:
  - Domain name
  - Selector type
  - Confidence range

### Editing Selectors

1. Click on a selector in the list
2. Click "Edit" button
3. Modify:
   - Description
   - Selector string (advanced)
   - Tags/categories
4. Click "Save Changes"

### Deleting Selectors

1. Select one or more selectors
2. Click "Delete" button
3. Confirm deletion

### Exporting Selectors

1. Click "Export" button
2. Choose format:
   - **JSON**: For programmatic use
   - **CSV**: For spreadsheet analysis
   - **JavaScript**: Ready-to-use in Node.js scripts

## Validating Selectors

### Quick Validation

1. Click the "Validation" tab
2. Select a saved selector from the dropdown
3. Enter a URL to test against
4. Click "Validate"
5. View results:
   - ✅ Valid: Selector found elements
   - ❌ Invalid: Selector found no elements
   - ⚠️ Changed: Selector found different number of elements

### Manual Validation

1. Enter a custom CSS selector
2. Enter a URL to test
3. Click "Validate"
4. Results show:
   - Number of matches
   - Sample matched elements
   - Validation timestamp

### Validation History

- View past validation results
- Track when selectors broke
- Identify patterns in selector failures
- Export validation reports

## Best Practices

### Discovering Selectors

✅ **Do:**
- Test multiple URLs from the same website
- Use specific product pages for better accuracy
- Review confidence scores before saving
- Add descriptive notes to selectors

❌ **Don't:**
- Use selectors with confidence below 50
- Assume selectors work across different websites
- Ignore validation warnings
- Store sensitive data in descriptions

### Managing Selectors

✅ **Do:**
- Organize selectors by website/domain
- Regularly validate selectors
- Update descriptions when selectors change
- Archive outdated selectors

❌ **Don't:**
- Keep duplicate selectors
- Use overly specific selectors
- Ignore validation failures
- Mix selectors from different websites

### Using Selectors

✅ **Do:**
- Test selectors in your scraping tool first
- Implement fallback selectors
- Monitor selector performance
- Update selectors when websites change

❌ **Don't:**
- Use selectors without validation
- Assume selectors are permanent
- Ignore website updates
- Use selectors for unintended purposes

## Troubleshooting

### Issue: "No selectors found"

**Causes:**
- Website uses JavaScript to render content
- Website blocks automated access
- URL is incorrect or inaccessible

**Solutions:**
- Try a different URL from the same website
- Check if the website is accessible in your browser
- Verify the URL format is correct

### Issue: "Low confidence scores"

**Causes:**
- Website has complex or dynamic structure
- Product elements are inconsistently formatted
- Website uses JavaScript frameworks

**Solutions:**
- Try multiple URLs to find patterns
- Manually refine selectors
- Use more specific selectors

### Issue: "Validation failed"

**Causes:**
- Website updated its HTML structure
- Selector was too specific
- Website blocks automated validation

**Solutions:**
- Re-discover selectors from the website
- Use more general selectors
- Check if website is accessible

## Tips & Tricks

### Finding Better Selectors

1. **Use Browser DevTools**
   - Right-click element → Inspect
   - Copy CSS selector from DevTools
   - Paste into validation tool

2. **Test Multiple Variations**
   - Try different selector strategies
   - Compare confidence scores
   - Choose the most reliable option

3. **Combine Selectors**
   - Use multiple selectors for redundancy
   - Implement fallback logic
   - Increase reliability

### Organizing Your Repository

1. **Use Consistent Naming**
   - Include website name
   - Specify element type
   - Add version number if needed

2. **Add Detailed Descriptions**
   - Note any special requirements
   - Document known issues
   - Include usage examples

3. **Regular Maintenance**
   - Validate selectors monthly
   - Remove unused selectors
   - Update descriptions

## Advanced Usage

### Exporting for Development

\`\`\`javascript
// Import exported JSON
const selectors = require('./selectors.json');

// Use in your scraping tool
const titleSelector = selectors.find(s => s.type === 'title');
const elements = document.querySelectorAll(titleSelector.selector);
\`\`\`

### Batch Validation

1. Export selectors as CSV
2. Use external tools to validate
3. Import results back

### Integration with Scraping Tools

- Copy selectors directly into your scraping scripts
- Use exported JSON for programmatic access
- Implement selector versioning in your tools
