
import './App.css'
import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_TEXT = `History is not something
that only happened.

History is something
that is happening.

Every generation
stands at a hinge.

What men believe
shapes what families become.

What families become
shapes what a nation inherits.

England does not lack information.

It lacks conviction.

PilgrimWarrior exists
to form disciplined Christian men.

Pilgrims in exile.

Warriors in truth.

Rooted in Scripture.

Strengthened in doctrine.

Prepared to stand firm.

We begin with Christ.

If you want meaning and purpose,
stand for Christ’s truth —
come what may.`;

export default function App() {
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  const [text, setText] = useState(DEFAULT_TEXT);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(30); // pixels per second
  const [fontSize, setFontSize] = useState(48);
  const [lineHeight, setLineHeight] = useState(1.35);
  const [maxWidth, setMaxWidth] = useState(900);
  const [mirror, setMirror] = useState(false);
  const [bg, setBg] = useState("#000000");
  const [fg, setFg] = useState("#ffffff");

  const transform = useMemo(() => {
    // Mirror flips horizontally for mirror-glass rigs; for standard use keep off.
    return mirror ? "scaleX(-1)" : "none";
  }, [mirror]);

  useEffect(() => {
    if (!isRunning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    let last = performance.now();

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      el.scrollTop += speed * dt;

      // Stop when we reach the bottom
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      if (atBottom) {
        setIsRunning(false);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isRunning, speed]);

  const resetToTop = () => {
    const el = containerRef.current;
    if (el) el.scrollTop = 0;
    setIsRunning(false);
  };

  const jumpBack = (px = 120) => {
    const el = containerRef.current;
    if (el) el.scrollTop = Math.max(0, el.scrollTop - px);
  };

  const jumpForward = (px = 120) => {
    const el = containerRef.current;
    if (el) el.scrollTop = Math.min(el.scrollHeight, el.scrollTop + px);
  };


  // Load text from latest.txt
  const loadFromFile = async () => {
    try {
      const resp = await fetch('/latest.txt');
      if (!resp.ok) throw new Error('Failed to load file');
      const fileText = await resp.text();
      setText(fileText);
    } catch (e) {
      alert('Could not load latest.txt');
    }
  };

  return (
    <div style={{ height: "100vh", display: "grid", gridTemplateColumns: "380px 1fr" }}>
      {/* Controls */}
      <div style={{ padding: 16, borderRight: "1px solid #222", background: "#0b0b0b", color: "#fff" }}>
        <h2 style={{ margin: "0 0 12px 0", fontSize: 18 }}>TelePrompter</h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <button onClick={() => setIsRunning((v) => !v)} style={btn()}>
            {isRunning ? "Pause" : "Start"}
          </button>
          <button onClick={() => jumpBack()} style={btn()}>Back</button>
          <button onClick={() => jumpForward()} style={btn()}>Forward</button>
          <button onClick={resetToTop} style={btn({ background: "#222" })}>Reset</button>
          <button onClick={loadFromFile} style={btn({ background: "#2a2a2a" })}>Load from File</button>
        </div>

        <label style={label()}>Speed (px/sec): {speed}</label>
        <input type="range" min="5" max="120" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={range()} />

        <label style={label()}>Font size: {fontSize}px</label>
        <input type="range" min="24" max="96" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} style={range()} />

        <label style={label()}>Line height: {lineHeight.toFixed(2)}</label>
        <input
          type="range"
          min="1.1"
          max="1.8"
          step="0.01"
          value={lineHeight}
          onChange={(e) => setLineHeight(Number(e.target.value))}
          style={range()}
        />

        <label style={label()}>Text width: {maxWidth}px</label>
        <input type="range" min="520" max="1200" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} style={range()} />

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} />
            Mirror
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            BG <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Text <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
          </label>
        </div>

        <label style={{ ...label(), marginTop: 12 }}>Script</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          style={{
            width: "100%",
            height: "40vh",
            background: "#111",
            color: "#fff",
            border: "1px solid #222",
            borderRadius: 10,
            padding: 10,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: 12,
          }}
        />
        <div style={{ color: "#aaa", fontSize: 12, marginTop: 8 }}>
          Tip: Fullscreen the prompter panel (right) for filming. Use Start/Pause with spacebar if you add a keybind later.
        </div>
      </div>

      {/* Prompter */}
      <div
        ref={containerRef}
        style={{
          background: bg,
          color: fg,
          overflowY: "auto",
          padding: "12vh 8vw",
          transform,
        }}
      >
        <div
          style={{
            maxWidth,
            margin: "0 auto",
            fontSize,
            lineHeight,
            fontFamily: 'Georgia, "Times New Roman", Times, serif',
            letterSpacing: "0.2px",
            whiteSpace: "pre-wrap",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

function btn(extra = {}) {
  return {
    background: "#1b1b1b",
    color: "#fff",
    border: "1px solid #2a2a2a",
    borderRadius: 10,
    padding: "8px 10px",
    cursor: "pointer",
    ...extra,
  };
}
function label() {
  return { display: "block", marginTop: 10, marginBottom: 6, color: "#cfcfcf", fontSize: 12 };
}
function range() {
  return { width: "100%" };
}
