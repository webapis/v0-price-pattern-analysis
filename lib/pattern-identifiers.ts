// Product container identification
export function identifyProductContainers(options = {}) {
  const config = {
    knownSelectors: [".product-card", ".product-item", ".product", "[data-product]"],
    minConfidence: 0.6,
    minChildElements: 3,
    maxDepth: 10,
    imageRequired: true,
    priceRequired: true,
    titleRequired: true,
    ...options,
  }

  const results = []

  function calculateConfidence(element) {
    let score = 0
    let maxScore = 0
    const characteristics = {}

    maxScore += 20
    const classList = typeof element.className === "string" ? element.className.toLowerCase() : ""
    const idAttr = (element.id || "").toLowerCase()

    if (classList.includes("product")) {
      score += 15
      characteristics.hasProductClass = true
    }
    if (classList.includes("item") || classList.includes("card")) {
      score += 5
      characteristics.hasContainerClass = true
    }

    maxScore += 15
    const dataAttrs = Array.from(element.attributes || [])
      .filter((attr) => attr.name.startsWith("data-"))
      .map((attr) => attr.name.toLowerCase())

    if (dataAttrs.some((attr) => attr.includes("product"))) {
      score += 10
      characteristics.hasProductDataAttr = true
    }

    maxScore += 20
    const images = element.querySelectorAll("img")
    if (images.length > 0) {
      score += 15
      characteristics.hasImage = true
    }

    maxScore += 20
    const text = element.textContent
    const pricePatterns = [
      /\$\s*\d+(?:\.\d{2})?/,
      /\d+(?:\.\d{2})?\s*TL/,
      /\d+(?:\.\d{2})?\s*EUR/,
      /\d+(?:\.\d{2})?\s*USD/,
      /\d+(?:,\d{3})*(?:\.\d{2})?/,
    ]

    const hasPrice = pricePatterns.some((pattern) => pattern.test(text))
    if (hasPrice) {
      score += 15
      characteristics.hasPrice = true
    }

    maxScore += 15
    const titles = element.querySelectorAll('h1, h2, h3, h4, [class*="title"], [class*="name"]')
    if (titles.length > 0) {
      score += 10
      characteristics.hasTitle = true
    }

    maxScore += 10
    const links = element.querySelectorAll("a[href]")
    if (links.length > 0) {
      score += 5
      characteristics.hasLinks = true
    }

    maxScore += 10
    const childCount = element.children.length
    if (childCount >= config.minChildElements && childCount <= 20) {
      score += 5
      characteristics.hasAppropriateStructure = true
    }

    maxScore += 10
    const rect = element.getBoundingClientRect()
    const hasReasonableSize = rect.width > 100 && rect.width < 800 && rect.height > 100 && rect.height < 1000
    if (hasReasonableSize) {
      score += 10
      characteristics.hasReasonableDimensions = true
    }

    const normalizedScore = maxScore > 0 ? score / maxScore : 0
    return {
      score: normalizedScore,
      characteristics,
      rawScore: score,
      maxScore,
    }
  }

  function generateSelector(element) {
    if (element.id) return `#${element.id}`

    const path = []
    let current = element

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase()

      if (current.className) {
        const classes = current.className.trim().split(/\s+/).slice(0, 2)
        selector += "." + classes.join(".")
      }

      path.unshift(selector)
      current = current.parentElement

      if (path.length >= 3) break
    }

    return path.join(" > ")
  }

  const candidateElements = new Set()

  config.knownSelectors.forEach((selector) => {
    try {
      document.querySelectorAll(selector).forEach((el) => candidateElements.add(el))
    } catch (e) {
      console.warn(`Invalid selector: ${selector}`)
    }
  })

  const allElements = document.querySelectorAll("div, article, li, section")
  allElements.forEach((el) => {
    const confidence = calculateConfidence(el)
    if (confidence.score >= config.minConfidence) {
      candidateElements.add(el)
    }
  })

  candidateElements.forEach((element) => {
    const confidence = calculateConfidence(element)

    if (confidence.score >= config.minConfidence) {
      results.push({
        element,
        confidence: confidence.score,
        characteristics: confidence.characteristics,
        selector: generateSelector(element),
      })
    }
  })

  results.sort((a, b) => b.confidence - a.confidence)

  return {
    products: results.slice(0, 10),
    summary: {
      totalFound: results.length,
      highConfidence: results.filter((r) => r.confidence >= 0.8).length,
    },
  }
}

