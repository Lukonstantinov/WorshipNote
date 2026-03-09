interface Props {
  size?: number
}

export function WNLogo({ size = 32 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Musical note stem + flag */}
      <path
        d="M44 8 C44 8, 52 6, 52 14 C52 20, 44 20, 44 18 L44 42"
        stroke="var(--color-accent)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Note head (ellipse) */}
      <ellipse
        cx="38"
        cy="44"
        rx="10"
        ry="7"
        transform="rotate(-20 38 44)"
        fill="var(--color-accent)"
      />
      {/* W letter */}
      <text
        x="13"
        y="38"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="22"
        fill="var(--color-text-primary)"
      >
        W
      </text>
      {/* N letter overlapping note */}
      <text
        x="35"
        y="38"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="22"
        fill="var(--color-text-primary)"
      >
        N
      </text>
    </svg>
  )
}
