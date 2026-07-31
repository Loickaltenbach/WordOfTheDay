// Color/radius tokens copied from the Claude Design project's styles.css
// (design-system "classical"). Fonts (Cormorant Garamond / Lora) are skipped —
// bundling custom fonts means linking .ttf files into both native projects,
// disproportionate for this still-unshipped scaffolding screen. Using the
// system font instead; ask if pixel-accurate typography matters later.
export const colors = {
  bg: '#f3f2f2',
  surface: '#eae9e9',
  text: '#201f1d',
  accent: '#b68235',
  accent100: '#fff3e4',
  accent300: '#facb8d',
  accent700: '#7d5411',
  neutral100: '#f8f4f4',
  neutral200: '#eae7e7',
  neutral300: '#d7d3d3',
  neutral400: '#bab6b6',
  neutral500: '#9b9797',
  neutral600: '#7d7979',
  neutral700: '#605d5d',
  neutral900: '#2d2b2b',
  divider: 'rgba(32,31,29,0.16)',
} as const;

export const radii = {
  sm: 2,
  md: 4,
  lg: 7,
} as const;
