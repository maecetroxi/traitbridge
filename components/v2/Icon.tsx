export default function Icon({
  name,
  size = 22,
}: {
  name: string;
  size?: number;
}) {
  const paths: Record<string, React.ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
        <path d="M9 21v-8h6v8" />
      </>
    ),
    messages: (
      <>
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a9.5 9.5 0 0 1 19 0Z" />
        <path d="M7 9h10M7 13h6" />
      </>
    ),
    discover: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.8 8.2-2.2 5.4-5.4 2.2 2.2-5.4Z" />
      </>
    ),
    me: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 22v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
    arrow: (
      <>
        <path d="M4 12h16m-6-6 6 6-6 6" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="m11 13 11-11" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 3C8 2 2 9 6 16s16 2 14-13Z" />
        <path d="M4 21 15 10" />
      </>
    ),
    heart: (
      <path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1s-1 7 8 15C21 12 23 8 20 5Z" />
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 8-3 8-3 10h18c0-2-3-2-3-10M10 22h4" />
      </>
    ),
    shuffle: (
      <>
        <path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-3 6-6m3-4 3-2h3m-4-4 4 4-4 4" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.leaf}
    </svg>
  );
}
