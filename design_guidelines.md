# Real Estate Marketplace Design Guidelines

## Design Approach
**Reference-Based Approach** inspired by modern real estate platforms like Zillow, Realtor.com, and Airbnb, emphasizing visual appeal and property showcase capabilities.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Deep Blue: 220 85% 25% (trust, professionalism)
- Clean White: 0 0% 100% (clarity, space)

**Accent Colors:**
- Success Green: 142 69% 58% (sold properties, positive actions)
- Warm Gray: 220 9% 46% (secondary text, borders)

**Background Colors:**
- Light Gray: 220 14% 96% (page backgrounds)
- Card White: 0 0% 100% (property cards, modals)

### Typography
**Primary Font:** Inter (Google Fonts)
- Headlines: 600 weight, larger sizes
- Body text: 400 weight
- Labels/UI: 500 weight

### Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, and 8
- Consistent padding: p-4, p-6, p-8
- Margins: m-2, m-4, m-6
- Gaps: gap-4, gap-6, gap-8

### Component Library

**Navigation:**
- Clean header with logo, search bar, and user controls
- Sticky navigation on scroll
- Mobile-responsive hamburger menu

**Property Cards:**
- Large property image with overlay price badge
- Compact info: price, beds/baths, sqft, address
- Subtle hover elevation effects
- Status badges (For Sale, Sold, Pending)

**Search & Filters:**
- Prominent search bar with location autocomplete
- Expandable filter panels
- Quick filter chips for common searches
- Map integration toggle

**Property Details:**
- Hero image gallery with thumbnails
- Two-column layout: details left, contact form right
- Tabbed sections for Description, Features, Neighborhood
- Agent contact card with photo

**User Interface:**
- Card-based layouts throughout
- Generous whitespace
- Consistent border radius (rounded-lg)
- Subtle shadows for depth

### Visual Treatments
**Gradients:**
- Subtle blue gradient overlays on hero images
- Property card hover states with gentle gradients

**Interactive Elements:**
- Property cards: scale(1.02) on hover
- Buttons: solid primary for CTAs, outline for secondary
- Form focus states with blue accent borders

## Images
**Hero Section:**
- Large banner image showcasing luxury property or city skyline
- Gradient overlay (220 85% 25% to transparent)
- Centered search functionality over hero image

**Property Images:**
- High-quality listing photos in 16:9 aspect ratio
- Gallery thumbnails in property details
- Agent profile photos (circular, professional)
- Neighborhood/location imagery for context

**Icon Usage:**
- Heroicons for UI elements (search, filters, user actions)
- Property feature icons (bed, bath, square footage)
- Map markers and location indicators

This design emphasizes trust, professionalism, and visual property showcase while maintaining excellent usability for property search and discovery.