// Title pattern identification
export function identifyProductTitlePattern(productContainers, options = {}) {
  const config = {
    minTextLength: 5,
    maxTextLength: 200,
    minConfidence: 0.5,
    headingTags: ["h1", "h2", "h3", "h4", "h5", "h6"],
    titleClasses: ["title", "name", "product-title", "product-name", "heading"],
    sampleSize: 10,
    ...options,
  }

  const containers = Array.isArray(productContainers) ? productContainers : [productContainers]
  const allCandidates = []

  function calculateTitleConfidence(element, container) {
    let score = 0
    let maxScore = 0
    const features = {}

    maxScore += 25
    const tagName = element.tagName.toLowerCase()

    if (config.headingTags.includes(tagName)) {
      score += 20
      features.isHeading = true
      if (tagName === "h2" || tagName === "h3") {
        score += 5
        features.isOptimalHeading = true
      }
    }

    maxScore += 20
    const classList = (element.className || "").toLowerCase()
    config.titleClasses.forEach((pattern) => {
      if (classList.includes(pattern)) {
        score += 15
        features.hasTitleClass = true
      }
    })

    maxScore += 20
    const text = element.textContent.trim()
    const textLength = text.length

    if (textLength >= config.minTextLength && textLength <= config.maxTextLength) {
      score += 10
      features.hasAppropriateLength = true
      if (textLength >= 20 && textLength <= 80) {
        score += 5
        features.hasOptimalLength = true
      }
    }

    maxScore += 15
    const containerRect = container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const relativePosition = (elementRect.top - containerRect.top) / containerRect.height
    if (relativePosition <= 0.6) {
      score += 10
      features.isInUpperPortion = true
    }

    maxScore += 10
    const computedStyle = window.getComputedStyle(element)
    const fontSize = Number.parseFloat(computedStyle.fontSize)
    const containerFontSize = Number.parseFloat(window.getComputedStyle(container).fontSize)

    if (fontSize >= containerFontSize * 1.1) {
      score += 5
      features.hasLargerFont = true
    }

    maxScore += 10
    const normalizedScore = maxScore > 0 ? Math.max(0, score) / maxScore : 0

    return {
      score: normalizedScore,
      features,
      text,
      rawScore: score,
      maxScore,
    }
  }

  function generateDetailedSelector(element, container) {
    const path = []
    let current = element

    while (current && current !== container && current !== document.body) {
      let selector = current.tagName.toLowerCase()

      if (current.id) {
        selector = `#${current.id}`
        path.unshift(selector)
        break
      }

      if (current.className) {
        const classes = current.className.trim().split(/\s+/).slice(0, 2)
        if (classes.length > 0) {
          selector += "." + classes.join(".")
        }
      }

      path.unshift(selector)
      current = current.parentElement
    }

    return path.join(" > ")
  }

  const sampleContainers = containers.slice(0, config.sampleSize)

  sampleContainers.forEach((container) => {
    config.headingTags.forEach((tag) => {
      container.querySelectorAll(tag).forEach((el) => {
        if (el.textContent.trim().length >= config.minTextLength) {
          const analysis = calculateTitleConfidence(el, container)
          if (analysis.score >= config.minConfidence) {
            allCandidates.push({
              element: el,
              ...analysis,
              selector: generateDetailedSelector(el, container),
            })
          }
        }
      })
    })
  })

  allCandidates.sort((a, b) => b.score - a.score)

  const bestPattern = allCandidates[0]

  return {
    bestPattern: bestPattern
      ? {
          selector: bestPattern.selector,
          tagName: bestPattern.element.tagName.toLowerCase(),
          confidence: bestPattern.score,
          description: `${bestPattern.element.tagName.toUpperCase()} heading tag with title-related content`,
          examples: allCandidates.slice(0, 3).map((c) => c.text),
        }
      : null,
    topCandidates: allCandidates.slice(0, 10),
    statistics: {
      totalContainersAnalyzed: sampleContainers.length,
      totalCandidatesFound: allCandidates.length,
    },
  }
}

