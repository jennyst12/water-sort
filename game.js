/* Water Sort Puzzle — game.js
   Vanilla React (UMD), no build step required.
   Drop index.html + game.js into any static host / GitHub Pages.
*/
(function () {
  "use strict";

  const { useState, useEffect, useCallback } = React;

  // ---------------------------------------------------------------------------
  // COLOUR PALETTE
  // ---------------------------------------------------------------------------
  const COLORS = [
    { id: 1,  base: "#D93025", pattern: "none",         patCol: null,      name: "red"       },
    { id: 2,  base: "#007A6E", pattern: "h-stripes",    patCol: "#005a52", name: "teal"      },
    { id: 3,  base: "#F5C400", pattern: "dots",         patCol: "#c49800", name: "yellow"    },
    { id: 4,  base: "#52C99A", pattern: "diag-stripes", patCol: "#3aab80", name: "mint"      },
    { id: 5,  base: "#7C4DFF", pattern: "none",         patCol: null,      name: "purple"    },
    { id: 6,  base: "#E91E8C", pattern: "dots",         patCol: "#b8166e", name: "pink"      },
    { id: 7,  base: "#2196F3", pattern: "v-stripes",    patCol: "#1565c0", name: "blue"      },
    { id: 8,  base: "#F4511E", pattern: "diag-stripes", patCol: "#bf3c12", name: "orange"    },
    { id: 9,  base: "#1A237E", pattern: "h-stripes",    patCol: "#aab1e8", name: "navy"      },
    { id: 10, base: "#76BC21", pattern: "v-stripes",    patCol: "#558c16", name: "lime"      },
    { id: 11, base: "#8B4513", pattern: "dots",         patCol: "#5c2d0a", name: "brown"     },
    { id: 12, base: "#BF360C", pattern: "h-stripes",    patCol: "#8a2508", name: "rust"      },
    { id: 13, base: "#00838F", pattern: "diag-stripes", patCol: "#005f6a", name: "cyan"      },
    { id: 14, base: "#fff994", pattern: "v-stripes",    patCol: "#4a322b", name: "mocha"     },
    { id: 15, base: "#AD1457", pattern: "diag-stripes", patCol: "#7c0d3d", name: "crimson"   },
    { id: 16, base: "#33691E", pattern: "dots",         patCol: "#1e3d10", name: "forest"    },
    { id: 17, base: "#4A148C", pattern: "h-stripes",    patCol: "#2d0a5c", name: "violet"    },
    { id: 18, base: "#F57F17", pattern: "v-stripes",    patCol: "#b85a00", name: "amber"     },
    { id: 19, base: "#006064", pattern: "dots",         patCol: "#003d40", name: "petrol"    },
    { id: 20, base: "#880E4F", pattern: "none",         patCol: null,      name: "maroon"    },
    { id: 21, base: "#1B5E20", pattern: "diag-stripes", patCol: "#0a3a10", name: "darkgreen" },
    { id: 22, base: "#37474F", pattern: "h-stripes",    patCol: "#1c2b31", name: "slate"     },
    { id: 23, base: "#efcaff", pattern: "h-stripes",    patCol: "#7C4DFF", name: "lilac"     },
    { id: 24, base: "#cbf0ff", pattern: "h-stripes",    patCol: "#1c2b31", name: "sky"       },
    { id: 25, base: "#ffb7c5", pattern: "h-stripes",    patCol: "#1c2b31", name: "babypink"  },
  ];

  function patternCSS(type, col) {
    if (!type || type === "none" || !col) return "";
    const enc = encodeURIComponent;
    const op = "0.35";
    switch (type) {
      case "dots":
        return `url("data:image/svg+xml,${enc(`<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><circle cx='5' cy='5' r='2' fill='${col}' fill-opacity='${op}'/></svg>`)}")`;
      case "h-stripes":
        return `url("data:image/svg+xml,${enc(`<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect x='0' y='3' width='8' height='2' fill='${col}' fill-opacity='${op}'/></svg>`)}")`;
      case "v-stripes":
        return `url("data:image/svg+xml,${enc(`<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect x='3' y='0' width='2' height='8' fill='${col}' fill-opacity='${op}'/></svg>`)}")`;
      case "diag-stripes":
        return `url("data:image/svg+xml,${enc(`<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><line x1='0' y1='8' x2='8' y2='0' stroke='${col}' stroke-width='2' stroke-opacity='${op}'/></svg>`)}")`;
      default: return "";
    }
  }

  // ---------------------------------------------------------------------------
  // THEME TOKENS
  // ---------------------------------------------------------------------------
  function tok(isDark) {
    return {
      pageBg:              isDark ? "linear-gradient(135deg,#0f0c29 0%,#1a1a4e 50%,#24243e 100%)"
                                  : "linear-gradient(135deg,#f5f7ff 0%,#dfe9f3 50%,#cdd8e7 100%)",
      panelBg:             isDark ? "rgba(7,7,25,0.36)"              : "rgba(255,255,255,0.82)",
      textPrimary:         isDark ? "#ffffff"                        : "#0f1c3f",
      textSecondary:       isDark ? "rgba(255,255,255,0.45)"         : "rgba(15,28,63,0.6)",
      textMuted:           isDark ? "rgba(255,255,255,0.25)"         : "rgba(15,28,63,0.38)",
      accent:              isDark ? "#C9B1FF"                        : "#5b3fd4",
      divider:             isDark ? "rgba(255,255,255,0.10)"         : "rgba(15,28,63,0.12)",
      btnBg:               isDark ? "rgba(255,255,255,0.08)"         : "rgba(15,28,63,0.07)",
      btnBorder:           isDark ? "rgba(255,255,255,0.20)"         : "rgba(15,28,63,0.25)",
      btnText:             isDark ? "#ffffff"                        : "#0f1c3f",
      btnDisabledBg:       isDark ? "rgba(255,255,255,0.03)"         : "rgba(15,28,63,0.03)",
      btnDisabledText:     isDark ? "rgba(255,255,255,0.20)"         : "rgba(15,28,63,0.25)",
      levelActiveBg:       isDark ? "rgba(201,177,255,0.18)"         : "rgba(91,63,212,0.12)",
      levelActiveBorder:   isDark ? "#C9B1FF"                        : "#5b3fd4",
      levelActiveText:     isDark ? "#C9B1FF"                        : "#5b3fd4",
      levelIdleBorder:     isDark ? "rgba(255,255,255,0.15)"         : "rgba(15,28,63,0.20)",
      levelIdleText:       isDark ? "rgba(255,255,255,0.55)"         : "rgba(15,28,63,0.60)",
      tubeBorder:          isDark ? "rgba(255,255,255,0.22)"         : "rgba(15,28,63,0.30)",
      tubeSelectedBorder:  isDark ? "#ffffff"                        : "#0f1c3f",
      tubeExtraBorder:     isDark ? "rgba(255,255,255,0.40)"         : "rgba(15,28,63,0.45)",
      tubeSelectedGlow:    isDark ? "0 0 22px rgba(255,255,255,0.45),inset 0 0 10px rgba(255,255,255,0.06)"
                                  : "0 0 16px rgba(15,28,63,0.25),inset 0 0 8px rgba(15,28,63,0.06)",
      tubeInnerShadow:     isDark ? "inset 0 0 10px rgba(0,0,0,0.4)": "inset 0 0 10px rgba(0,0,0,0.10)",
      tubeBg:              isDark ? "rgba(255,255,255,0.05)"         : "rgba(255,255,255,0.60)",
      tubeRim:             isDark ? "rgba(255,255,255,0.18)"         : "rgba(15,28,63,0.25)",
      tubeRimSelected:     isDark ? "rgba(255,255,255,0.65)"         : "rgba(15,28,63,0.70)",
      overlayBg:           "rgba(10,8,30,0.92)",
      overlayText:         "#ffffff",
      overlayMuted:        "rgba(255,255,255,0.58)",
    };
  }

  // ---------------------------------------------------------------------------
  // STATS  (localStorage)
  // ---------------------------------------------------------------------------
  const STATS_KEY = "waterSortStats_v1";

  function loadStats() {
    try { const r = localStorage.getItem(STATS_KEY); return r ? JSON.parse(r) : {}; }
    catch { return {}; }
  }

  function saveStats(s) {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {}
  }

  function recordWin(stats, label, moves) {
    const s = stats[label] || { played: 0, won: 0, totalMoves: 0, bestMoves: null };
    return {
      ...stats,
      [label]: {
        played:     s.played + 1,
        won:        s.won + 1,
        totalMoves: s.totalMoves + moves,
        bestMoves:  s.bestMoves === null ? moves : Math.min(s.bestMoves, moves),
      },
    };
  }

  // ---------------------------------------------------------------------------
  // GAME LOGIC
  // ---------------------------------------------------------------------------
  const TUBE_CAPACITY = 4;

  function isTubeComplete(tube) {
    return tube.length === TUBE_CAPACITY && tube.every(c => c === tube[0]);
  }

  function generatePuzzle(numColors, spareTubes) {
    const all = [];
    for (let c = 0; c < numColors; c++)
      for (let i = 0; i < TUBE_CAPACITY; i++) all.push(c + 1);
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    const tubes = [];
    for (let i = 0; i < numColors; i++)
      tubes.push(all.slice(i * TUBE_CAPACITY, (i + 1) * TUBE_CAPACITY));
    for (let i = 0; i < spareTubes; i++) tubes.push([]);
    return tubes;
  }

  function isSolved(tubes) {
    return tubes.every(t => t.length === 0 || isTubeComplete(t));
  }

  function canPour(from, to) {
    if (from.length === 0) return false;
    if (to.length >= TUBE_CAPACITY) return false;
    if (to.length === 0) return true;
    return from[from.length - 1] === to[to.length - 1];
  }

  function pour(tubes, fromIdx, toIdx) {
    const next = tubes.map(t => [...t]);
    const from = next[fromIdx], to = next[toIdx];
    const col = from[from.length - 1];
    while (from.length > 0 && from[from.length - 1] === col && to.length < TUBE_CAPACITY)
      to.push(from.pop());
    return next;
  }

  // ---------------------------------------------------------------------------
  // LEVELS
  // ---------------------------------------------------------------------------
  const LEVELS = [
    { label: "Beginner",    colors: 2,  spareTubes: 1 },
    { label: "Easy",        colors: 3,  spareTubes: 1 },
    { label: "Medium",      colors: 5,  spareTubes: 2 },
    { label: "Hard",        colors: 7,  spareTubes: 2 },
    { label: "Expert",      colors: 8,  spareTubes: 2 },
    { label: "Master",      colors: 10, spareTubes: 2 },
    { label: "Nightmare",   colors: 12, spareTubes: 2 },
    { label: "Insane",      colors: 13, spareTubes: 3 },
    { label: "Brutal",      colors: 14, spareTubes: 3 },
    { label: "Merciless",   colors: 15, spareTubes: 3 },
    { label: "Impossible",  colors: 16, spareTubes: 3 },
    { label: "Infernal",    colors: 17, spareTubes: 3 },
    { label: "Diabolical",  colors: 18, spareTubes: 4 },
    { label: "Catastrophic",colors: 19, spareTubes: 4 },
    { label: "Cataclysmic", colors: 20, spareTubes: 4 },
    { label: "Apocalyptic", colors: 21, spareTubes: 4 },
    { label: "Extinction",  colors: 22, spareTubes: 4 },
    { label: "Dreadful",    colors: 23, spareTubes: 4 },
    { label: "Excruciating",colors: 24, spareTubes: 4 },
    { label: "Extra-Hard",  colors: 25, spareTubes: 4 },
  ];

  // ---------------------------------------------------------------------------
  // TUBE COMPONENT
  // ---------------------------------------------------------------------------
  function Tube({ contents, isSelected, isExtra, isComplete, justCompleted, onClick, t }) {
    const filled   = [...contents].reverse();
    const segments = Array(TUBE_CAPACITY - filled.length).fill(null).concat(filled);

    // Colour of the completed tube's liquid, for the border + cap tint
    const completedColor = isComplete
      ? (COLORS.find(c => c.id === contents[0]) || null)
      : null;

    // Border: completed > selected > extra > normal
    let border, boxShadow;
    if (isComplete) {
      const col = completedColor ? completedColor.base : "#fff";
      border    = `3px solid ${col}`;
      boxShadow = `0 0 12px ${col}88, inset 0 0 6px ${col}22`;
    } else if (isSelected) {
      border    = `2.5px solid ${t.tubeSelectedBorder}`;
      boxShadow = t.tubeSelectedGlow;
    } else if (isExtra) {
      border    = `2.5px dashed ${t.tubeExtraBorder}`;
      boxShadow = t.tubeInnerShadow;
    } else {
      border    = `2.5px solid ${t.tubeBorder}`;
      boxShadow = t.tubeInnerShadow;
    }

    return React.createElement("div", {
      onClick,
      style: {
        display: "flex", flexDirection: "column", alignItems: "center",
        cursor: isComplete ? "default" : "pointer",
        transform: isSelected ? "translateY(-16px) scale(1.06)" : "translateY(0) scale(1)",
        transition: "transform 0.18s cubic-bezier(.34,1.56,.64,1)",
        animation: justCompleted ? "wsTubeComplete 0.5s ease" : "none",
      },
    },
      // Cap — visible only when complete; sits on top of the tube body
      React.createElement("div", {
        style: {
          width: 44,
          height: isComplete ? 10 : 0,
          borderRadius: "6px 6px 0 0",
          background: completedColor
            ? `linear-gradient(180deg, ${completedColor.base} 0%, ${completedColor.base}cc 100%)`
            : "transparent",
          boxShadow: completedColor ? `0 -2px 6px ${completedColor.base}66` : "none",
          overflow: "hidden",
          transition: "height 0.2s ease",
          flexShrink: 0,
        },
      }),

      // Tube body
      React.createElement("div", {
        style: {
          width: 52, height: 160, borderRadius: "0 0 28px 28px",
          border, boxShadow,
          background: t.tubeBg,
          overflow: "hidden", display: "flex", flexDirection: "column", position: "relative",
          transition: "border 0.15s, box-shadow 0.15s",
        },
      },
        segments.map((colorId, i) => {
          const col = colorId ? COLORS.find(c => c.id === colorId) : null;
          const pat = col ? patternCSS(col.pattern, col.patCol) : "";
          return React.createElement("div", {
            key: `${i}-${colorId ?? "e"}`,
            style: {
              flex: 1,
              background:      col ? col.base : "transparent",
              backgroundImage: pat || undefined,
              backgroundSize:  col ? "10px 10px" : undefined,
              borderBottom:    i < TUBE_CAPACITY - 1 && col ? "1px solid rgba(255,255,255,0.12)" : "none",
              boxShadow:       col ? "inset 0 2px 5px rgba(255,255,255,0.18)" : "none",
            },
          });
        })
      ),

      // Bottom rim
      React.createElement("div", {
        style: {
          width: 36, height: 6, borderRadius: "0 0 10px 10px",
          background: isComplete
            ? (completedColor ? completedColor.base : t.tubeRimSelected)
            : isSelected ? t.tubeRimSelected : t.tubeRim,
          marginTop: -1, transition: "background 0.18s",
        },
      })
    );
  }

  // ---------------------------------------------------------------------------
  // BUTTON
  // ---------------------------------------------------------------------------
  function Btn({ onClick, disabled, accent, overlay, children, t }) {
    const bg    = accent   ? "linear-gradient(135deg,#C9B1FF,#85C1E9)"
                : disabled ? (overlay ? "rgba(255,255,255,0.05)" : t.btnDisabledBg)
                : overlay  ? "rgba(255,255,255,0.12)"
                : t.btnBg;
    const bdr   = accent   ? "none"
                : overlay  ? "1.5px solid rgba(255,255,255,0.28)"
                :            `1.5px solid ${t.btnBorder}`;
    const color = accent   ? "#1a1a4e"
                : disabled ? (overlay ? "rgba(255,255,255,0.28)" : t.btnDisabledText)
                : overlay  ? "rgba(255,255,255,0.92)"
                : t.btnText;

    return React.createElement("button", {
      onClick, disabled,
      style: {
        padding: "10px 20px", borderRadius: 12,
        border: bdr, background: bg, color,
        fontSize: 14, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.15s", whiteSpace: "nowrap",
      },
    }, children);
  }

  // ---------------------------------------------------------------------------
  // STATS PANEL
  // ---------------------------------------------------------------------------
  function StatsPanel({ stats, t, onClose }) {
    const hasAny = LEVELS.some(l => stats[l.label]?.played > 0);

    return React.createElement("div", {
      style: {
        position: "fixed", inset: 0, background: "rgba(10,8,30,0.88)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(10px)", zIndex: 300, animation: "wsFadeIn 0.3s ease",
        padding: "20px 16px",
      },
    },
      React.createElement("div", {
        style: {
          background: t.panelBg, borderRadius: 20, padding: "28px 24px",
          maxWidth: 540, width: "100%", maxHeight: "85vh", overflowY: "auto",
          boxShadow: "0 8px 48px rgba(0,0,0,0.5)", color: t.textPrimary,
        },
      },
        React.createElement("div", {
          style: { fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" },
        }, "📊 Statistics"),
        React.createElement("div", {
          style: { fontSize: 13, color: t.textSecondary, marginBottom: 20 },
        }, "Your history across all difficulty levels"),

        !hasAny && React.createElement("div", {
          style: { color: t.textMuted, fontSize: 14, textAlign: "center", padding: "20px 0" },
        }, "No games completed yet — start playing!"),

        hasAny && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } },
          React.createElement("div", {
            style: {
              display: "grid", gridTemplateColumns: "120px 1fr 1fr 1fr 1fr",
              gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: t.textMuted,
              paddingBottom: 8, borderBottom: `1px solid ${t.divider}`,
            },
          },
            ["Level","Played","Won","Best","Avg"].map((h, i) =>
              React.createElement("div", {
                key: h, style: { textAlign: i === 0 ? "left" : "right" },
              }, h)
            )
          ),
          ...LEVELS.map(l => {
            const s = stats[l.label];
            if (!s || s.played === 0) return null;
            const avg     = s.won > 0 ? Math.round(s.totalMoves / s.won) : "—";
            const winRate = Math.round((s.won / s.played) * 100);
            return React.createElement("div", {
              key: l.label,
              style: {
                display: "grid", gridTemplateColumns: "120px 1fr 1fr 1fr 1fr",
                gap: 8, fontSize: 14, alignItems: "center",
                padding: "8px 0", borderBottom: `1px solid ${t.divider}`,
              },
            },
              React.createElement("div", { style: { fontWeight: 700 } }, l.label),
              React.createElement("div", { style: { textAlign: "right" } }, s.played),
              React.createElement("div", { style: { textAlign: "right", color: t.accent, fontWeight: 600 } },
                `${s.won} (${winRate}%)`),
              React.createElement("div", { style: { textAlign: "right", color: t.accent, fontWeight: 700 } },
                s.bestMoves ?? "—"),
              React.createElement("div", { style: { textAlign: "right" } }, avg),
            );
          }).filter(Boolean)
        ),

        React.createElement("div", { style: { marginTop: 24, display: "flex", justifyContent: "center" } },
          React.createElement(Btn, { onClick: onClose, t }, "Close")
        )
      )
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN APP
  // ---------------------------------------------------------------------------
  function App() {
    const [theme,        setTheme]        = useState("light");
    const [levelIdx,     setLevelIdx]     = useState(2);
    const [tubes,        setTubes]        = useState([]);
    const [selected,     setSelected]     = useState(null);
    const [moves,        setMoves]        = useState(0);
    const [history,      setHistory]      = useState([]);
    const [won,          setWon]          = useState(false);
    const [wonDismissed, setWonDismissed] = useState(false);
    const [showLevels,   setShowLevels]   = useState(false);
    const [extraCount,   setExtraCount]   = useState(0);
    const [stats,        setStats]        = useState(loadStats);
    const [showStats,    setShowStats]    = useState(false);
    // Set of tube indices that just completed (cleared after animation)
    const [justCompleted, setJustCompleted] = useState(new Set());

    const t = tok(theme === "dark");

    useEffect(() => {
      const p = new URLSearchParams(window.location.search);
      const u = p.get("theme");
      if (u === "dark" || u === "light") setTheme(u);
    }, []);

    useEffect(() => {
      const p = new URLSearchParams(window.location.search);
      p.set("theme", theme);
      window.history.replaceState({}, "", window.location.pathname + "?" + p.toString());
      document.body.style.background = t.pageBg;
      document.body.style.color      = t.textPrimary;
    }, [theme]);

    const startGame = useCallback((idx) => {
      setTubes(generatePuzzle(LEVELS[idx].colors, LEVELS[idx].spareTubes));
      setSelected(null);
      setMoves(0);
      setHistory([]);
      setWon(false);
      setWonDismissed(false);
      setLevelIdx(idx);
      setExtraCount(0);
      setShowLevels(false);
      setJustCompleted(new Set());
    }, []);

    useEffect(() => { startGame(2); }, []);

    function handleTubeClick(idx) {
      if (won) return;
      // Completed tubes can't be selected or poured into/from
      if (isTubeComplete(tubes[idx]) && selected === null) return;
      if (selected === null) {
        if (tubes[idx].length === 0) return;
        setSelected(idx);
      } else if (selected === idx) {
        setSelected(null);
      } else {
        if (canPour(tubes[selected], tubes[idx])) {
          setHistory(h => [...h, tubes.map(r => [...r])]);
          const next = pour(tubes, selected, idx);
          setTubes(next);
          const newMoves = moves + 1;
          setMoves(newMoves);
          setSelected(null);

          // Check which tubes newly became complete
          const newlyDone = new Set();
          next.forEach((tube, i) => {
            if (isTubeComplete(tube) && !isTubeComplete(tubes[i])) {
              newlyDone.add(i);
            }
          });
          if (newlyDone.size > 0) {
            setJustCompleted(newlyDone);
            setTimeout(() => setJustCompleted(new Set()), 600);
          }

          if (isSolved(next)) {
            setTimeout(() => {
              setWon(true);
              setWonDismissed(false);
              setStats(prev => {
                const updated = recordWin(prev, LEVELS[levelIdx].label, newMoves);
                saveStats(updated);
                return updated;
              });
            }, 320);
          }
        } else {
          setSelected(idx);
        }
      }
    }

    function handleUndo() {
      if (!history.length) return;
      setTubes(history[history.length - 1]);
      setHistory(h => h.slice(0, -1));
      setMoves(m => Math.max(0, m - 1));
      setSelected(null);
      setWon(false);
      setWonDismissed(false);
      setJustCompleted(new Set());
    }

    function handleAddTube() {
      setHistory(h => [...h, tubes.map(r => [...r])]);
      setTubes(ts => [...ts, []]);
      setExtraCount(n => n + 1);
      setMoves(m => m + 3);
    }

    function dismissWinOverlay() {
      setWonDismissed(true);
    }

    const numTubes       = tubes.length;
    const perRow         = numTubes <= 6 ? numTubes : numTubes <= 10 ? 5 : 6;
    const extraStart     = tubes.length - extraCount;
    const curStats       = stats[LEVELS[levelIdx].label];
    const showWinOverlay = won && !wonDismissed;

    return React.createElement("div", {
      style: {
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-start",
        padding: "28px 16px 40px",
        color: t.textPrimary, background: t.panelBg,
        backdropFilter: theme === "light" ? "blur(4px)" : "none",
      },
    },
      React.createElement("style", null, `
        @keyframes wsFadeIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes wsTubeComplete {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.12) translateY(-6px); }
          60%  { transform: scale(0.97) translateY(0px); }
          100% { transform: scale(1); }
        }
      `),

      // Title
      React.createElement("div", { style: { textAlign: "center", marginBottom: 22 } },
        React.createElement("div", {
          style: { fontSize: 11, letterSpacing: "0.38em", color: t.textSecondary, textTransform: "uppercase", marginBottom: 4 },
        }, "Liquid Puzzle"),
        React.createElement("div", {
          style: { fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: t.textPrimary,
            textShadow: theme === "dark" ? "0 0 40px rgba(180,160,255,0.5)" : "none" },
        }, "Water Sort")
      ),

      // Stats row
      React.createElement("div", { style: { display: "flex", gap: 16, alignItems: "center", marginBottom: 20 } },
        React.createElement("div", { style: { textAlign: "center" } },
          React.createElement("div", { style: { fontSize: 24, fontWeight: 800, color: t.accent } }, moves),
          React.createElement("div", { style: { fontSize: 10, color: t.textMuted, letterSpacing: "0.12em" } }, "MOVES")
        ),
        React.createElement("div", { style: { width: 1, height: 28, background: t.divider } }),
        React.createElement("div", {
          onClick: () => setShowLevels(v => !v),
          style: {
            padding: "6px 16px", borderRadius: 20, cursor: "pointer",
            border: `1.5px solid ${t.btnBorder}`, background: t.btnBg,
            color: t.btnText, fontSize: 13, fontWeight: 700,
          },
        }, LEVELS[levelIdx].label + " ▾"),
        React.createElement("div", { style: { width: 1, height: 28, background: t.divider } }),
        React.createElement("div", {
          onClick: () => setShowStats(true),
          style: {
            padding: "6px 14px", borderRadius: 20, cursor: "pointer",
            border: `1.5px solid ${t.btnBorder}`, background: t.btnBg,
            color: t.btnText, fontSize: 13, fontWeight: 700,
          },
        }, "📊 Stats")
      ),

      // Level picker
      showLevels && React.createElement("div", {
        style: { display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", justifyContent: "center" },
      },
        LEVELS.map((l, i) =>
          React.createElement("div", {
            key: i, onClick: () => startGame(i),
            style: {
              padding: "5px 16px", borderRadius: 16, cursor: "pointer", fontSize: 13, fontWeight: 700,
              border: `1.5px solid ${i === levelIdx ? t.levelActiveBorder : t.levelIdleBorder}`,
              background: i === levelIdx ? t.levelActiveBg : "transparent",
              color: i === levelIdx ? t.levelActiveText : t.levelIdleText,
            },
          }, l.label)
        )
      ),

      // Tubes grid
      React.createElement("div", {
        style: {
          display: "flex", flexWrap: "wrap", gap: "14px 14px",
          justifyContent: "center", maxWidth: `${perRow * 82}px`, marginBottom: 28,
        },
      },
        tubes.map((tube, i) =>
          React.createElement(Tube, {
            key: i, contents: tube,
            isSelected:    selected === i,
            isExtra:       i >= extraStart,
            isComplete:    isTubeComplete(tube),
            justCompleted: justCompleted.has(i),
            onClick:       () => handleTubeClick(i),
            t,
          })
        )
      ),

      // Controls
      React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" } },
        React.createElement(Btn, { onClick: handleUndo, disabled: history.length === 0, t }, "↩ Undo"),
        React.createElement(Btn, { onClick: handleAddTube, t }, "+ Tube (+3)"),
        React.createElement(Btn, { onClick: () => startGame(levelIdx), t }, "↺ Restart"),
        won && wonDismissed &&
          React.createElement(Btn, { onClick: () => setWonDismissed(false), t }, "🎉 Results"),
        React.createElement(Btn, {
          onClick: () => setTheme(th => th === "light" ? "dark" : "light"),
          accent: theme === "dark", t,
        }, theme === "light" ? "🌙 Dark" : "☀️ Light"),
      ),

      // Win overlay
      showWinOverlay && React.createElement("div", {
        onClick: dismissWinOverlay,
        style: {
          position: "fixed", inset: 0, background: t.overlayBg,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(10px)", zIndex: 200, animation: "wsFadeIn 0.4s ease",
          cursor: "pointer",
        },
      },
        React.createElement("div", {
          onClick: e => e.stopPropagation(),
          style: { display: "flex", flexDirection: "column", alignItems: "center", cursor: "default", position: "relative" },
        },
          React.createElement("button", {
            onClick: dismissWinOverlay,
            style: {
              position: "absolute", top: -48, right: -16,
              background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.25)",
              borderRadius: "50%", width: 36, height: 36,
              color: "#fff", fontSize: 18, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            },
          }, "×"),

          React.createElement("div", { style: { fontSize: 64, marginBottom: 10 } }, "🎉"),
          React.createElement("div", {
            style: { fontSize: 36, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 6, color: t.overlayText },
          }, "Solved!"),
          React.createElement("div", {
            style: { fontSize: 15, color: t.overlayMuted, marginBottom: 6 },
          },
            `${moves} move${moves !== 1 ? "s" : ""}` +
            (extraCount > 0 ? ` · ${extraCount} extra tube${extraCount > 1 ? "s" : ""} used` : "")
          ),

          curStats && curStats.bestMoves === moves
            ? React.createElement("div", { style: { fontSize: 14, color: "#C9B1FF", fontWeight: 700, marginBottom: 24 } }, "🏆 New best!")
            : curStats && curStats.bestMoves
            ? React.createElement("div", { style: { fontSize: 13, color: t.overlayMuted, marginBottom: 24 } },
                `Best: ${curStats.bestMoves} moves`)
            : React.createElement("div", { style: { marginBottom: 24 } }),

          React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" } },
            React.createElement(Btn, { accent: true, overlay: true, onClick: () => startGame(levelIdx), t }, "Play Again"),
            levelIdx < LEVELS.length - 1 &&
              React.createElement(Btn, { overlay: true, onClick: () => startGame(levelIdx + 1), t }, "Next Level →"),
            React.createElement(Btn, { overlay: true, onClick: dismissWinOverlay, t }, "See board"),
            React.createElement(Btn, { overlay: true, onClick: () => setShowStats(true), t }, "📊 Stats"),
          ),

          React.createElement("div", {
            style: { marginTop: 18, fontSize: 12, color: "rgba(255,255,255,0.35)" },
          }, "click outside or × to dismiss")
        )
      ),

      // Stats panel
      showStats && React.createElement(StatsPanel, { stats, t, onClose: () => setShowStats(false) })
    );
  }

  // ---------------------------------------------------------------------------
  // BOOTSTRAP
  // ---------------------------------------------------------------------------
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(React.createElement(App));
})();
