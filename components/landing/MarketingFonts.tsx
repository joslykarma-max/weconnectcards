import { preload } from 'react-dom';
import './marketing-fonts.css';

/** Loads the brand fonts on marketing pages and preloads the two used above the fold. */
export default function MarketingFonts() {
  preload('/fonts/syne-latin.woff2',    { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  preload('/fonts/dm-sans-latin.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  return null;
}