// Image pattern identification
export function identifyProductImagePattern(productContainers, options = {}) {
  const config = {
    minWidth: 50,
    minHeight: 50,
    maxWidth: 1200,
    maxHeight: 1200,
    minConfidence: 0.5,
    imageClasses: ["product-image", "product-img", "item-image", "thumb", "thumbnail"],
    sampleSize: 10,
    includeLazyLoaded: true,
    ...options,
  }

  const containers = Array.isArray(productContainers) ? productContainers : [productContainers]
  const allCandidates = []

  function calculateImageConfidence(img, container) {
    let score = 0
    let maxScore = 0
    const features = {}

    maxScore += 20
    const alt = (img.alt || "").toLowerCase()
    const classList = (img.className || "").toLowerCase()

    if (alt.length > 0) {
      score += 5
      features.hasAlt = true
    }

    config.imageClasses.forEach((pattern) => {
      if (classList.includes(pattern)) {
        score += 10
        features.hasImageClass = true
      }
    })

    maxScore += 15
    if (img.src && img.src !== "" && !img.src.includes("placeholder")) {
      score += 5
      features.hasValidSrc = true
    }

    maxScore += 25
    const rect = img.getBoundingClientRect()

    if (
      rect.width >= config.minWidth &&
      rect.height >= config.minHeight &&
      rect.width <= config.maxWidth &&
      rect.height <= config.maxHeight
    ) {
      score += 15
      features.hasAppropriateSize = true

      if (rect.width >= 150 && rect.width <= 500) {
        score += 5
        features.hasOptimalSize = true
      }
    }

    maxScore += 20
    const containerRect = container.getBoundingClientRect()
    const relativePosition = (rect.top - containerRect.top) / containerRect.height
    if (relativePosition <= 0.5) {
      score += 10
      features.isInUpperHalf = true
    }

    maxScore += 15
    const parent = img.parentElement
    const parentClass = (parent?.className || "").toLowerCase()

    if (parentClass.includes("image") || parentClass.includes("picture")) {
      score += 10
      features.hasImageWrapper = true
    }

    maxScore += 5
    const computedStyle = window.getComputedStyle(img)
    if (computedStyle.visibility !== "hidden" && computedStyle.display !== "none") {
      score += 5
      features.isVisible = true
    }

    const normalizedScore = maxScore > 0 ? Math.max(0, score) / maxScore : 0

    return {
      score: normalizedScore,
      features,
      dimensions: {
        displayWidth: rect.width,
        displayHeight: rect.height,
        aspectRatio: rect.width / rect.height,
      },
      rawScore: score,
      maxScore,
    }
  }

  function generateDetailedSelector(element, container) {
    const path = []
    let current = element

    while (current && current !== container && current !== document.body) {
      let selector = current.tagName.toLowerCase()

      if (current.id) {
        selector = `#${current.id}`
        path.unshift(selector)
        break
      }

      if (current.className) {
        const classes = current.className
          .trim()
          .split(/\s+/)
          .filter((c) => c.length > 0)
          .slice(0, 2)
        if (classes.length > 0) {
          selector += "." + classes.join(".")
        }
      }

      path.unshift(selector)
      current = current.parentElement

      if (path.length >= 4) break
    }

    return path.join(" > ")
  }

  const sampleContainers = containers.slice(0, config.sampleSize)

  sampleContainers.forEach((container) => {
    const images = container.querySelectorAll("img")

    images.forEach((img) => {
      const analysis = calculateImageConfidence(img, container)

      if (analysis.score >= config.minConfidence) {
        allCandidates.push({
          element: img,
          ...analysis,
          selector: generateDetailedSelector(img, container),
        })
      }
    })
  })

  allCandidates.sort((a, b) => b.score - a.score)

  const bestPattern = allCandidates[0]

  return {
    bestPattern: bestPattern
      ? {
          selector: bestPattern.selector,
          fullSelector: bestPattern.selector,
          tagName: "img",
          isInSlider: false,
          isLazyLoaded: false,
          isBackgroundImage: false,
          confidence: bestPattern.score,
          frequency: 1.0,
          avgDimensions: {
            width: Math.round(bestPattern.dimensions.displayWidth),
            height: Math.round(bestPattern.dimensions.displayHeight),
          },
          description: "IMG element with product image characteristics",
          hasGallery: false,
          galleryPattern: null,
        }
      : null,
    topCandidates: allCandidates.slice(0, 10),
    galleries: [],
    statistics: {
      totalContainersAnalyzed: sampleContainers.length,
      totalImagesFound: allCandidates.length,
      avgImagesPerContainer: allCandidates.length / sampleContainers.length,
      highConfidenceCount: allCandidates.filter((c) => c.score >= 0.8).length,
    },
  }
}

