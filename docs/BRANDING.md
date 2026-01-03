# The 500 Companion - Brand Guidelines

## Logo & Icon

The icon features:
- **"500"** prominently displayed in a classic serif font (Georgia)
- **Green gradient background** (#10b981 → #059669) representing nature and the outdoors
- **Subtle landscape elements** suggesting trails and mountains
- **Compass star accent** symbolizing guidance and exploration

## Color Palette

### Primary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Primary 500 | `#10b981` | Main brand color, buttons, links |
| Primary 600 | `#059669` | Hover states, gradients |
| Primary 700 | `#047857` | Active states |
| Primary 50 | `#f0fdf4` | Light backgrounds |

### Secondary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Secondary 500 | `#f59e0b` | Accents, friends-only badges |
| Secondary 600 | `#d97706` | Hover states |

### Neutral Colors
- White (`#ffffff`) - Backgrounds, text on dark
- Gray 900 (`#111827`) - Primary text
- Gray 600 (`#4b5563`) - Secondary text
- Gray 100 (`#f3f4f6`) - Borders, dividers

## Typography

### Headings
- **Font**: Merriweather (serif)
- **Weights**: 400 (regular), 700 (bold)
- **Usage**: Page titles, section headers

### Body Text
- **Font**: Inter (sans-serif)
- **Weights**: 400, 500, 600
- **Usage**: Paragraphs, navigation, UI elements

## Icon Sizes for PWA

Generate PNG icons from the SVG at these sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192 (maskable)
- 384x384
- 512x512

### Generating Icons

Use one of these methods:

**Option 1: Online Tool**
1. Visit https://realfavicongenerator.net/
2. Upload `/public/icons/icon.svg`
3. Download and extract to `/public/icons/`

**Option 2: Command Line (with sharp-cli)**
```bash
npm install -g sharp-cli
sharp -i public/icons/icon.svg -o public/icons/icon-512x512.png resize 512 512
sharp -i public/icons/icon.svg -o public/icons/icon-192x192.png resize 192 192
# ... repeat for other sizes
```

**Option 3: Figma/Design Tool**
Export the SVG at each required size as PNG

## Brand Voice

- **Friendly & Welcoming**: Like inviting someone to your property
- **Helpful**: Clear guidance for visitors
- **Personal**: This is a family/friends space, not corporate
- **Practical**: Focus on useful information

## Usage Examples

### App Title
> The 500 Companion

### Tagline Options
> Your Guide to The 500
> Welcome to The 500
> Explore The 500

### Short Name (PWA)
> 500
