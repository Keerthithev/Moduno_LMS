// This SVG is color-matched and styled precisely to your uploaded logo (image2).
// It can be used anywhere in your React app for a perfect, scalable Moduno logo.

const ModunoLogo = ({ size = 54, withText = true }) => (
  <svg
    width={size * (withText ? 4.2 : 1)}
    height={size}
    viewBox={withText ? "0 0 400 90" : "0 0 90 90"}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Moduno Logo"
    style={{ display: "block" }}
  >
    {/* Cube (M) */}
    <g>
      {/* Outer Hex Cube */}
      <polygon
        points="20,45 45,15 75,30 75,60 45,75 20,60"
        stroke="#2196F3"
        strokeWidth="4"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Bottom left fill */}
      <polygon
        points="24,48 45,60 45,71 24,59"
        fill="#2196F3"
        fillOpacity="1"
      />
      {/* Bottom right fill */}
      <polygon
        points="71,48 45,60 45,71 71,59"
        fill="#2196F3"
        fillOpacity="0.65"
      />
      {/* Mid "M" line */}
      <polyline
        points="26,50 45,60 65,50"
        stroke="#2196F3"
        strokeWidth="4"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Side "M" lines */}
      <polyline
        points="26,50 26,58 45,71 65,58 65,50"
        stroke="#2196F3"
        strokeWidth="4"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </g>
    {withText && (
      <g>
        {/* "Moduno" text - match font and spacing */}
        <text
          x="90"
          y="48"
          fontFamily="'Montserrat', Arial, sans-serif"
          fontWeight="700"
          fontSize="50"
          fill="#2196F3"
          letterSpacing="1"
        >
          Moduno
        </text>
        {/* Slogan */}
        <text
          x="90"
          y="78"
          fontFamily="'Montserrat', Arial, sans-serif"
          fontWeight="500"
          fontSize="22"
          fill="#2196F3"
          letterSpacing="0.5"
        >
          Build Your Dreams in Real
        </text>
      </g>
    )}
  </svg>
);

export default ModunoLogo;