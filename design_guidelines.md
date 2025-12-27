# Odigos Design Guidelines

## Design Approach
**System**: Material Design-inspired utility interface focused on clarity, trust, and decisiveness. This is a financial decision tool requiring professional credibility and scannable information hierarchy.

## Typography
- **Primary Font**: Inter (Google Fonts)
  - Headings: 600-700 weight
  - Body: 400-500 weight
  - Data/Numbers: 600 weight (tabular figures)
- **Scale**: 
  - H1 (Logo/Hero): text-4xl to text-5xl
  - H2 (Section Headers): text-2xl to text-3xl
  - Body: text-base to text-lg
  - Small/Meta: text-sm

## Layout System
**Spacing**: Consistent use of Tailwind units 4, 6, 8, 12, 16 for spacing (p-4, mb-8, gap-6, etc.)

**Container**: 
- Max-width: max-w-4xl (centered)
- Padding: px-6 on mobile, px-8 on desktop
- Single-column layout for clarity

## Component Design

### Header Section
- Logo + tagline in single row
- Subtle bottom border for separation
- Clean, professional lockup with breathing room (py-6)

### Input Form
- **Main Textarea**: Large, prominent (min-h-48), rounded corners (rounded-lg), clear border with focus states
- **Optional Section**: Accordion/collapsible with subtle expand indicator, grid layout on desktop (2 columns for compact inputs)
- **Inputs**: Consistent height (h-12), rounded borders, clear labels above fields
- **Submit Button**: Full-width on mobile, prominent size (px-8 py-4), high contrast, clear action text

### Results Display
**Three-Tier Visual Hierarchy**:

1. **Deal Score Hero** (Most Prominent):
   - Large centered badge/card with score color (Green/Yellow/Red semantic colors)
   - GO/NO-GO verdict in bold, oversized typography
   - Background surface with subtle shadow/elevation
   - Spacing: py-12 or larger

2. **Summary Section**:
   - Clear heading with icon
   - Readable paragraph width (max-w-prose)
   - Comfortable line-height (leading-relaxed)

3. **Structured Data Grid**:
   - Two-column responsive grid (grid-cols-1 md:grid-cols-2)
   - Clear label/value pairs with visual distinction
   - Bordered cards or subtle background surfaces
   - Monospace numbers for financial data

4. **Missing Info Alert** (when applicable):
   - Warning-style card with attention color
   - Bulleted list with clear spacing
   - Copy-to-clipboard button for suggested dealer questions

5. **Bottom Actions**:
   - Copy button with clear iconography
   - Secondary actions if needed (reset, new analysis)

## Visual Treatment
- **Cards/Surfaces**: Subtle shadows (shadow-sm to shadow-md), rounded corners (rounded-lg to rounded-xl)
- **Borders**: Consistent 1px borders with neutral tones, stronger borders for focus states
- **Elevation**: Use shadow strategically for Deal Score and key CTAs only
- **Whitespace**: Generous section spacing (space-y-8 to space-y-12) for scanning

## Interaction Patterns
- **States**: Clear hover, focus, and active states on all interactive elements
- **Loading**: Inline spinner during LLM analysis with status text
- **Collapsible Section**: Smooth height transition, rotate chevron icon
- **Copy Button**: Instant feedback (icon change or toast notification)

## Accessibility
- Clear focus indicators on all inputs
- Semantic HTML for screen readers
- Proper heading hierarchy (h1 > h2 > h3)
- ARIA labels for icon-only buttons
- High contrast ratios for all text

## Mobile Optimization
- Stack all grid layouts to single column
- Full-width buttons for easy tapping
- Adequate touch target sizes (min 44px)
- Sticky header with logo only on scroll (optional)

**Key Principle**: This is a utility tool, not a marketing page. Every design decision prioritizes clarity, trust, and actionability over visual flair. The Deal Score should be the unmistakable focal point of the results.