/**
 * Inline SVG payment method badges.
 * All icons are monochrome currentColor — they pick up text-muted-foreground
 * by default and respond to the surrounding Tailwind classes.
 */

export function VisaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 16"
      className={className}
      aria-hidden
      role="img"
      aria-label="Visa"
    >
      <path
        fill="currentColor"
        d="M18.6 1.4l-3.4 13.2h-3.3l3.4-13.2h3.3zM32.8 14.8l2.2-5.9-2.4-7.3h-3.1c-.5 0-.9.3-1.1.7l-5 12.5h3.5l.7-1.9h4.3l.4 1.9h3zm-3.6-4.7l1.8-4.7 1 4.7h-2.8zM14 14.8h-3.6l-2.5-9.6-2.6 9.6h-3.6l1.4-13.2h3.6c.5 0 .9.3 1 .7l1.7 6.7 2-7.4h3.4L14 14.8zm27.1-3.4c0 1.9-1.6 3.4-3.6 3.4-2 0-3.5-1.5-3.5-3.4 0-1.9 1.6-3.4 3.6-3.4 2 0 3.5 1.5 3.5 3.4zm-2.5 0c0-1.2-.7-1.9-1.4-1.9-.7 0-1.4.7-1.4 1.9 0 1.2.7 1.9 1.4 1.9.7 0 1.4-.7 1.4-1.9z"
      />
    </svg>
  );
}

export function MastercardIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 20"
      className={className}
      aria-hidden
      role="img"
      aria-label="Mastercard"
    >
      <circle cx="11" cy="10" r="7" fill="#EB001B" />
      <circle cx="21" cy="10" r="7" fill="#F79E1B" />
      <path
        fill="#FF5F00"
        d="M16 4.6a7 7 0 000 10.8 7 7 0 000-10.8z"
      />
    </svg>
  );
}

export function GcashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 16"
      className={className}
      aria-hidden
      role="img"
      aria-label="GCash"
    >
      <text
        x="0"
        y="13"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="14"
        fontWeight="800"
        fill="currentColor"
        letterSpacing="-0.02em"
      >
        GCash
      </text>
    </svg>
  );
}

export function MayaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 16"
      className={className}
      aria-hidden
      role="img"
      aria-label="Maya"
    >
      <text
        x="0"
        y="13"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="14"
        fontWeight="800"
        fill="currentColor"
        letterSpacing="-0.02em"
      >
        maya
      </text>
      <circle cx="44" cy="11" r="2" fill="currentColor" />
    </svg>
  );
}

export function CodIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 16"
      className={className}
      aria-hidden
      role="img"
      aria-label="Cash on Delivery"
    >
      <text
        x="0"
        y="13"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="13"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="0.04em"
      >
        COD
      </text>
    </svg>
  );
}

export function BankTransferIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 16"
      className={className}
      aria-hidden
      role="img"
      aria-label="Bank Transfer"
    >
      <text
        x="0"
        y="13"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="11"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="0.02em"
      >
        BANK
      </text>
    </svg>
  );
}