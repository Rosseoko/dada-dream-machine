import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import { generatePoem, type Poem } from "@/lib/dada/cutup";
import { buildBackgroundSVG } from "@/lib/dada/draw";
import { layoutScraps, type Scrap } from "@/lib/dada/scraps";
import { newSeedCode, editionFromSeed } from "@/lib/dada/rng";
import { DICT, LANGUAGES, type LangCode } from "@/lib/dada/i18n";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "DADA — Manifesto Generator" },
      {
        name: "description",
        content:
          "Type your words. Chance fractures them into a one-of-a-kind Dada manifesto. Drag the scraps. Print the accident.",
      },
      { property: "og:title", content: "DADA — Manifesto Generator" },
      {
        property: "og:description",
        content: "A Tzara cut-up engine. Your words, shuffled by chance, signed by accident.",
      },
    ],
  }),
});

const POSTER_W = 1200;
const POSTER_H = 1600;
const RTL_LANGS = new Set(["ar"]);

function Index() {
  const [lang, setLang] = useState<LangCode>("en");
  const t = DICT[lang];

  const [input, setInput] = useState("");
  const [poem, setPoem] = useState<Poem | null>(null);
  const [seedCode, setSeedCode] = useState<string>("");
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [zMap, setZMap] = useState<Record<string, number>>({});
  const [topZ, setTopZ] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);

  const seedKey = useMemo(() => {
    return `${lang}|${input.trim().toLowerCase()}|${seedCode}`;
  }, [lang, input, seedCode]);

  const edition = useMemo(() => (seedKey ? editionFromSeed(seedKey) : 0), [seedKey]);

  const svg = useMemo(() => {
    if (!poem) return "";
    return buildBackgroundSVG({
      width: POSTER_W,
      height: POSTER_H,
      seedKey,
      headlineWord: poem.headlineWord,
      edition,
      seedCode,
      lang,
      langDir: RTL_LANGS.has(lang) ? "rtl" : "ltr",
      manifestoLabel: t.manifesto,
      editionLabel: t.edition,
      seedLabel: t.seed,
    });
  }, [poem, seedKey, edition, seedCode, lang, t]);

  const svgDataUrl = useMemo(() => {
    if (!svg) return "";
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [svg]);

  const handleGenerate = (reuseSeed?: string) => {
    setError(null);
    try {
      const sc = reuseSeed ?? newSeedCode();
      const key = `${lang}|${input.trim().toLowerCase()}|${sc}`;
      const p = generatePoem(input, key);
      setSeedCode(sc);
      setPoem(p);
      setScraps(layoutScraps(p.allWords, POSTER_W, POSTER_H, key));
      setZMap({});
      setTopZ(100);
    } catch (e) {
      const msg = e instanceof Error && e.message === "NEED_MORE_WORDS" ? t.needMore : "—";
      setError(msg);
    }
  };

  const handleAgain = () => handleGenerate(); // new seed

  const handleNew = () => {
    setPoem(null);
    setError(null);
    setSeedCode("");
    setScraps([]);
  };

  const updateScrap = useCallback((id: string, patch: Partial<Pick<Scrap, "x" | "y" | "rotation">>) => {
    setScraps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const focusScrap = useCallback((id: string) => {
    setTopZ((z) => {
      const nz = z + 1;
      setZMap((m) => ({ ...m, [id]: nz }));
      return nz;
    });
  }, []);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setExporting(true);
    try {
      // Slight delay so any focus rings clear
      await new Promise((r) => setTimeout(r, 50));
      const dataUrl = await toPng(posterRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#efe7d3",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `dada-manifesto-${seedCode}-N${edition.toString().padStart(4, "0")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  // Recompute scrap layout if user wants — we keep manual moves; only on "again" do we relayout.

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.has(lang) ? "rtl" : "ltr";
  }, [lang]);

  return (
    <main className="dada-page">
      <div className="paper-grain" aria-hidden />

      <LanguageSwitcher value={lang} onChange={setLang} />

      {!poem ? (
        <section className="intro">
          <header className="intro__masthead">
            <h1 className="intro__title">DADA</h1>
            <div className="intro__rule" />
            <p className="intro__sub">{t.tagline}</p>
          </header>

          <div className="intro__body">
            <h2 className="intro__prompt">{t.prompt}</h2>
            <p className="intro__lede">{t.lede}</p>

            <textarea
              className="intro__textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              rows={6}
              spellCheck={false}
            />

            {error && <p className="intro__error">{error}</p>}

            <button className="btn btn--stamp" onClick={() => handleGenerate()}>
              <span>{t.generate}</span>
              <span className="btn__sub">{t.generateSub}</span>
            </button>
          </div>

          <footer className="intro__foot">
            <span>{t.footL}</span>
            <span>{t.footR}</span>
          </footer>
        </section>
      ) : (
        <section className="result">
          <div className="result__bar">
            <button className="btn btn--ghost" onClick={handleNew}>
              {t.newWords}
            </button>
            <p className="result__hint">{t.dragHint}</p>
            <div className="result__bar-actions">
              <button className="btn btn--ghost" onClick={handleAgain}>
                {t.again}
              </button>
              <button className="btn btn--solid" onClick={handleDownload} disabled={exporting}>
                {exporting ? "…" : t.download}
              </button>
            </div>
          </div>

          <div className="poster-wrap">
            <div
              ref={posterRef}
              className="poster"
              style={{ aspectRatio: `${POSTER_W} / ${POSTER_H}` }}
            >
              {svgDataUrl && (
                <img
                  src={svgDataUrl}
                  alt=""
                  className="poster__bg"
                  draggable={false}
                />
              )}
              <div className="poster__scraps" data-scrap-layer>
                {scraps.map((s) => (
                  <ScrapView
                    key={s.id}
                    scrap={s}
                    posterW={POSTER_W}
                    posterH={POSTER_H}
                    containerRef={posterRef}
                    onChange={updateScrap}
                    onFocus={focusScrap}
                    zIndex={zMap[s.id] ?? 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function LanguageSwitcher({
  value,
  onChange,
}: {
  value: LangCode;
  onChange: (l: LangCode) => void;
}) {
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          className={`lang-switch__btn${value === l.code ? " is-active" : ""}`}
          onClick={() => onChange(l.code)}
          title={l.label}
          aria-pressed={value === l.code}
        >
          {l.native}
        </button>
      ))}
    </div>
  );
}

// inline import-style component to keep file count low
import { WordScrap as ScrapView } from "@/components/WordScrap";
