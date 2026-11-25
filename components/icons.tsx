type P = { className?: string };

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const WhatsAppIcon = ({ className }: P) => (
  <svg {...base} fill="currentColor" stroke="none" className={className}>
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.25.7-1.45 1.33-2 1.4-.52.07-1.17.1-1.9-.12a17.3 17.3 0 0 1-1.72-.64c-3.03-1.31-5-4.37-5.15-4.57-.15-.2-1.23-1.64-1.23-3.13 0-1.5.78-2.22 1.06-2.52.28-.3.6-.38.8-.38l.58.01c.19 0 .43-.07.67.5.25.6.84 2.07.91 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.78 1.28 1.67 2.07 1.15 1.02 2.12 1.34 2.42 1.49.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.22.57.35.07.12.07.72-.18 1.42Z" />
  </svg>
);

export const InstagramIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
  </svg>
);

export const MapPinIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const ClockIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const CheckIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const SpineIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 3v18" />
    <rect x="8.5" y="4" width="7" height="3" rx="1.5" />
    <rect x="8" y="9" width="8" height="3" rx="1.5" />
    <rect x="8.5" y="14" width="7" height="3" rx="1.5" />
  </svg>
);

export const HandIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V11m0-5.5V4.5a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-.5A5.5 5.5 0 0 1 6 15.2L4.4 12.4a1.5 1.5 0 0 1 2.6-1.5L8 13" />
  </svg>
);

export const HeartPulseIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 0 1 7.5-6.6 5 5 0 0 1 7.5 6.6Z" />
    <path d="M3.5 12h4l2-3 3 6 2-3h6" />
  </svg>
);

export const ArrowRightIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);

export const CalendarIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M3.5 10h17M8 3v4m8-4v4" />
  </svg>
);

export const ChevronLeftIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);

export const ChevronRightIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const SparkIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 3.5 14 9l5.5 2-5.5 2-2 5.5-2-5.5L4.5 11 10 9l2-5.5Z" />
    <path d="M19 3v3M17.5 4.5h3" />
  </svg>
);
