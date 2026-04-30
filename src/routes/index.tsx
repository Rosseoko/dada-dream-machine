import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { generatePoem, type Poem } from "@/lib/dada/cutup";
import { drawManifesto } from "@/lib/dada/draw";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "DADA — Manifesto Generator" },
      {
        name: "description",
        content:
          "Type your words. Chance reassembles them into a one-of-a-kind Dada manifesto broadside. Download the poem.",
      },
      { property: "og:title", content: "DADA — Manifesto Generator" },
      {
        property: "og:description",
        content: "A Tzara cut-up engine. Your words, shuffled by chance, printed by algorithm.",
      },
    ],
  }),
});

const CANVAS_W = 1200;
const CANVAS_H = 1600;

function Index() {
  const [input, setInput] = useState("");
  const [poem, setPoem] = useState<Poem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (poem && canvasRef.current) {
      drawManifesto(canvasRef.current, poem, {
        width: CANVAS_W,
        height: CANVAS_H,
        scale: 2,
      });
    }
  }, [poem]);

  const handleGenerate = () => {
    setError(null);
    try {
      const p = generatePoem(input);
      setPoem(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something refused.");
    }
  };

  const handleAgain = () => {
    setError(null);
    try {
      setPoem(generatePoem(input));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something refused.");
    }
  };

  const handleNew = () => {
    setPoem(null);
    setError(null);
    setInput("");
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `dada-manifesto-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="dada-page">
      <div className="paper-grain" aria-hidden />

      {!poem ? (
        <section className="intro">
          <header className="intro__masthead">
            <h1 className="intro__title">DADA</h1>
            <div className="intro__rule" />
            <p className="intro__sub">
              N° {String(new Date().getFullYear()).slice(-2)}
              <span className="dot">·</span>
              MANIFESTO GENERATOR
              <span className="dot">·</span>
              PRIX: HASARD
            </p>
          </header>

          <div className="intro__body">
            <h2 className="intro__prompt">Give me your words.</h2>
            <p className="intro__lede">
              A sentence. A paragraph. A complaint. Anything with at least six words. Chance will
              reassemble them into a manifesto, printed by algorithm, signed by accident.
            </p>

            <textarea
              className="intro__textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="The thought is made in the mouth..."
              rows={6}
              spellCheck={false}
            />

            {error && <p className="intro__error">{error}</p>}

            <button className="btn btn--stamp" onClick={handleGenerate}>
              <span>GENERATE</span>
              <span className="btn__sub">PAR LE HASARD</span>
            </button>
          </div>

          <footer className="intro__foot">
            <span>TZARA CUT-UP · 1920</span>
            <span>SANS L.L.M. · TOUT EST HASARD</span>
          </footer>
        </section>
      ) : (
        <section className="result">
          <div className="result__bar">
            <button className="btn btn--ghost" onClick={handleNew}>
              ← NEW WORDS
            </button>
            <div className="result__bar-actions">
              <button className="btn btn--ghost" onClick={handleAgain}>
                ↻ AGAIN
              </button>
              <button className="btn btn--solid" onClick={handleDownload}>
                ↓ DOWNLOAD
              </button>
            </div>
          </div>
          <div className="result__canvas-wrap">
            <canvas ref={canvasRef} className="result__canvas" />
          </div>
        </section>
      )}
    </main>
  );
}
