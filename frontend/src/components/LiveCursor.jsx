import React, { useEffect, useRef, useState } from 'react';

const LiveCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [particles, setParticles] = useState([]);

  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef(null);
  const lastParticleTime = useRef(0);

  useEffect(() => {
    // Only enable for fine pointer devices (desktops/laptops with a mouse/trackpad)
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check if hovering over interactive element
      const target = e.target;
      const isInteractive = target && (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.feeling-btn') ||
        target.closest('.btn-quick-protein') ||
        target.closest('.set-check-pill') ||
        target.closest('.btn-ctrl') ||
        target.closest('.goku-character-wrapper') ||
        target.closest('.week-day-cell') ||
        target.closest('.stat-pill') ||
        target.getAttribute('role') === 'button'
      );
      setIsHovering(Boolean(isInteractive));

      // Emit kinetic spark trail on mouse move (throttled to ~50ms)
      const now = performance.now();
      if (now - lastParticleTime.current > 45) {
        lastParticleTime.current = now;
        const newParticle = {
          id: Math.random(),
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 4 + 3,
          color: isInteractive ? '#34D399' : '#10B981'
        };
        setParticles((prev) => [...prev.slice(-12), newParticle]);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth physics loop for the trailing ring
    const render = () => {
      // Direct instant tracking for inner dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      // Smooth lag interpolation (lerp) for the outer glowing ring
      const ease = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isVisible]);

  // Clean up fading particles
  useEffect(() => {
    if (particles.length > 0) {
      const timeout = setTimeout(() => {
        setParticles((prev) => prev.slice(1));
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [particles]);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <div className={`live-cursor-layer ${isVisible ? 'visible' : ''}`} aria-hidden="true">
      {/* 1. Kinetic Energy Particles Trail */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="cursor-trail-particle"
          style={{
            transform: `translate3d(${p.x}px, ${p.y}px, 0)`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color
          }}
        />
      ))}

      {/* 2. Smooth Floating Outer Glowing Ring */}
      <div
        ref={ringRef}
        className={`cursor-ring ${isHovering ? 'hovering' : ''} ${isClicking ? 'clicking' : ''}`}
      >
        <span className="ring-pulse-aura"></span>
      </div>

      {/* 3. Razor-Sharp Inner Pointer Dot */}
      <div
        ref={dotRef}
        className={`cursor-dot ${isHovering ? 'hovering' : ''} ${isClicking ? 'clicking' : ''}`}
      />
    </div>
  );
};

export default LiveCursor;
