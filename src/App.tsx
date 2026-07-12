import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./background.css";
import { MESSAGE_TEXT } from "./messageContent";

// --- Artifact shape ---
const ARTIFACT_COLOR = 0xf4ea80;
const ARTIFACT_EMISSIVE = 0x8a7040;
const ARTIFACT_METALNESS = 0.2;
const ARTIFACT_ROUGHNESS = 0.55;
const ARTIFACT_THICKNESS = 0.27;
const ARTIFACT_ARM_LENGTH = 0.75;

// --- Lighting ---
const LIGHT_MAIN_COLOR = 0xfff0d0;
const LIGHT_MAIN_INTENSITY = 2;
const LIGHT_FILL_COLOR = 0xd4a040;
const LIGHT_FILL_INTENSITY = 1.2;
const LIGHT_AMBIENT_COLOR = 0xffffff;
const LIGHT_AMBIENT_INTENSITY = 1.2;
const LIGHT_POINT_COLOR = 0xffe0a0;
const LIGHT_POINT_INTENSITY = 1.5;

const LS_OPENED = "msg-opened";
const LS_SCROLL = "msg-scroll";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showText, setShowText] = useState(() => localStorage.getItem(LS_OPENED) === "1");
  const skipAnimation = useRef(localStorage.getItem(LS_OPENED) === "1");
  const onArtifactClick = useRef<() => void>(() => {});
  const onArtifactDismiss = useRef<() => void>(() => {});
  const textWallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onArtifactClick.current = () => {
      localStorage.setItem(LS_OPENED, "1");
      setShowText(true);
    };
    onArtifactDismiss.current = () => {
      localStorage.removeItem(LS_OPENED);
      localStorage.removeItem(LS_SCROLL);
      setShowText(false);
    };
  }, []);

  useEffect(() => {
    if (!showText || !textWallRef.current) return;
    const el = textWallRef.current;
    const saved = localStorage.getItem(LS_SCROLL);
    if (saved) el.scrollTop = parseInt(saved, 10);
    const onScroll = () => localStorage.setItem(LS_SCROLL, String(el.scrollTop));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [showText]);

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

    const isMobile = window.innerWidth <= 768;
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Generate rough stone-like texture as a color map
    const stoneCanvas = document.createElement("canvas");
    stoneCanvas.width = 256;
    stoneCanvas.height = 256;
    const ctx = stoneCanvas.getContext("2d")!;
    // Base color matching the artifact
    ctx.fillStyle = "#d4aa40";
    ctx.fillRect(0, 0, 256, 256);
    // Add heavy noise for stone grain — darker splotches
    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const darkening = Math.floor(Math.random() * 60);
      ctx.fillStyle = `rgba(40, 20, 0, ${(darkening + 20) / 255})`;
      ctx.fillRect(x, y, Math.random() * 4 + 1, Math.random() * 4 + 1);
    }
    // Add larger dark patches for visible stone texture
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const alpha = 0.15 + Math.random() * 0.25;
      ctx.fillStyle = `rgba(30, 15, 0, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 15 + 5, Math.random() * 10 + 4, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // Add lighter highlights
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.fillStyle = `rgba(255, 240, 180, ${0.08 + Math.random() * 0.12})`;
      ctx.fillRect(x, y, Math.random() * 2 + 1, Math.random() * 2 + 1);
    }

    const stoneTexture = new THREE.CanvasTexture(stoneCanvas);
    stoneTexture.wrapS = THREE.RepeatWrapping;
    stoneTexture.wrapT = THREE.RepeatWrapping;
    stoneTexture.repeat.set(2, 2);

    const material = new THREE.MeshStandardMaterial({
      color: ARTIFACT_COLOR,
      emissive: ARTIFACT_EMISSIVE,
      metalness: ARTIFACT_METALNESS,
      roughness: ARTIFACT_ROUGHNESS,
      map: stoneTexture,
      bumpMap: stoneTexture,
      bumpScale: 0.6,
    });

    const artifact = new THREE.Group();
    const t = ARTIFACT_THICKNESS;
    const L = ARTIFACT_ARM_LENGTH;

    // + sign: 2 horizontal bars crossing at center, each arm = L from center
    const barX = new THREE.Mesh(new THREE.BoxGeometry(L * 2, t, t), material);
    artifact.add(barX);
    const barZ = new THREE.Mesh(new THREE.BoxGeometry(t, t, L * 2), material);
    artifact.add(barZ);

    // 4 pillars at 90° angles from the ends of the +, each length = L
    // Positioned so they form a true 90° bend (pillar starts at the arm tip)
    const pillarGeom = new THREE.BoxGeometry(t, L, t);

    const pillarPosX = new THREE.Mesh(pillarGeom, material);
    pillarPosX.position.set(L - t / 2, L / 2, 0);
    artifact.add(pillarPosX);

    const pillarNegX = new THREE.Mesh(pillarGeom, material);
    pillarNegX.position.set(-L + t / 2, L / 2, 0);
    artifact.add(pillarNegX);

    const pillarPosZ = new THREE.Mesh(pillarGeom, material);
    pillarPosZ.position.set(0, L / 2, L - t / 2);
    artifact.add(pillarPosZ);

    const pillarNegZ = new THREE.Mesh(pillarGeom, material);
    pillarNegZ.position.set(0, L / 2, -L + t / 2);
    artifact.add(pillarNegZ);

    // 1 pillar pointing down from the center, same length L
    const pillarDown = new THREE.Mesh(pillarGeom, material);
    pillarDown.position.set(0, -L / 2, 0);
    artifact.add(pillarDown);

    scene.add(artifact);

    // Lights
    const light = new THREE.DirectionalLight(LIGHT_MAIN_COLOR, LIGHT_MAIN_INTENSITY);
    light.position.set(2, 3, 4);
    scene.add(light);

    const light2 = new THREE.DirectionalLight(LIGHT_FILL_COLOR, LIGHT_FILL_INTENSITY);
    light2.position.set(-2, -1, 2);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(LIGHT_AMBIENT_COLOR, LIGHT_AMBIENT_INTENSITY);
    scene.add(ambientLight);

    // Point light that orbits
    const pointLight = new THREE.PointLight(LIGHT_POINT_COLOR, LIGHT_POINT_INTENSITY, 10);
    scene.add(pointLight);

    let animationId: number;
    let time = 0;
    let spinning = true;
    let transitioning = false;
    let closing = false;
    let resting = false;

    // Target state when clicked: pillars pointing up, moved to bottom
    const targetPosition = new THREE.Vector3(0, -1.5, 0);
    const originPosition = new THREE.Vector3(0, 0, 0);
    const targetRotation = new THREE.Euler(0, 0, 0);
    const transitionDuration = 1.5; // seconds
    let transitionProgress = 0;
    const startPosition = new THREE.Vector3();
    const startRotation = new THREE.Euler();

    if (skipAnimation.current) {
      spinning = false;
      resting = true;
      artifact.position.copy(targetPosition);
      artifact.rotation.copy(targetRotation);
    }

    // Smooth easing function (ease-in-out cubic)
    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animate() {
      animationId = requestAnimationFrame(animate);
      time += 0.01;

      if (spinning) {
        artifact.rotation.x += 0.005;
        artifact.rotation.y += 0.007;
        artifact.rotation.z += 0.003;
      } else if (resting) {
        artifact.rotation.y += 0.003;
      } else if (transitioning) {
        transitionProgress += (1 / 60) / transitionDuration;
        const isClosing = closing; // capture before completion block clears it
        if (transitionProgress >= 1) {
          transitionProgress = 1;
          transitioning = false;
          if (closing) {
            closing = false;
            spinning = true;
          } else {
            resting = true;
          }
        }
        const t = easeInOutCubic(transitionProgress);
        const destPosition = isClosing ? originPosition : targetPosition;

        // Interpolate position
        artifact.position.lerpVectors(startPosition, destPosition, t);
        // Interpolate rotation
        artifact.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * t;
        artifact.rotation.y = startRotation.y + (targetRotation.y - startRotation.y) * t;
        artifact.rotation.z = startRotation.z + (targetRotation.z - startRotation.z) * t;
      }

      // Orbiting point light
      pointLight.position.x = Math.sin(time * 2) * 3;
      pointLight.position.y = Math.cos(time * 1.5) * 2;
      pointLight.position.z = Math.cos(time * 2) * 3;

      renderer.render(scene, camera);
    }
    animate();

    // Click detection with raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function activateArtifact(clientX: number, clientY: number) {
      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(artifact.children);
      if (intersects.length > 0) {
        if (spinning) {
          spinning = false;
          transitioning = true;
          closing = false;
          transitionProgress = 0;
          startPosition.copy(artifact.position);
          startRotation.copy(artifact.rotation);
          onArtifactClick.current();
        } else if (resting) {
          resting = false;
          transitioning = true;
          closing = true;
          transitionProgress = 0;
          startPosition.copy(artifact.position);
          startRotation.copy(artifact.rotation);
          onArtifactDismiss.current();
        }
      }
    }

    function handleClick(event: MouseEvent) {
      activateArtifact(event.clientX, event.clientY);
    }

    function handleTouchEnd(event: TouchEvent) {
      event.preventDefault();
      const touch = event.changedTouches[0];
      activateArtifact(touch.clientX, touch.clientY);
    }
    renderer.domElement.addEventListener("click", handleClick);
    renderer.domElement.addEventListener("touchend", handleTouchEnd, { passive: false });

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handleClick);
      renderer.domElement.removeEventListener("touchend", handleTouchEnd);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "radial-gradient(ellipse at center, #180a2e 0%, #0d0518 50%, #060008 100%)", position: "relative" }}>
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
                <stop offset="0%" stopColor="rgba(160,85,210,0.6)" />
                <stop offset="20%" stopColor="rgba(135,72,192,0.3)" />
                <stop offset="50%" stopColor="rgba(88,44,150,0.08)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Center glow */}
            <circle cx="500" cy="500" r="120" fill="url(#disc-glow)" />

            {/* Ring 1 — inner solid thin */}
            <circle className="disc-ring disc-ring--1" cx="500" cy="500" r="55"
              fill="none" stroke="rgba(155,82,208,0.7)" strokeWidth="2" />

            {/* Ring 2 — inner glow */}
            <circle className="disc-ring disc-ring--2" cx="500" cy="500" r="80"
              fill="none" stroke="rgba(145,78,200,0.5)" strokeWidth="3"
              strokeDasharray="30 12 8 12" strokeLinecap="butt" />

            {/* Ring 3 — medium segmented */}
            <circle className="disc-ring disc-ring--3" cx="500" cy="500" r="115"
              fill="none" stroke="rgba(170,95,220,0.45)" strokeWidth="4"
              strokeDasharray="50 8 15 8 30 8" strokeLinecap="butt" />

            {/* Ring 4 — medium thick blocks */}
            <circle className="disc-ring disc-ring--4" cx="500" cy="500" r="150"
              fill="none" stroke="rgba(205,155,48,0.35)" strokeWidth="10"
              strokeDasharray="40 15 20 15 60 15 10 15" strokeLinecap="butt" />

            {/* Ring 5 — wide tech segments */}
            <circle className="disc-ring disc-ring--5" cx="500" cy="500" r="190"
              fill="none" stroke="rgba(170,95,220,0.3)" strokeWidth="16"
              strokeDasharray="80 12 25 12 40 12 15 12 55 12" strokeLinecap="butt" />

            {/* Ring 6 — thin accent */}
            <circle className="disc-ring disc-ring--6" cx="500" cy="500" r="210"
              fill="none" stroke="rgba(220,175,55,0.2)" strokeWidth="1"
              strokeDasharray="100 20 40 20" strokeLinecap="butt" />

            {/* Ring 7 — heavy outer blocks */}
            <circle className="disc-ring disc-ring--7" cx="500" cy="500" r="250"
              fill="none" stroke="rgba(155,82,208,0.25)" strokeWidth="22"
              strokeDasharray="35 18 70 18 20 18 50 18 15 18" strokeLinecap="butt" />

            {/* Ring 8 — circuit traces */}
            <circle className="disc-ring disc-ring--8" cx="500" cy="500" r="290"
              fill="none" stroke="rgba(170,95,220,0.2)" strokeWidth="8"
              strokeDasharray="12 10 45 10 12 10 80 10 25 10" strokeLinecap="butt" />

            {/* Ring 9 — outer detail */}
            <circle className="disc-ring disc-ring--9" cx="500" cy="500" r="320"
              fill="none" stroke="rgba(145,78,200,0.18)" strokeWidth="14"
              strokeDasharray="60 20 15 20 40 20 90 20 8 20" strokeLinecap="butt" />

            {/* Ring 10 — outermost wide segments */}
            <circle className="disc-ring disc-ring--10" cx="500" cy="500" r="370"
              fill="none" stroke="rgba(135,72,192,0.14)" strokeWidth="26"
              strokeDasharray="100 25 30 25 50 25 20 25 70 25" strokeLinecap="butt" />

            {/* Ring 11 — outermost thin line */}
            <circle className="disc-ring disc-ring--11" cx="500" cy="500" r="400"
              fill="none" stroke="rgba(155,82,208,0.1)" strokeWidth="2"
              strokeDasharray="150 30 60 30" strokeLinecap="butt" />

            {/* Ring 12 — ghost outer */}
            <circle className="disc-ring disc-ring--12" cx="500" cy="500" r="440"
              fill="none" stroke="rgba(140,75,196,0.08)" strokeWidth="18"
              strokeDasharray="40 30 80 30 20 30 60 30" strokeLinecap="butt" />
          </svg>
        </div>
      </div>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      {!showText && (
        <div className="artifact-cue">
          <div className="artifact-cue__glow" />
          <span className="artifact-cue__label">tap to activate</span>
        </div>
      )}

      {/* Foreground HUD panels */}
      <div className="hud-foreground">
        {/* === LEFT PANEL === */}
        <div className="hud-panel hud-panel--left">

          {/* Framed gauge panel */}
          <div className="hud-widget hud-frame">
            <svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg">
              {/* Frame border */}
              <rect x="1" y="1" width="178" height="98" fill="none" stroke="rgba(155,82,208,0.3)" strokeWidth="1" />
              <line x1="0" y1="0" x2="20" y2="0" stroke="rgba(220,175,55,0.6)" strokeWidth="2" />
              <line x1="0" y1="0" x2="0" y2="15" stroke="rgba(220,175,55,0.6)" strokeWidth="2" />
              {/* Semi-circle gauge */}
              <path d="M 35 75 A 40 40 0 0 1 115 75" fill="none" stroke="rgba(140,75,196,0.2)" strokeWidth="6" strokeLinecap="butt" />
              <path className="gauge-fill" d="M 35 75 A 40 40 0 0 1 115 75" fill="none" stroke="rgba(205,155,48,0.7)" strokeWidth="6" strokeLinecap="butt" strokeDasharray="126" strokeDashoffset="40" />
              {/* Gauge needle dot */}
              <circle className="gauge-dot" cx="90" cy="42" r="3" fill="rgba(220,175,55,0.9)" />
              {/* Status dots */}
              <circle cx="140" cy="25" r="4" fill="rgba(220,175,55,0.7)" className="status-blink" />
              <circle cx="152" cy="25" r="4" fill="rgba(155,82,208,0.4)" />
              <circle cx="164" cy="25" r="4" fill="rgba(155,82,208,0.4)" />
              {/* Label text */}
              <text x="140" y="45" fill="rgba(155,82,208,0.5)" fontSize="7" fontFamily="monospace">0.00267</text>
              <text x="42" y="90" fill="rgba(170,95,220,0.4)" fontSize="6" fontFamily="monospace">FREQ ANALYSIS</text>
            </svg>
          </div>

          {/* Horizontal connector line with dots */}
          <div className="hud-widget hud-connector">
            <svg viewBox="0 0 160 12" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="6" x2="120" y2="6" stroke="rgba(155,82,208,0.3)" strokeWidth="1" />
              <circle cx="5" cy="6" r="2.5" fill="rgba(220,175,55,0.6)" className="dot-ping" />
              <circle cx="30" cy="6" r="1.5" fill="rgba(170,95,220,0.4)" />
              <circle cx="55" cy="6" r="1.5" fill="rgba(170,95,220,0.4)" />
              <circle cx="80" cy="6" r="2" fill="rgba(205,155,48,0.5)" className="dot-ping-delay" />
              <rect x="90" y="3" width="25" height="6" fill="rgba(155,82,208,0.15)" stroke="rgba(155,82,208,0.3)" strokeWidth="0.5" />
              <circle cx="130" cy="6" r="3" fill="none" stroke="rgba(220,175,55,0.4)" strokeWidth="1" />
              <circle cx="130" cy="6" r="1" fill="rgba(220,175,55,0.6)" />
            </svg>
          </div>

          {/* Bar chart */}
          <div className="hud-widget hud-bars">
            <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
              <rect className="bar bar--1" x="5"  y="25" width="12" height="45" fill="rgba(170,95,220,0.5)" />
              <rect className="bar bar--2" x="22" y="15" width="12" height="55" fill="rgba(170,95,220,0.45)" />
              <rect className="bar bar--3" x="39" y="35" width="12" height="35" fill="rgba(170,95,220,0.4)" />
              <rect className="bar bar--4" x="56" y="10" width="12" height="60" fill="rgba(205,155,48,0.5)" />
              <rect className="bar bar--5" x="73" y="28" width="12" height="42" fill="rgba(170,95,220,0.45)" />
              <rect className="bar bar--6" x="90" y="18" width="12" height="52" fill="rgba(170,95,220,0.4)" />
              <rect className="bar bar--7" x="107" y="40" width="12" height="30" fill="rgba(155,82,208,0.35)" />
              {/* Baseline */}
              <line x1="0" y1="70" x2="140" y2="70" stroke="rgba(155,82,208,0.2)" strokeWidth="1" />
            </svg>
          </div>

          {/* Vertical level meters */}
          <div className="hud-widget hud-levels">
            <svg viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg">
              {/* Meter 1 */}
              <rect x="8" y="5" width="14" height="80" fill="rgba(95,48,158,0.15)" stroke="rgba(155,82,208,0.2)" strokeWidth="0.5" />
              <rect className="level level--1" x="9" y="30" width="12" height="54" fill="rgba(170,95,220,0.5)" />
              {/* Meter 2 */}
              <rect x="32" y="5" width="14" height="80" fill="rgba(95,48,158,0.15)" stroke="rgba(155,82,208,0.2)" strokeWidth="0.5" />
              <rect className="level level--2" x="33" y="20" width="12" height="64" fill="rgba(205,155,48,0.45)" />
              {/* Meter 3 */}
              <rect x="56" y="5" width="14" height="80" fill="rgba(95,48,158,0.15)" stroke="rgba(155,82,208,0.2)" strokeWidth="0.5" />
              <rect className="level level--3" x="57" y="45" width="12" height="39" fill="rgba(155,82,208,0.4)" />
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
              <rect className="eq eq--1"  x="3"   y="25" width="5" height="20" fill="rgba(170,95,220,0.5)" />
              <rect className="eq eq--2"  x="12"  y="15" width="5" height="30" fill="rgba(170,95,220,0.45)" />
              <rect className="eq eq--3"  x="21"  y="20" width="5" height="25" fill="rgba(205,155,48,0.5)" />
              <rect className="eq eq--4"  x="30"  y="8"  width="5" height="40" fill="rgba(205,155,48,0.55)" />
              <rect className="eq eq--5"  x="39"  y="12" width="5" height="35" fill="rgba(170,95,220,0.5)" />
              <rect className="eq eq--6"  x="48"  y="5"  width="5" height="48" fill="rgba(0,240,255,0.55)" />
              <rect className="eq eq--7"  x="57"  y="10" width="5" height="38" fill="rgba(205,155,48,0.5)" />
              <rect className="eq eq--8"  x="66"  y="18" width="5" height="28" fill="rgba(170,95,220,0.45)" />
              <rect className="eq eq--9"  x="75"  y="22" width="5" height="22" fill="rgba(170,95,220,0.4)" />
              <rect className="eq eq--10" x="84"  y="14" width="5" height="32" fill="rgba(205,155,48,0.5)" />
              <rect className="eq eq--11" x="93"  y="8"  width="5" height="42" fill="rgba(0,240,255,0.55)" />
              <rect className="eq eq--12" x="102" y="18" width="5" height="28" fill="rgba(170,95,220,0.45)" />
              <rect className="eq eq--13" x="111" y="25" width="5" height="18" fill="rgba(155,82,208,0.4)" />
              <rect className="eq eq--14" x="120" y="20" width="5" height="24" fill="rgba(170,95,220,0.45)" />
              <rect className="eq eq--15" x="129" y="28" width="5" height="14" fill="rgba(155,82,208,0.35)" />
              <rect className="eq eq--16" x="138" y="22" width="5" height="22" fill="rgba(155,82,208,0.4)" />
              {/* Baseline */}
              <line x1="0" y1="55" x2="160" y2="55" stroke="rgba(155,82,208,0.15)" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Circular progress + dials */}
          <div className="hud-widget hud-dials">
            <svg viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg">
              {/* Main ring gauge */}
              <circle cx="40" cy="35" r="25" fill="none" stroke="rgba(140,75,196,0.15)" strokeWidth="4" />
              <circle className="ring-gauge" cx="40" cy="35" r="25" fill="none" stroke="rgba(205,155,48,0.6)" strokeWidth="4" strokeDasharray="157" strokeDashoffset="50" strokeLinecap="butt" />
              <text x="30" y="38" fill="rgba(205,155,48,0.7)" fontSize="10" fontFamily="monospace">68</text>
              <text x="28" y="48" fill="rgba(155,82,208,0.4)" fontSize="5" fontFamily="monospace">%LOAD</text>
              {/* Small dial 1 */}
              <circle cx="95" cy="20" r="10" fill="none" stroke="rgba(155,82,208,0.2)" strokeWidth="2" />
              <line className="dial-needle dial-needle--1" x1="95" y1="20" x2="95" y2="12" stroke="rgba(220,175,55,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="95" cy="20" r="2" fill="rgba(170,95,220,0.5)" />
              {/* Small dial 2 */}
              <circle cx="125" cy="20" r="10" fill="none" stroke="rgba(155,82,208,0.2)" strokeWidth="2" />
              <line className="dial-needle dial-needle--2" x1="125" y1="20" x2="125" y2="12" stroke="rgba(220,175,55,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="125" cy="20" r="2" fill="rgba(170,95,220,0.5)" />
              {/* Small dial 3 */}
              <circle cx="110" cy="50" r="10" fill="none" stroke="rgba(155,82,208,0.2)" strokeWidth="2" />
              <line className="dial-needle dial-needle--3" x1="110" y1="50" x2="110" y2="42" stroke="rgba(220,175,55,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="110" cy="50" r="2" fill="rgba(170,95,220,0.5)" />
            </svg>
          </div>

          {/* Vertical data columns */}
          <div className="hud-widget hud-datacols">
            <svg viewBox="0 0 140 80" xmlns="http://www.w3.org/2000/svg">
              {/* Dotted vertical columns */}
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <line x1={15 + i * 28} y1="5" x2={15 + i * 28} y2="75" stroke="rgba(155,82,208,0.15)" strokeWidth="1" strokeDasharray="2 3" />
                  <rect className={`datacol datacol--${i + 1}`} x={11 + i * 28} y={20 + i * 8} width="8" height={55 - i * 8} fill="rgba(170,95,220,0.3)" />
                </g>
              ))}
              {/* Horizontal tick marks */}
              <line x1="0" y1="25" x2="140" y2="25" stroke="rgba(140,75,196,0.08)" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="140" y2="50" stroke="rgba(140,75,196,0.08)" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Horizontal stepped bars */}
          <div className="hud-widget hud-steps">
            <svg viewBox="0 0 140 50" xmlns="http://www.w3.org/2000/svg">
              <rect className="step step--1" x="5"  y="5"  width="90"  height="6" fill="rgba(170,95,220,0.4)" />
              <rect className="step step--2" x="5"  y="16" width="65"  height="6" fill="rgba(170,95,220,0.35)" />
              <rect className="step step--3" x="5"  y="27" width="110" height="6" fill="rgba(205,155,48,0.45)" />
              <rect className="step step--4" x="5"  y="38" width="45"  height="6" fill="rgba(155,82,208,0.3)" />
              {/* End markers */}
              <rect x="100" y="4" width="3" height="8" fill="rgba(220,175,55,0.5)" className="marker-blink" />
              <rect x="75"  y="15" width="3" height="8" fill="rgba(220,175,55,0.4)" className="marker-blink-delay" />
            </svg>
          </div>

          {/* Data text */}
          <div className="hud-widget hud-binary hud-binary--right">
            <span className="binary-scroll binary-scroll--2">0.10101121545612100121001</span>
          </div>
        </div>
      </div>

      {/* Text wall */}
      {showText && (
        <div className="text-wall" ref={textWallRef}>
          <div className="text-wall__content">
            {/* Message header */}
            <div
              className="msg-paragraph msg-header"
              style={skipAnimation.current ? undefined : { animationDelay: "1500ms" }}
            >
              <div className="msg-header__rule">
                <span className="msg-header__symbol">✦</span>
              </div>
              <div className="msg-header__label">Recorded Message</div>
              <div className="msg-header__sender">From: Olimar Sparkwhistle</div>
              <div className="msg-header__divider" />
            </div>

            {MESSAGE_TEXT.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className="msg-paragraph"
                style={
                  skipAnimation.current
                    ? undefined
                    : {
                        animationDelay: `${1800 + i * 300}ms`,
                      }
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
      <button
        className="reset-btn"
        onClick={() => { localStorage.removeItem(LS_OPENED); localStorage.removeItem(LS_SCROLL); location.reload(); }}
        title="Reset message"
      >
        ↺
      </button>
    </div>
  );
}
