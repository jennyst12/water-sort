/* Water Sort Puzzle — game.js
   Vanilla React (UMD), no build step required.
   Drop index.html + game.js into any static host / GitHub Pages.
*/
(function () {
  "use strict";

  const { useState, useEffect, useCallback, useRef } = React;

  // ---------------------------------------------------------------------------
  // COLOUR PALETTE
  // Each colour has a solid hex, a pattern type, and a pattern colour.
  // Colours are chosen for maximum contrast: WCAG relative-luminance differences
  // are checked in comments. Patterns further distinguish similar hues.
  // ---------------------------------------------------------------------------
  const COLORS = [
    // 1 – strong red
    { id: 1,  base: "#D93025", pattern: "none",             patCol: null,      name: "red"      },
    // 2 – deep teal (dark enough to contrast well with mint)
    { id: 2,  base: "#007A6E", pattern: "h-stripes",        patCol: "#005a52", name: "teal"     },
    // 3 – golden yellow (lightened from amber to stand apart from orange)
    { id: 3,  base: "#F5C400", pattern: "dots",             patCol: "#c49800", name: "yellow"   },
    // 4 – light mint — uses diagonal stripes to separate from teal
    { id: 4,  base: "#52C99A", pattern: "diag-stripes",     patCol: "#3aab80", name: "mint"     },
    // 5 – mid purple
    { id: 5,  base: "#7C4DFF", pattern: "none",             patCol: null,      name: "purple"   },
    // 6 – hot pink (distinct hue from red and purple)
    { id: 6,  base: "#E91E8C", pattern: "dots",             patCol: "#b8166e", name: "pink"     },
    // 7 – bright sky blue (lighter than teal, dots to separate from purple)
    { id: 7,  base: "#2196F3", pattern: "v-stripes",        patCol: "#1565c0", name: "blue"     },
    // 8 – deep orange (distinct from yellow via hue + stripes)
    { id: 8,  base: "#F4511E", pattern: "diag-stripes",     patCol: "#bf3c12", name: "orange"   },
    // 9 – dark navy (new Master colour)
    { id: 9,  base: "#1A237E", pattern: "h-stripes",        patCol: "#0d1554", name: "navy"     },
    // 10 – lime green (new Master colour, far from mint/teal)
    { id: 10, base: "#76BC21", pattern: "v-stripes",        patCol: "#558c16", name: "lime"     },
  ];

  // SVG data-URIs for pattern overlays — rendered as a background-image on top of base colour
  function patternCSS(type, col) {
    if (!type || type === "none" || !col) return "";
    const enc = (s) => encodeURIComponent(s);
    const opacity = "0.35";
    switch (type) {
      case "dots":
        return `url("data:image/svg+xml,${enc(
          `<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><circle cx='5' cy='5' r='2' fill='${col}' fill-opacity='${opacity}'/></svg>`
        )}")`;
      case "h-stripes":
        return `url("data:image/svg+xml,${enc(
          `<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect x='0' y='3' width='8' height='2' fill='${col}' fill-opacity='${opacity}'/></svg>`
        )}")`;
      case "v-stripes":
        return `url("data:image/svg+xml,${enc(
          `<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect x='3' y='0' width='2' height='8' fill='${col}' fill-opacity='${opacity}'/></svg>`
        )}")`;
      case "diag-stripes":
        return `url("data:image/svg+xml,${enc(
          `<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><line x1='0' y1='8' x2='8' y2='0' stroke='${col}' stroke-width='2' stroke-opacity='${opacity}'/></svg>`
        )}")`;
      default:
        return "";
    }
  }

  // ---------------------------------------------------------------------------
  // GAME LOGIC
  // ---------------------------------------------------------------------------
  const TUBE_CAPACITY = 4;

  function generatePuzzle(numColors) {
    const allSegments = [];
    for (let c = 0; c < numColors; c++)
      for (let i = 0; i < TUBE_CAPACITY; i++) allSegments.push(c + 1);

    // Fisher-Yates shuffle
    for (let i = allSegments.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSegments[i], allSegments[j]] = [allSegments[j], allSegments[i]];
    }

    const tubes = [];
    for (let i = 0; i < numColors; i++)
      tubes.push(allSegments.slice(i * TUBE_CAPACITY, (i + 1) * TUBE_CAPACITY));

    tubes.push([]); // one empty tube to start
    return tubes;
  }

  function isSolved(tubes) {
    return tubes.every(
      (t) => t.length === 0 || (t.length === TUBE_CAPACITY && t.every((c) => c === t[0]))
    );
  }

  function canPour(from, to) {
    if (from.length === 0) return false;
    if (to.length >= TUBE_CAPACITY) return false;
    if (to.length === 0) return true;
    return from[from.length - 1] === to[to.length - 1];
  }

  function pour(tubes, fromIdx, toIdx) {
    const next = tubes.map((t) => [...t]);
    const from = next[fromIdx];
    const to   = next[toIdx];
    const col  = from[from.length - 1];
    while (from.length > 0 && from[from.length - 1] === col && to.length < TUBE_CAPACITY)
      to.push(from.pop());
    return next;
  }

  // ---------------------------------------------------------------------------
  // TUBE COMPONENT
  // ---------------------------------------------------------------------------
  function Tube({ contents, isSelected, onClick, isExtra }) {
    // Nulls at top (empty air), colours at bottom — stable bottom-up indices
    const filled   = [...contents].reverse();
    const segments = Array(TUBE_CAPACITY - filled.length).fill(null).concat(filled);

    return React.createElement(
      "div",
      {
        onClick,
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          transform: isSelected ? "translateY(-16px) scale(1.06)" : "translateY(0) scale(1)",
          transition: "transform 0.18s cubic-bezier(.34,1.56,.64,1)",
        },
      },
      // Tube body
      React.createElement(
        "div",
        {
          style: {
            width: 52,
            height: 160,
            borderRadius: "0 0 28px 28px",
            border: isSelected
              ? "2.5px solid #fff"
              : isExtra
              ? "2.5px dashed rgba(255,255,255,0.35)"
              : "2.5px solid rgba(255,255,255,0.22)",
            boxShadow: isSelected
              ? "0 0 22px rgba(255,255,255,0.45), inset 0 0 10px rgba(255,255,255,0.06)"
              : "inset 0 0 10px rgba(0,0,0,0.4)",
            background: "rgba(255,255,255,0.05)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          },
        },
        segments.map((colorId, i) => {
          const col = colorId ? COLORS.find((c) => c.id === colorId) : null;
          const pat = col ? patternCSS(col.pattern, col.patCol) : "";
          return React.createElement("div", {
            key: `${i}-${colorId ?? "e"}`,
            style: {
              flex: 1,
              background: col ? col.base : "transparent",
              // Pattern overlay via background-image layered over base colour
              backgroundImage: pat || undefined,
              backgroundSize: col ? "10px 10px" : undefined,
              borderBottom: i < TUBE_CAPACITY - 1 && col
                ? "1px solid rgba(255,255,255,0.12)"
                : "none",
              boxShadow: col ? "inset 0 2px 5px rgba(255,255,255,0.18)" : "none",
            },
          });
        })
      ),
      // Tube rim
      React.createElement("div", {
        style: {
          width: 36,
          height: 6,
          borderRadius: "0 0 10px 10px",
          background: isSelected ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.18)",
          marginTop: -1,
          transition: "background 0.18s",
        },
      })
    );
  }

  // ---------------------------------------------------------------------------
  // LEVELS
  // ---------------------------------------------------------------------------
  const LEVELS = [
    { label: "Easy",   colors: 3  },
    { label: "Medium", colors: 5  },
    { label: "Hard",   colors: 7  },
    { label: "Expert", colors: 8  },
    { label: "Master", colors: 10 },
  ];

  // ---------------------------------------------------------------------------
  // BUTTON helper
  // ---------------------------------------------------------------------------
  function Btn({ onClick, disabled, accent, children }) {
    return React.createElement(
      "button",
      {
        onClick,
        disabled,
        style: {
          padding: "10px 20px",
          borderRadius: 12,
          border: accent ? "none" : "1.5px solid rgba(255,255,255,0.15)",
          background: accent
            ? "linear-gradient(135deg, #C9B1FF, #85C1E9)"
            : disabled
            ? "rgba(255,255,255,0.03)"
            : "rgba(255,255,255,0.07)",
          color: accent ? "#1a1a4e" : disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.8)",
          fontSize: 14,
          fontWeight: 700,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "opacity 0.15s",
          whiteSpace: "nowrap",
        },
      },
      children
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN APP
  // ---------------------------------------------------------------------------
  function App() {
    const [theme,      setTheme]      = useState('light');
    const [levelIdx,   setLevelIdx]   = useState(1);
    const [tubes,      setTubes]      = useState([]);
    const [selected,   setSelected]   = useState(null);
    const [moves,      setMoves]      = useState(0);
    const [history,    setHistory]    = useState([]);
    const [won,        setWon]        = useState(false);
    const [showLevels, setShowLevels] = useState(false);
    const [extraCount, setExtraCount] = useState(0); // how many bonus tubes added this game

    const startGame = useCallback((idx) => {
      setTubes(generatePuzzle(LEVELS[idx].colors));
      setSelected(null);
      setMoves(0);
      setHistory([]);
      setWon(false);
      setLevelIdx(idx);
      setExtraCount(0);
      setShowLevels(false);
    }, []);

    useEffect(() => { startGame(1); }, []);

    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme');
      if (urlTheme === 'dark' || urlTheme === 'light') {
        setTheme(urlTheme);
      } else {
        setTheme('light');
      }
    }, []);

    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      params.set('theme', theme);
      const newUrl = window.location.pathname + '?' + params.toString();
      window.history.replaceState({}, '', newUrl);

      if (theme === 'dark') {
        document.body.style.background = 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 50%, #24243e 100%)';
        document.body.style.color = '#fff';
      } else {
        document.body.style.background = 'linear-gradient(135deg, #f5f7ff 0%, #dfe9f3 50%, #cdd8e7 100%)';
        document.body.style.color = '#121620';
      }
    }, [theme]);

    function handleTubeClick(idx) {
      if (won) return;
      if (selected === null) {
        if (tubes[idx].length === 0) return;
        setSelected(idx);
      } else if (selected === idx) {
        setSelected(null);
      } else {
        if (canPour(tubes[selected], tubes[idx])) {
          setHistory((h) => [...h, tubes.map((t) => [...t])]);
          const next = pour(tubes, selected, idx);
          setTubes(next);
          setMoves((m) => m + 1);
          setSelected(null);
          if (isSolved(next)) setTimeout(() => setWon(true), 320);
        } else {
          setSelected(idx);
        }
      }
    }

    function handleUndo() {
      if (!history.length) return;
      setTubes(history[history.length - 1]);
      setHistory((h) => h.slice(0, -1));
      setMoves((m) => Math.max(0, m - 1));
      setSelected(null);
      setWon(false);
    }

    function handleAddTube() {
      setHistory((h) => [...h, tubes.map((t) => [...t])]);
      setTubes((ts) => [...ts, []]);
      setExtraCount((n) => n + 1);
      setMoves((m) => m + 3); // small penalty
    }

    // Number of tubes per row — cap at 5 to keep them large enough
    const numTubes = tubes.length;
    const perRow   = numTubes <= 6 ? numTubes : numTubes <= 10 ? 5 : 6;

    // Which tube indices are "extra" (added mid-game)?
    // They're appended at the end, so last extraCount tubes are extras.
    const extraStart = tubes.length - extraCount;

    // ---------------------------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------------------------
    return React.createElement(
      "div",
      {
        style: {
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "28px 16px 40px",
          color: theme === 'dark' ? '#fff' : '#1c2b4b',
          background: theme === 'dark' ? 'rgba(7,7,25,0.36)' : 'rgba(255,255,255,0.72)',
          backdropFilter: theme === 'light' ? 'blur(4px)' : 'none',
        },
      },

      // ── Title ──
      React.createElement(
        "div",
        { style: { textAlign: "center", marginBottom: 22 } },
        React.createElement("div", {
          style: { fontSize: 11, letterSpacing: "0.38em", color: theme === 'dark' ? "rgba(255,255,255,0.4)" : "rgba(35,47,82,0.65)", textTransform: "uppercase", marginBottom: 4 },
        }, "Liquid Puzzle"),
        React.createElement("div", {
          style: { fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", textShadow: "0 0 40px rgba(180,160,255,0.5)" },
        }, "Water Sort")
      ),

      // ── Stats + level picker trigger ──
      React.createElement(
        "div",
        { style: { display: "flex", gap: 20, alignItems: "center", marginBottom: 20 } },
        React.createElement(
          "div",
          { style: { textAlign: "center" } },
          React.createElement("div", { style: { fontSize: 24, fontWeight: 800, color: "#C9B1FF" } }, moves),
          React.createElement("div", { style: { fontSize: 10, color: "rgba(255,255,255,0.38)", letterSpacing: "0.12em" } }, "MOVES")
        ),
        React.createElement("div", { style: { width: 1, height: 28, background: "rgba(255,255,255,0.1)" } }),
        React.createElement(
          "div",
          {
            onClick: () => setShowLevels((v) => !v),
            style: {
              padding: "6px 16px", borderRadius: 20,
              border: "1.5px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 700, cursor: "pointer",
            },
          },
          LEVELS[levelIdx].label + " ▾"
        )
      ),

      // ── Level picker ──
      showLevels && React.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", justifyContent: "center" } },
        LEVELS.map((l, i) =>
          React.createElement(
            "div",
            {
              key: i,
              onClick: () => startGame(i),
              style: {
                padding: "5px 16px", borderRadius: 16, cursor: "pointer", fontSize: 13, fontWeight: 700,
                border: `1.5px solid ${i === levelIdx ? "#C9B1FF" : "rgba(255,255,255,0.15)"}`,
                background: i === levelIdx ? "rgba(201,177,255,0.15)" : "rgba(255,255,255,0.04)",
                color: i === levelIdx ? "#C9B1FF" : "rgba(255,255,255,0.5)",
              },
            },
            l.label
          )
        )
      ),

      // ── Tubes grid ──
      React.createElement(
        "div",
        {
          style: {
            display: "flex", flexWrap: "wrap", gap: "14px 14px",
            justifyContent: "center",
            maxWidth: `${perRow * 82}px`,
            marginBottom: 28,
          },
        },
        tubes.map((tube, i) =>
          React.createElement(Tube, {
            key: i,
            contents: tube,
            isSelected: selected === i,
            isExtra: i >= extraStart,
            onClick: () => handleTubeClick(i),
          })
        )
      ),

      // ── Controls ──
      React.createElement(
        "div",
        { style: { display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" } },
        React.createElement(Btn, { onClick: handleUndo, disabled: history.length === 0 }, "↩ Undo"),
        React.createElement(Btn, { onClick: handleAddTube }, "+ Extra tube  (+3 moves)"),
        React.createElement(Btn, { onClick: () => startGame(levelIdx) }, "↺ Restart"),
        React.createElement(Btn, {
          onClick: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
          accent: theme === 'dark',
        }, theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode'),
      ),

      // ── Win overlay ──
      won && React.createElement(
        "div",
        {
          style: {
            position: "fixed", inset: 0,
            background: "rgba(10,8,30,0.88)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(10px)",
            zIndex: 200,
            animation: "wsFadeIn 0.4s ease",
          },
        },
        React.createElement("style", null,
          "@keyframes wsFadeIn { from { opacity:0; transform:scale(0.88) } to { opacity:1; transform:scale(1) } }"
        ),
        React.createElement("div", { style: { fontSize: 64, marginBottom: 10 } }, "🎉"),
        React.createElement("div", { style: { fontSize: 36, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 6 } }, "Solved!"),
        React.createElement("div", { style: { fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 32 } },
          `${moves} move${moves !== 1 ? "s" : ""}` +
          (extraCount > 0 ? ` · ${extraCount} extra tube${extraCount > 1 ? "s" : ""} used` : "")
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" } },
          React.createElement(Btn, { accent: true, onClick: () => startGame(levelIdx) }, "Play Again"),
          levelIdx < LEVELS.length - 1 &&
            React.createElement(Btn, { onClick: () => startGame(levelIdx + 1) }, "Next Level →")
        )
      )
    );
  }

  // ---------------------------------------------------------------------------
  // BOOTSTRAP
  // ---------------------------------------------------------------------------
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(React.createElement(App));
})();
