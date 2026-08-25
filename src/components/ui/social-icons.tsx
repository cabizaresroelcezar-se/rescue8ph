import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

/** Facebook "f" wordmark in a circle — official brand blue */
export function FacebookIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M22 12.06C22 6.503 17.523 2 12 2S2 6.503 2 12.06c0 5.022 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.522 1.492-3.915 3.777-3.915 1.094 0 2.238.196 2.238.196v2.476h-1.26c-1.243 0-1.63.775-1.63 1.57v1.888h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.918 8.437-9.94z" />
    </svg>
  );
}

/** Instagram camera glyph in a rounded square — official brand gradient flattened to currentColor */
export function InstagramIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <path d="M16.5 11.25a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}