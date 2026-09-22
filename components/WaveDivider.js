// A layered wave transition between two sections. `into` is the color it
// hands off to (matches the next section's background); the div itself
// sits on the previous section's background so the wave shape reads as
// water breaking against the section below it.
export default function WaveDivider({ into, height = 64 }) {
  return (
    <div aria-hidden="true" style={{ lineHeight: 0 }}>
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
        <path d="M0,55 C180,90 360,20 600,40 C840,60 1020,10 1260,35 C1350,45 1410,55 1440,58 L1440,100 L0,100 Z" fill={into} opacity="0.55" />
        <path d="M0,70 C220,35 460,95 720,60 C960,28 1180,85 1440,50 L1440,100 L0,100 Z" fill={into} />
      </svg>
    </div>
  );
}
