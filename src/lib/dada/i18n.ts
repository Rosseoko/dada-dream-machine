// Multilingual UI strings. Poem text remains in the user's language.

export type LangCode = "en" | "es" | "it" | "pt" | "ar" | "zh" | "fr";

export const LANGUAGES: { code: LangCode; label: string; native: string }[] = [
  { code: "en", label: "English", native: "EN" },
  { code: "es", label: "Español", native: "ES" },
  { code: "it", label: "Italiano", native: "IT" },
  { code: "pt", label: "Português", native: "PT" },
  { code: "fr", label: "Français", native: "FR" },
  { code: "ar", label: "العربية", native: "ع" },
  { code: "zh", label: "中文", native: "中" },
];

export type Dict = {
  tagline: string;
  prompt: string;
  lede: string;
  placeholder: string;
  generate: string;
  generateSub: string;
  again: string;
  download: string;
  newWords: string;
  needMore: string;
  footL: string;
  footR: string;
  manifesto: string;
  edition: string;
  seed: string;
  dragHint: string;
  animalsMode: string;
};

export const DICT: Record<LangCode, Dict> = {
  en: {
    tagline: "DADA ART GENERATOR",
    prompt: "Give me your words.",
    lede: "A song. A sentence. A whisper. A complaint. Six words or more. Chance will cut them up, paste them down, and sign the wreckage in your name.",
    placeholder: "Type anything. The thought is made in the mouth…",
    generate: "Cut It Up",
    generateSub: "PRINT THE ACCIDENT",
    again: "↻ Reshuffle Fate",
    download: "↓ Print Manifesto",
    newWords: "← New Words",
    needMore: "Six words minimum. Chance demands material.",
    footL: "TZARA CUT-UP · 1920",
    footR: "",
    manifesto: "MANIFESTO",
    edition: "Manifesto N°",
    seed: "SEED",
    dragHint: "Drag the scraps. Rearrange the accident. Then print.",
    animalsMode: "🐾 Animals Mode",
  },
  es: {
    tagline: "DADA ART GENERATOR",
    prompt: "Dame tus palabras.",
    lede: "Una canción. Una frase. Un susurro. Una queja. Seis palabras o más. El azar las cortará, las pegará y firmará el desastre en tu nombre.",
    placeholder: "Escribe lo que sea. El pensamiento se hace en la boca…",
    generate: "Recórtalo",
    generateSub: "IMPRIME EL ACCIDENTE",
    again: "↻ Otra Suerte",
    download: "↓ Imprimir Manifiesto",
    newWords: "← Nuevas Palabras",
    needMore: "Mínimo seis palabras. El azar exige materia.",
    footL: "RECORTE DE TZARA · 1920",
    footR: "",
    manifesto: "MANIFIESTO",
    edition: "Manifiesto N°",
    seed: "SEMILLA",
    dragHint: "Arrastra los recortes. Recompón el accidente. Luego imprime.",
    animalsMode: "🐾 Modo Animales",
  },
  it: {
    tagline: "GENERATORE DI ARTE DADA",
    prompt: "Dammi le tue parole.",
    lede: "Una canzone. Una frase. Un mormorio. Una lamentela. Sei parole o più. Il caso le taglierà, le incollerà, firmerà il disastro al tuo posto.",
    placeholder: "Scrivi qualunque cosa. Il pensiero si fa in bocca…",
    generate: "Taglialo",
    generateSub: "STAMPA L'INCIDENTE",
    again: "↻ Rimescola la Sorte",
    download: "↓ Stampa Manifesto",
    newWords: "← Nuove Parole",
    needMore: "Sei parole minimo. Il caso esige materia.",
    footL: "RITAGLIO DI TZARA · 1920",
    footR: "",
    manifesto: "MANIFESTO",
    edition: "Manifesto N°",
    seed: "SEME",
    dragHint: "Trascina i ritagli. Ricomponi l'incidente. Poi stampa.",
    animalsMode: "🐾 Modalità Animali",
  },
  pt: {
    tagline: "GERADOR DE ARTE DADA",
    prompt: "Dê-me as suas palavras.",
    lede: "Uma canção. Uma frase. Um sussurro. Uma queixa. Seis palavras ou mais. O acaso as cortará, colará e assinará o destroço em teu nome.",
    placeholder: "Escreve qualquer coisa. O pensamento faz-se na boca…",
    generate: "Recorta",
    generateSub: "IMPRIME O ACIDENTE",
    again: "↻ Outro Acaso",
    download: "↓ Imprimir Manifesto",
    newWords: "← Novas Palavras",
    needMore: "Seis palavras no mínimo. O acaso exige matéria.",
    footL: "RECORTE DE TZARA · 1920",
    footR: "",
    manifesto: "MANIFESTO",
    edition: "Manifesto N°",
    seed: "SEMENTE",
    dragHint: "Arrasta os recortes. Reorganiza o acidente. Depois imprime.",
    animalsMode: "🐾 Modo Animais",
  },
  fr: {
    tagline: "GÉNÉRATEUR D'ART DADA",
    prompt: "Donne-moi tes mots.",
    lede: "Une chanson. Une phrase. Un murmure. Une plainte. Six mots minimum. Le hasard les coupera, les collera, signera la ruine en ton nom.",
    placeholder: "Écris n'importe quoi. La pensée se fait dans la bouche…",
    generate: "Découpe-le",
    generateSub: "IMPRIME L'ACCIDENT",
    again: "↻ Rejouer le Hasard",
    download: "↓ Imprimer le Manifeste",
    newWords: "← Nouveaux Mots",
    needMore: "Six mots minimum. Le hasard exige de la matière.",
    footL: "DÉCOUPAGE DE TZARA · 1920",
    footR: "",
    manifesto: "MANIFESTE",
    edition: "Manifeste N°",
    seed: "GRAINE",
    dragHint: "Glisse les coupures. Recompose l'accident. Puis imprime.",
    animalsMode: "🐾 Mode Animaux",
  },
  ar: {
    tagline: "مولد فن الدادا",
    prompt: "أعطني كلماتك.",
    lede: "أغنية. جملة. همسة. شكوى. ست كلمات أو أكثر. ستقصّها الصدفة، تلصقها، وتوقّع الخراب باسمك.",
    placeholder: "اكتب أي شيء. الفكرة تُصنع في الفم…",
    generate: "قُصّها",
    generateSub: "اطبع الحادث",
    again: "↻ بَعثرة جديدة",
    download: "↓ اطبع البيان",
    newWords: "← كلمات جديدة",
    needMore: "ست كلمات على الأقل. الصدفة تطلب مادة.",
    footL: "قصاصة تزارا · 1920",
    footR: "",
    manifesto: "بيان",
    edition: "بيان رقم",
    seed: "بذرة",
    dragHint: "اسحب القصاصات. أعِد ترتيب الحادث. ثم اطبع.",
    animalsMode: "🐾 وضع الحيوانات",
  },
  zh: {
    tagline: "达达艺术生成器",
    prompt: "把你的字给我。",
    lede: "一首歌。一句话。一声低语。一句抱怨。至少六个字。偶然会剪开、粘贴，并以你的名义在残骸上签字。",
    placeholder: "随便写。想法在口中诞生……",
    generate: "剪开它",
    generateSub: "打印这场意外",
    again: "↻ 重新洗牌",
    download: "↓ 打印宣言",
    newWords: "← 新的字句",
    needMore: "至少六个字。偶然需要材料。",
    footL: "查拉剪贴 · 1920",
    footR: "",
    manifesto: "宣言",
    edition: "宣言 第",
    seed: "种子",
    dragHint: "拖动碎片，重组这场意外，然后打印。",
    animalsMode: "🐾 动物模式",
  },
};