// Price pattern identification
export function identifyProductPricePattern(productContainers, options = {}) {
  const config = {
    currencies: ["TL", "USD", "EUR", "GBP", "₺", "$", "€", "£"],
    minConfidence: 0.5,
    priceClasses: [
      "price",
      "cost",
      "amount",
      "value",
      "sale",
      "discount",
      "original",
      "regular",
      "special",
      "offer",
      "deal",
    ],
    sampleSize: 10,
    includeStrikethrough: true,
    ...options,
  }

  const containers = Array.isArray(productContainers) ? productContainers : [productContainers]
  const allPriceCandidates = []

  function extractPrice(text) {
    if (!text) return null

    const normalized = text.trim().replace(/\s+/g, " ")

    const patterns = [
      /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(TL|₺|USD|EUR|GBP|\$|€|£)/i,
      /(TL|₺|USD|EUR|GBP|\$|€|£)\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/i,
      /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/,
    ]

    for (const pattern of patterns) {
      const match = normalized.match(pattern)
      if (match) {
        let priceStr = match[1]
        let currency = match[2] || ""

        if (config.currencies.includes(match[1])) {
          currency = match[1]
          priceStr = match[2]
        }

        const lastComma = priceStr.lastIndexOf(",")
        const lastDot = priceStr.lastIndexOf(".")

        if (lastComma > lastDot) {
          priceStr = priceStr.replace(/\./g, "").replace(",", ".")
        } else {
          priceStr = priceStr.replace(/,/g, "")
        }

        const numericValue = Number.parseFloat(priceStr)

        if (!isNaN(numericValue) && numericValue > 0) {
          return {
            value: numericValue,
            currency: currency,
            originalText: match[0],
            formatted: `${numericValue.toFixed(2)} ${currency}`.trim(),
          }
        }
      }
    }

    return null
  }

  function calculatePriceConfidence(element, container, priceData) {
    let score = 0
    let maxScore = 30

    if (priceData) {
      score += 25
      if (priceData.currency) {
        score += 5
      }
    }

    maxScore += 20
    const classList = (element.className || "").toLowerCase()
    config.priceClasses.forEach((pattern) => {
      if (classList.includes(pattern)) {
        score += 15
      }
    })

    maxScore += 15
    const containerRect = container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const relativePosition = (elementRect.top - containerRect.top) / containerRect.height
    if (relativePosition >= 0.4 && relativePosition <= 0.9) {
      score += 10
    }

    maxScore += 15
    const tagName = element.tagName.toLowerCase()
    if (tagName === "span" || tagName === "div") {
      score += 10
    }

    maxScore += 15
    const computedStyle = window.getComputedStyle(element)
    if (computedStyle.textDecoration.includes("line-through")) {
      score += 15
    }

    const normalizedScore = maxScore > 0 ? score / maxScore : 0

    return {
      score: normalizedScore,
      rawScore: score,
      maxScore,
    }
  }

  function generateDetailedSelector(element, container) {
    const path = []
    let current = element

    while (current && current !== container && current !== document.body) {
      let selector = current.tagName.toLowerCase()

      if (current.id) {
        selector = `#${current.id}`
        path.unshift(selector)
        break
      }

      if (current.className) {
        const classes = current.className.trim().split(/\s+/).slice(0, 2)
        if (classes.length > 0) {
          selector += "." + classes.join(".")
        }
      }

      path.unshift(selector)
      current = current.parentElement

      if (path.length >= 4) break
    }

    return path.join(" > ")
  }

  const sampleContainers = containers.slice(0, config.sampleSize)

  sampleContainers.forEach((container) => {
    config.priceClasses.forEach((priceClass) => {
      container.querySelectorAll(`[class*="${priceClass}"]`).forEach((el) => {
        const priceData = extractPrice(el.textContent)
        if (priceData) {
          const analysis = calculatePriceConfidence(el, container, priceData)
          if (analysis.score >= config.minConfidence) {
            allPriceCandidates.push({
              element: el,
              price: priceData,
              ...analysis,
              selector: generateDetailedSelector(el, container),
            })
          }
        }
      })
    })
  })

  allPriceCandidates.sort((a, b) => b.score - a.score)

  const currentPattern = allPriceCandidates[0]
  const originalPattern = allPriceCandidates.find((p) =>
    window.getComputedStyle(p.element).textDecoration.includes("line-through"),
  )

  return {
    pricePatterns: {
      current: currentPattern
        ? {
            examples: [{ selector: currentPattern.selector, price: currentPattern.price.formatted }],
            avgConfidence: currentPattern.score,
            count: allPriceCandidates.length,
          }
        : null,
      original: originalPattern
        ? {
            examples: [{ selector: originalPattern.selector, price: originalPattern.price.formatted }],
            avgConfidence: originalPattern.score,
            count: 1,
          }
        : null,
      all: allPriceCandidates.slice(0, 5),
    },
    extractedPrices: [],
    statistics: {
      totalContainersAnalyzed: sampleContainers.length,
      totalPricesFound: allPriceCandidates.length,
      avgPricesPerContainer: allPriceCandidates.length / sampleContainers.length,
      containersWithDiscount: 0,
      discountPercentage: 0.33,
      avgDiscountPercent: 25,
      priceRange: {
        min: Math.min(...allPriceCandidates.map((c) => c.price.value)),
        max: Math.max(...allPriceCandidates.map((c) => c.price.value)),
        avg: allPriceCandidates.reduce((sum, c) => sum + c.price.value, 0) / allPriceCandidates.length,
      },
    },
  }
}
