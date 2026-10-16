import { useEffect, useRef } from 'react';
import { WeatherEffectType } from '../types/profile';

interface BackgroundCanvasProps {
  effect: WeatherEffectType;
  intensity: number; // 1 to 10
}

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  thickness: number;
}

interface Splash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

interface LightningBranch {
  points: { x: number; y: number }[];
  thickness: number;
  alpha: number;
}

interface LightningStrike {
  branches: LightningBranch[];
  framesLeft: number;
  maxFrames: number;
  flashAlpha: number;
}

export function BackgroundCanvas({ effect, intensity }: BackgroundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || effect === 'none') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const countMultiplier = Math.max(0.5, intensity / 5);

    // --- RAIN & LIGHTNING STATE ---
    const rainDrops: RainDrop[] = [];
    const splashes: Splash[] = [];
    let activeStrike: LightningStrike | null = null;
    let lightningTimer = 0;
    let nextLightningInterval = Math.floor(160 + Math.random() * 220); // every ~3-6 seconds

    const rainCount = Math.floor(180 * countMultiplier);
    for (let i = 0; i < rainCount; i++) {
      rainDrops.push({
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * height,
        length: 18 + Math.random() * 28,
        speed: 16 + Math.random() * 12,
        opacity: 0.25 + Math.random() * 0.45,
        thickness: 1 + Math.random() * 0.8,
      });
    }

    // Function to generate a realistic branching lightning bolt
    const generateLightning = (startX?: number): LightningStrike => {
      const branches: LightningBranch[] = [];
      const rootX = startX ?? (width * 0.15 + Math.random() * (width * 0.7));
      const rootY = 0;

      // Main trunk
      const mainPoints: { x: number; y: number }[] = [{ x: rootX, y: rootY }];
      let currentX = rootX;
      let currentY = rootY;
      const segments = Math.floor(18 + Math.random() * 12);
      const targetY = height * (0.65 + Math.random() * 0.35);
      const segmentHeight = targetY / segments;

      for (let i = 1; i <= segments; i++) {
        const sway = (Math.random() - 0.5) * 55;
        currentX += sway;
        currentY += segmentHeight * (0.8 + Math.random() * 0.4);
        mainPoints.push({ x: currentX, y: currentY });

        // Branching off the main trunk
        if (Math.random() < 0.38 && i < segments - 2) {
          const branchPoints: { x: number; y: number }[] = [{ x: currentX, y: currentY }];
          let bx = currentX;
          let by = currentY;
          const branchLength = Math.floor(4 + Math.random() * 6);
          const dir = sway > 0 ? 1 : -1;

          for (let b = 0; b < branchLength; b++) {
            bx += dir * (15 + Math.random() * 35) + (Math.random() - 0.5) * 20;
            by += (segmentHeight * 0.75) + Math.random() * 15;
            branchPoints.push({ x: bx, y: by });
          }

          branches.push({
            points: branchPoints,
            thickness: 1.2,
            alpha: 0.75,
          });
        }
      }

      branches.unshift({
        points: mainPoints,
        thickness: 2.5,
        alpha: 1,
      });

      return {
        branches,
        framesLeft: 8,
        maxFrames: 8,
        flashAlpha: 0.32,
      };
    };

    // Allow user to trigger lightning by clicking the window
    const handleGlobalClick = (e: MouseEvent) => {
      if (effect === 'rain') {
        activeStrike = generateLightning(e.clientX);
      }
    };
    window.addEventListener('click', handleGlobalClick);

    // --- SAKURA SETUP ---
    interface SakuraPetal {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      rotation: number;
      rotSpeed: number;
      flip: number;
      flipSpeed: number;
      opacity: number;
    }
    const sakuraPetals: SakuraPetal[] = [];
    const sakuraCount = Math.floor(45 * countMultiplier);
    for (let i = 0; i < sakuraCount; i++) {
      sakuraPetals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 9 + Math.random() * 8,
        speedX: -1 + Math.random() * 2,
        speedY: 1.2 + Math.random() * 2,
        rotation: Math.random() * 360,
        rotSpeed: -1 + Math.random() * 2,
        flip: Math.random(),
        flipSpeed: 0.02 + Math.random() * 0.03,
        opacity: 0.5 + Math.random() * 0.4,
      });
    }

    // --- SNOW SETUP ---
    interface Snowflake {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      wind: number;
      opacity: number;
    }
    const snowflakes: Snowflake[] = [];
    const snowCount = Math.floor(90 * countMultiplier);
    for (let i = 0; i < snowCount; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.5 + Math.random() * 3.5,
        speedY: 0.8 + Math.random() * 1.8,
        wind: -0.5 + Math.random() * 1,
        opacity: 0.3 + Math.random() * 0.6,
      });
    }

    // --- MATRIX SETUP ---
    const characters = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ1234567890ABCDEF@#$%&*';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const matrixDrops: number[] = [];
    for (let i = 0; i < columns; i++) {
      matrixDrops[i] = Math.random() * -100;
    }

    // --- STARS SETUP ---
    interface Star {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      alphaChange: number;
    }
    const stars: Star[] = [];
    const starCount = Math.floor(150 * countMultiplier);
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.5 + Math.random() * 2,
        alpha: Math.random(),
        alphaChange: (Math.random() * 0.02 - 0.01) * 0.8,
      });
    }
    let shootingStar: { x: number; y: number; length: number; speed: number; opacity: number } | null = null;

    const render = () => {
      // 1. CLEAR CANVAS
      if (effect === 'matrix') {
        ctx.fillStyle = 'rgba(7, 10, 15, 0.15)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      // 2. RAIN & LIGHTNING EFFECT (MƯA CÓ SÉT)
      if (effect === 'rain') {
        // --- Lightning Strike Processing ---
        lightningTimer++;
        if (lightningTimer >= nextLightningInterval) {
          activeStrike = generateLightning();
          lightningTimer = 0;
          nextLightningInterval = Math.floor(180 + Math.random() * 260); // 3 to 7 seconds
        }

        // Draw sky illumination flash from thunder
        if (activeStrike) {
          const ratio = activeStrike.framesLeft / activeStrike.maxFrames;
          // Flickering pulse effect characteristic of thunderbolts
          const flicker = activeStrike.framesLeft % 2 === 0 ? 1 : 0.65;
          const flashAlpha = activeStrike.flashAlpha * ratio * flicker;

          // Sky ambient flash
          ctx.fillStyle = `rgba(224, 242, 254, ${flashAlpha})`;
          ctx.fillRect(0, 0, width, height);

          // Draw the electric bolts
          for (const branch of activeStrike.branches) {
            if (branch.points.length < 2) continue;

            // Outer electric cyan glow
            ctx.save();
            ctx.strokeStyle = `rgba(56, 189, 248, ${branch.alpha * ratio * 0.7})`;
            ctx.lineWidth = branch.thickness * 3.5;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 25;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'miter';
            ctx.beginPath();
            ctx.moveTo(branch.points[0].x, branch.points[0].y);
            for (let p = 1; p < branch.points.length; p++) {
              ctx.lineTo(branch.points[p].x, branch.points[p].y);
            }
            ctx.stroke();

            // Inner hot white lightning core
            ctx.strokeStyle = `rgba(255, 255, 255, ${branch.alpha * ratio})`;
            ctx.lineWidth = branch.thickness;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(branch.points[0].x, branch.points[0].y);
            for (let p = 1; p < branch.points.length; p++) {
              ctx.lineTo(branch.points[p].x, branch.points[p].y);
            }
            ctx.stroke();
            ctx.restore();
          }

          activeStrike.framesLeft--;
          if (activeStrike.framesLeft <= 0) {
            activeStrike = null;
          }
        }

        // --- Render Rain Drops ---
        ctx.save();
        ctx.lineCap = 'round';
        for (let i = 0; i < rainDrops.length; i++) {
          const drop = rainDrops[i];
          const endX = drop.x - 2.8;
          const endY = drop.y + drop.length;

          ctx.strokeStyle = `rgba(215, 235, 255, ${drop.opacity})`;
          ctx.lineWidth = drop.thickness;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= 2.2;

          if (drop.y > height) {
            // Chance to create ground splash ripples
            if (Math.random() < 0.28) {
              splashes.push({
                x: drop.x,
                y: height - Math.random() * 12,
                radius: 1,
                maxRadius: 5 + Math.random() * 5,
                opacity: 0.35,
              });
            }
            drop.y = -drop.length - Math.random() * 50;
            drop.x = Math.random() * (width + 250);
          }
        }
        ctx.restore();

        // --- Render Rain Ground Splashes ---
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          ctx.strokeStyle = `rgba(186, 230, 253, ${s.opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.radius * 2.2, s.radius * 0.7, 0, 0, Math.PI * 2);
          ctx.stroke();

          s.radius += 0.5;
          s.opacity -= 0.035;
          if (s.opacity <= 0 || s.radius >= s.maxRadius) {
            splashes.splice(i, 1);
          }
        }
      }

      // 3. SAKURA EFFECT
      if (effect === 'sakura') {
        for (let i = 0; i < sakuraPetals.length; i++) {
          const p = sakuraPetals[i];
          p.x += p.speedX + Math.sin(p.y * 0.01) * 0.8;
          p.y += p.speedY;
          p.rotation += p.rotSpeed;
          p.flip += p.flipSpeed;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;

          const scaleX = Math.cos(p.flip);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.scale(scaleX, 1);

          ctx.fillStyle = `rgba(255, 183, 209, ${p.opacity})`;
          ctx.shadowColor = 'rgba(255, 130, 180, 0.4)';
          ctx.shadowBlur = 4;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
          ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
          ctx.fill();
          ctx.restore();
        }
      }

      // 4. SNOW EFFECT
      if (effect === 'snow') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < snowflakes.length; i++) {
          const s = snowflakes[i];
          s.y += s.speedY;
          s.x += s.wind + Math.sin(s.y * 0.02) * 0.5;

          if (s.y > height) {
            s.y = -5;
            s.x = Math.random() * width;
          }
          if (s.x > width + 10) s.x = -10;
          if (s.x < -10) s.x = width + 10;

          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. MATRIX EFFECT (Clean digital rain without glitch tear)
      if (effect === 'matrix') {
        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
        for (let i = 0; i < matrixDrops.length; i++) {
          const text = characters.charAt(Math.floor(Math.random() * characters.length));
          const x = i * fontSize;
          const y = matrixDrops[i] * fontSize;

          // Head of drop
          ctx.fillStyle = i % 3 === 0 ? '#00f0ff' : '#6ee7b7';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 6;
          ctx.fillText(text, x, y);

          // Trail text
          ctx.shadowBlur = 0;
          ctx.fillStyle = i % 2 === 0 ? 'rgba(6, 182, 212, 0.75)' : 'rgba(34, 197, 94, 0.75)';
          ctx.fillText(characters.charAt(Math.floor(Math.random() * characters.length)), x, y - fontSize);

          if (y > height && Math.random() > 0.975) {
            matrixDrops[i] = 0;
          }
          matrixDrops[i]++;
        }
      }

      // 6. STARS & NEBULA
      if (effect === 'stars') {
        for (let i = 0; i < stars.length; i++) {
          const st = stars[i];
          st.alpha += st.alphaChange;
          if (st.alpha <= 0.1 || st.alpha >= 0.9) {
            st.alphaChange = -st.alphaChange;
          }
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, Math.min(1, st.alpha))})`;
          ctx.shadowBlur = st.radius > 1.2 ? 6 : 0;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        if (!shootingStar && Math.random() < 0.008) {
          shootingStar = {
            x: Math.random() * (width * 0.7),
            y: Math.random() * (height * 0.4),
            length: 80 + Math.random() * 60,
            speed: 16 + Math.random() * 8,
            opacity: 1,
          };
        }

        if (shootingStar) {
          ctx.save();
          const grad = ctx.createLinearGradient(
            shootingStar.x,
            shootingStar.y,
            shootingStar.x + shootingStar.length,
            shootingStar.y + shootingStar.length * 0.5
          );
          grad.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(shootingStar.x, shootingStar.y);
          ctx.lineTo(
            shootingStar.x + shootingStar.length,
            shootingStar.y + shootingStar.length * 0.5
          );
          ctx.stroke();
          ctx.restore();

          shootingStar.x += shootingStar.speed;
          shootingStar.y += shootingStar.speed * 0.5;
          shootingStar.opacity -= 0.025;
          if (shootingStar.opacity <= 0) {
            shootingStar = null;
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [effect, intensity]);

  if (effect === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{ opacity: effect === 'rain' ? 0.85 : 0.6 }}
    />
  );
}
