// Generates parity fixtures from the real `natural` library.
// Run from repo root: node apps/native/scripts/gen-parity-fixtures.mjs
import { createRequire } from "module";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

// Resolve `natural` from packages/ui, then resolve its own dep `afinn-165`
// relative to natural's location (it is not hoisted next to packages/ui).
const baseRequire = createRequire(resolve("packages/ui") + "/");
const require = createRequire(baseRequire.resolve("natural"));
const natural = require("natural");
const { WordTokenizer, PorterStemmer, SentimentAnalyzer } = natural;
const afinn = require("afinn-165").afinn165;

const tok = new WordTokenizer();
const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");

function mostFrequent(words) {
  if (words.length === 0) return null;
  const f = {};
  for (const w of words) { const l = w.toLowerCase(); f[l] = (f[l] || 0) + 1; }
  let mw = null, mc = 0;
  for (const [w, c] of Object.entries(f)) { if (c > mc) { mc = c; mw = w; } }
  return mw;
}
function analyze(text) {
  const words = tok.tokenize(text) || [];
  return {
    input: text,
    wordCount: words.length,
    charCount: text.length,
    mostFrequentWord: mostFrequent(words),
    sentimentScore: analyzer.getSentiment(words), // NaN -> null via JSON
  };
}

// Stems: every AFINN word + a curated inflection set.
const extraWords = ["caresses","ponies","ties","agreed","motoring","conflated","troubled","sized","hopping","falling","hissing","filing","happy","sky","relational","conditional","digitizer","conformabli","radicalli","differentli","vileli","analogousli","vietnamization","predication","operator","feudalism","decisiveness","hopefulness","callousness","formaliti","sensitiviti","triplicate","formative","formalize","electriciti","electrical","hopeful","goodness","revival","allowance","inference","airliner","gyroscopic","adjustable","defensible","irritant","replacement","adjustment","dependent","adoption","communism","activate","angulariti","homologous","effective","bowdlerize","loving","loved","hates","hated","running","runs","cried","cries"];
const stemWords = Array.from(new Set([...Object.keys(afinn), ...extraWords]));
const stems = {};
for (const w of stemWords) stems[w] = PorterStemmer.stem(w);

// Analysis: sample texts + edge cases.
const texts = [
  "When the Waters were dried an' the Earth did appear,\n(\"It's all one,\" says the Sapper),\n    The Lord He created the Engineer,\n    Her Majesty's Royal Engineer,\n    With the rank and pay of a Sapper!",
  "1. Open a fresh Claude Code session\n2. Ask Claude to run the dev workflow\n3. Confirm it points to packages/ui",
  "I love love love this but I hate the bug",
  "This is not good and not wonderful",
  "wonderful amazing great fantastic excellent",
  "the the the cat cat dog",
  "!!! ??? ...",
  "café über naïve",
  "a",
  "NOT not No no NEVER neither good good good",
  "abandon abandoned abandons abducted",
];
const analysis = texts.map(analyze);

const dir = resolve("apps/native/src-tauri/tests/fixtures");
mkdirSync(dir, { recursive: true });
writeFileSync(resolve(dir, "stems.json"), JSON.stringify(stems));
writeFileSync(resolve(dir, "analysis.json"), JSON.stringify(analysis, null, 1));
console.log(`wrote ${Object.keys(stems).length} stems and ${analysis.length} analysis cases`);
