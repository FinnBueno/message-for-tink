import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./background.css";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Cube with glowing edges
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ccff,
      emissive: 0x003344,
      metalness: 0.8,
      roughness: 0.2,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Wireframe overlay for holographic look
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const wireframe = new THREE.Mesh(geometry, wireframeMat);
    cube.add(wireframe);

    // Edge glow
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7 });
    const lineSegments = new THREE.LineSegments(edges, lineMat);
    cube.add(lineSegments);

    // Lights
    const light = new THREE.DirectionalLight(0x00ccff, 2);
    light.position.set(2, 3, 4);
    scene.add(light);

    const light2 = new THREE.DirectionalLight(0x0066ff, 1);
    light2.position.set(-2, -1, 2);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0x004466, 0.6);
    scene.add(ambientLight);

    // Point light that orbits
    const pointLight = new THREE.PointLight(0x00ffcc, 1.5, 10);
    scene.add(pointLight);

    let animationId: number;
    let time = 0;

    function animate() {
      animationId = requestAnimationFrame(animate);
      time += 0.01;

      cube.rotation.x += 0.005;
      cube.rotation.y += 0.007;
      cube.rotation.z += 0.003;

      // Orbiting point light
      pointLight.position.x = Math.sin(time * 2) * 3;
      pointLight.position.y = Math.cos(time * 1.5) * 2;
      pointLight.position.z = Math.cos(time * 2) * 3;

      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "radial-gradient(ellipse at center, #0a1628 0%, #050d18 50%, #000508 100%)", position: "relative" }}>
      <div className="background-effects">
        {/* Radial center glow */}
        <div className="radial-glow" />

        {/* Grid floor */}
        <div className="grid-floor" />

        {/* Vertical beams */}
        <div className="beam beam--1" />
        <div className="beam beam--2" />
        <div className="beam beam--3" />
        <div className="beam beam--4" />

        {/* HUD rings around center */}
        <div className="hud-rings">
          <div className="hud-ring hud-ring--1" />
          <div className="hud-ring hud-ring--2" />
          <div className="hud-ring hud-ring--3" />
          <div className="hud-ring hud-ring--4" />
          <div className="hud-ring hud-ring--5" />
        </div>

        {/* Data arcs */}
        <div className="data-arc data-arc--1" />
        <div className="data-arc data-arc--2" />
        <div className="data-arc data-arc--3" />

        {/* Orbiting dots */}
        <div className="orbit-container">
          <div className="orbit-dot orbit-dot--1" />
          <div className="orbit-dot orbit-dot--2" />
          <div className="orbit-dot orbit-dot--3" />
          <div className="orbit-dot orbit-dot--4" />
          <div className="orbit-dot orbit-dot--5" />
        </div>

        {/* Pulse rings expanding from center */}
        <div className="pulse-ring" />
        <div className="pulse-ring pulse-ring--2" />
        <div className="pulse-ring pulse-ring--3" />

        {/* Scanning lines */}
        <div className="scan-line" />
        <div className="scan-line scan-line--2" />

        {/* Floating particles */}
        <div className="particles">
          <div className="particle particle--1" />
          <div className="particle particle--2" />
          <div className="particle particle--3" />
          <div className="particle particle--4" />
          <div className="particle particle--5" />
          <div className="particle particle--6" />
          <div className="particle particle--7" />
          <div className="particle particle--8" />
          <div className="particle particle--9" />
          <div className="particle particle--10" />
          <div className="particle particle--11" />
          <div className="particle particle--12" />
        </div>

        {/* Horizontal data tickers */}
        <div className="ticker ticker--1" />
        <div className="ticker ticker--2" />
        <div className="ticker ticker--3" />
        <div className="ticker ticker--4" />

        {/* Corner HUD brackets */}
        <div className="hud-corner hud-corner--tl" />
        <div className="hud-corner hud-corner--tr" />
        <div className="hud-corner hud-corner--bl" />
        <div className="hud-corner hud-corner--br" />

        {/* Podium disc */}
        <div className="podium-disc">
          <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="disc-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(80,180,255,0.6)" />
                <stop offset="20%" stopColor="rgba(0,140,255,0.3)" />
                <stop offset="50%" stopColor="rgba(0,80,200,0.08)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Center glow */}
            <circle cx="500" cy="500" r="120" fill="url(#disc-glow)" />

            {/* Ring 1 — inner solid thin */}
            <circle className="disc-ring disc-ring--1" cx="500" cy="500" r="55"
              fill="none" stroke="rgba(0,180,255,0.7)" strokeWidth="2" />

            {/* Ring 2 — inner glow */}
            <circle className="disc-ring disc-ring--2" cx="500" cy="500" r="80"
              fill="none" stroke="rgba(0,160,255,0.5)" strokeWidth="3"
              strokeDasharray="30 12 8 12" strokeLinecap="butt" />

            {/* Ring 3 — medium segmented */}
            <circle className="disc-ring disc-ring--3" cx="500" cy="500" r="115"
              fill="none" stroke="rgba(0,200,255,0.45)" strokeWidth="4"
              strokeDasharray="50 8 15 8 30 8" strokeLinecap="butt" />

            {/* Ring 4 — medium thick blocks */}
            <circle className="disc-ring disc-ring--4" cx="500" cy="500" r="150"
              fill="none" stroke="rgba(0,220,255,0.35)" strokeWidth="10"
              strokeDasharray="40 15 20 15 60 15 10 15" strokeLinecap="butt" />

            {/* Ring 5 — wide tech segments */}
            <circle className="disc-ring disc-ring--5" cx="500" cy="500" r="190"
              fill="none" stroke="rgba(0,200,255,0.3)" strokeWidth="16"
              strokeDasharray="80 12 25 12 40 12 15 12 55 12" strokeLinecap="butt" />

            {/* Ring 6 — thin accent */}
            <circle className="disc-ring disc-ring--6" cx="500" cy="500" r="210"
              fill="none" stroke="rgba(0,255,255,0.2)" strokeWidth="1"
              strokeDasharray="100 20 40 20" strokeLinecap="butt" />

            {/* Ring 7 — heavy outer blocks */}
            <circle className="disc-ring disc-ring--7" cx="500" cy="500" r="250"
              fill="none" stroke="rgba(0,180,255,0.25)" strokeWidth="22"
              strokeDasharray="35 18 70 18 20 18 50 18 15 18" strokeLinecap="butt" />

            {/* Ring 8 — circuit traces */}
            <circle className="disc-ring disc-ring--8" cx="500" cy="500" r="290"
              fill="none" stroke="rgba(0,200,255,0.2)" strokeWidth="8"
              strokeDasharray="12 10 45 10 12 10 80 10 25 10" strokeLinecap="butt" />

            {/* Ring 9 — outer detail */}
            <circle className="disc-ring disc-ring--9" cx="500" cy="500" r="320"
              fill="none" stroke="rgba(0,160,255,0.18)" strokeWidth="14"
              strokeDasharray="60 20 15 20 40 20 90 20 8 20" strokeLinecap="butt" />

            {/* Ring 10 — outermost wide segments */}
            <circle className="disc-ring disc-ring--10" cx="500" cy="500" r="370"
              fill="none" stroke="rgba(0,140,255,0.14)" strokeWidth="26"
              strokeDasharray="100 25 30 25 50 25 20 25 70 25" strokeLinecap="butt" />

            {/* Ring 11 — outermost thin line */}
            <circle className="disc-ring disc-ring--11" cx="500" cy="500" r="400"
              fill="none" stroke="rgba(0,180,255,0.1)" strokeWidth="2"
              strokeDasharray="150 30 60 30" strokeLinecap="butt" />

            {/* Ring 12 — ghost outer */}
            <circle className="disc-ring disc-ring--12" cx="500" cy="500" r="440"
              fill="none" stroke="rgba(0,150,255,0.08)" strokeWidth="18"
              strokeDasharray="40 30 80 30 20 30 60 30" strokeLinecap="butt" />
          </svg>
        </div>
      </div>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      {/* Foreground HUD panels */}
      <div className="hud-foreground">
        {/* === LEFT PANEL === */}
        <div className="hud-panel hud-panel--left">

          {/* Framed gauge panel */}
          <div className="hud-widget hud-frame">
            <svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg">
              {/* Frame border */}
              <rect x="1" y="1" width="178" height="98" fill="none" stroke="rgba(0,180,255,0.3)" strokeWidth="1" />
              <line x1="0" y1="0" x2="20" y2="0" stroke="rgba(0,255,255,0.6)" strokeWidth="2" />
              <line x1="0" y1="0" x2="0" y2="15" stroke="rgba(0,255,255,0.6)" strokeWidth="2" />
              {/* Semi-circle gauge */}
              <path d="M 35 75 A 40 40 0 0 1 115 75" fill="none" stroke="rgba(0,150,255,0.2)" strokeWidth="6" strokeLinecap="butt" />
              <path className="gauge-fill" d="M 35 75 A 40 40 0 0 1 115 75" fill="none" stroke="rgba(0,220,255,0.7)" strokeWidth="6" strokeLinecap="butt" strokeDasharray="126" strokeDashoffset="40" />
              {/* Gauge needle dot */}
              <circle className="gauge-dot" cx="90" cy="42" r="3" fill="rgba(0,255,255,0.9)" />
              {/* Status dots */}
              <circle cx="140" cy="25" r="4" fill="rgba(0,255,255,0.7)" className="status-blink" />
              <circle cx="152" cy="25" r="4" fill="rgba(0,180,255,0.4)" />
              <circle cx="164" cy="25" r="4" fill="rgba(0,180,255,0.4)" />
              {/* Label text */}
              <text x="140" y="45" fill="rgba(0,180,255,0.5)" fontSize="7" fontFamily="monospace">0.00267</text>
              <text x="42" y="90" fill="rgba(0,200,255,0.4)" fontSize="6" fontFamily="monospace">FREQ ANALYSIS</text>
            </svg>
          </div>

          {/* Horizontal connector line with dots */}
          <div className="hud-widget hud-connector">
            <svg viewBox="0 0 160 12" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="6" x2="120" y2="6" stroke="rgba(0,180,255,0.3)" strokeWidth="1" />
              <circle cx="5" cy="6" r="2.5" fill="rgba(0,255,255,0.6)" className="dot-ping" />
              <circle cx="30" cy="6" r="1.5" fill="rgba(0,200,255,0.4)" />
              <circle cx="55" cy="6" r="1.5" fill="rgba(0,200,255,0.4)" />
              <circle cx="80" cy="6" r="2" fill="rgba(0,220,255,0.5)" className="dot-ping-delay" />
              <rect x="90" y="3" width="25" height="6" fill="rgba(0,180,255,0.15)" stroke="rgba(0,180,255,0.3)" strokeWidth="0.5" />
              <circle cx="130" cy="6" r="3" fill="none" stroke="rgba(0,255,255,0.4)" strokeWidth="1" />
              <circle cx="130" cy="6" r="1" fill="rgba(0,255,255,0.6)" />
            </svg>
          </div>

          {/* Bar chart */}
          <div className="hud-widget hud-bars">
            <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
              <rect className="bar bar--1" x="5"  y="25" width="12" height="45" fill="rgba(0,200,255,0.5)" />
              <rect className="bar bar--2" x="22" y="15" width="12" height="55" fill="rgba(0,200,255,0.45)" />
              <rect className="bar bar--3" x="39" y="35" width="12" height="35" fill="rgba(0,200,255,0.4)" />
              <rect className="bar bar--4" x="56" y="10" width="12" height="60" fill="rgba(0,220,255,0.5)" />
              <rect className="bar bar--5" x="73" y="28" width="12" height="42" fill="rgba(0,200,255,0.45)" />
              <rect className="bar bar--6" x="90" y="18" width="12" height="52" fill="rgba(0,200,255,0.4)" />
              <rect className="bar bar--7" x="107" y="40" width="12" height="30" fill="rgba(0,180,255,0.35)" />
              {/* Baseline */}
              <line x1="0" y1="70" x2="140" y2="70" stroke="rgba(0,180,255,0.2)" strokeWidth="1" />
            </svg>
          </div>

          {/* Vertical level meters */}
          <div className="hud-widget hud-levels">
            <svg viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg">
              {/* Meter 1 */}
              <rect x="8" y="5" width="14" height="80" fill="rgba(0,100,180,0.15)" stroke="rgba(0,180,255,0.2)" strokeWidth="0.5" />
              <rect className="level level--1" x="9" y="30" width="12" height="54" fill="rgba(0,200,255,0.5)" />
              {/* Meter 2 */}
              <rect x="32" y="5" width="14" height="80" fill="rgba(0,100,180,0.15)" stroke="rgba(0,180,255,0.2)" strokeWidth="0.5" />
              <rect className="level level--2" x="33" y="20" width="12" height="64" fill="rgba(0,220,255,0.45)" />
              {/* Meter 3 */}
              <rect x="56" y="5" width="14" height="80" fill="rgba(0,100,180,0.15)" stroke="rgba(0,180,255,0.2)" strokeWidth="0.5" />
              <rect className="level level--3" x="57" y="45" width="12" height="39" fill="rgba(0,180,255,0.4)" />
            </svg>
          </div>

          {/* Binary text */}
          <div className="hud-widget hud-binary">
            <span className="binary-scroll">0.001011121154561210012100121100101</span>
          </div>
        </div>

        {/* === RIGHT PANEL === */}
        <div className="hud-panel hud-panel--right">

          {/* Waveform / equalizer */}
          <div className="hud-widget hud-waveform">
            <svg viewBox="0 0 160 60" xmlns="http://www.w3.org/2000/svg">
              <rect className="eq eq--1"  x="3"   y="25" width="5" height="20" fill="rgba(0,200,255,0.5)" />
              <rect className="eq eq--2"  x="12"  y="15" width="5" height="30" fill="rgba(0,200,255,0.45)" />
              <rect className="eq eq--3"  x="21"  y="20" width="5" height="25" fill="rgba(0,220,255,0.5)" />
              <rect className="eq eq--4"  x="30"  y="8"  width="5" height="40" fill="rgba(0,220,255,0.55)" />
              <rect className="eq eq--5"  x="39"  y="12" width="5" height="35" fill="rgba(0,200,255,0.5)" />
              <rect className="eq eq--6"  x="48"  y="5"  width="5" height="48" fill="rgba(0,240,255,0.55)" />
              <rect className="eq eq--7"  x="57"  y="10" width="5" height="38" fill="rgba(0,220,255,0.5)" />
              <rect className="eq eq--8"  x="66"  y="18" width="5" height="28" fill="rgba(0,200,255,0.45)" />
              <rect className="eq eq--9"  x="75"  y="22" width="5" height="22" fill="rgba(0,200,255,0.4)" />
              <rect className="eq eq--10" x="84"  y="14" width="5" height="32" fill="rgba(0,220,255,0.5)" />
              <rect className="eq eq--11" x="93"  y="8"  width="5" height="42" fill="rgba(0,240,255,0.55)" />
              <rect className="eq eq--12" x="102" y="18" width="5" height="28" fill="rgba(0,200,255,0.45)" />
              <rect className="eq eq--13" x="111" y="25" width="5" height="18" fill="rgba(0,180,255,0.4)" />
              <rect className="eq eq--14" x="120" y="20" width="5" height="24" fill="rgba(0,200,255,0.45)" />
              <rect className="eq eq--15" x="129" y="28" width="5" height="14" fill="rgba(0,180,255,0.35)" />
              <rect className="eq eq--16" x="138" y="22" width="5" height="22" fill="rgba(0,180,255,0.4)" />
              {/* Baseline */}
              <line x1="0" y1="55" x2="160" y2="55" stroke="rgba(0,180,255,0.15)" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Circular progress + dials */}
          <div className="hud-widget hud-dials">
            <svg viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg">
              {/* Main ring gauge */}
              <circle cx="40" cy="35" r="25" fill="none" stroke="rgba(0,150,255,0.15)" strokeWidth="4" />
              <circle className="ring-gauge" cx="40" cy="35" r="25" fill="none" stroke="rgba(0,220,255,0.6)" strokeWidth="4" strokeDasharray="157" strokeDashoffset="50" strokeLinecap="butt" />
              <text x="30" y="38" fill="rgba(0,220,255,0.7)" fontSize="10" fontFamily="monospace">68</text>
              <text x="28" y="48" fill="rgba(0,180,255,0.4)" fontSize="5" fontFamily="monospace">%LOAD</text>
              {/* Small dial 1 */}
              <circle cx="95" cy="20" r="10" fill="none" stroke="rgba(0,180,255,0.2)" strokeWidth="2" />
              <line className="dial-needle dial-needle--1" x1="95" y1="20" x2="95" y2="12" stroke="rgba(0,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="95" cy="20" r="2" fill="rgba(0,200,255,0.5)" />
              {/* Small dial 2 */}
              <circle cx="125" cy="20" r="10" fill="none" stroke="rgba(0,180,255,0.2)" strokeWidth="2" />
              <line className="dial-needle dial-needle--2" x1="125" y1="20" x2="125" y2="12" stroke="rgba(0,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="125" cy="20" r="2" fill="rgba(0,200,255,0.5)" />
              {/* Small dial 3 */}
              <circle cx="110" cy="50" r="10" fill="none" stroke="rgba(0,180,255,0.2)" strokeWidth="2" />
              <line className="dial-needle dial-needle--3" x1="110" y1="50" x2="110" y2="42" stroke="rgba(0,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="110" cy="50" r="2" fill="rgba(0,200,255,0.5)" />
            </svg>
          </div>

          {/* Vertical data columns */}
          <div className="hud-widget hud-datacols">
            <svg viewBox="0 0 140 80" xmlns="http://www.w3.org/2000/svg">
              {/* Dotted vertical columns */}
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <line x1={15 + i * 28} y1="5" x2={15 + i * 28} y2="75" stroke="rgba(0,180,255,0.15)" strokeWidth="1" strokeDasharray="2 3" />
                  <rect className={`datacol datacol--${i + 1}`} x={11 + i * 28} y={20 + i * 8} width="8" height={55 - i * 8} fill="rgba(0,200,255,0.3)" />
                </g>
              ))}
              {/* Horizontal tick marks */}
              <line x1="0" y1="25" x2="140" y2="25" stroke="rgba(0,150,255,0.08)" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="140" y2="50" stroke="rgba(0,150,255,0.08)" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Horizontal stepped bars */}
          <div className="hud-widget hud-steps">
            <svg viewBox="0 0 140 50" xmlns="http://www.w3.org/2000/svg">
              <rect className="step step--1" x="5"  y="5"  width="90"  height="6" fill="rgba(0,200,255,0.4)" />
              <rect className="step step--2" x="5"  y="16" width="65"  height="6" fill="rgba(0,200,255,0.35)" />
              <rect className="step step--3" x="5"  y="27" width="110" height="6" fill="rgba(0,220,255,0.45)" />
              <rect className="step step--4" x="5"  y="38" width="45"  height="6" fill="rgba(0,180,255,0.3)" />
              {/* End markers */}
              <rect x="100" y="4" width="3" height="8" fill="rgba(0,255,255,0.5)" className="marker-blink" />
              <rect x="75"  y="15" width="3" height="8" fill="rgba(0,255,255,0.4)" className="marker-blink-delay" />
            </svg>
          </div>

          {/* Data text */}
          <div className="hud-widget hud-binary hud-binary--right">
            <span className="binary-scroll binary-scroll--2">0.10101121545612100121001</span>
          </div>
        </div>
      </div>
    </div>
  );
}
