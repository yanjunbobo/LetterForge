import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const site = process.env.SITE_URL || "https://letterforge.example.com";
const customDomain = process.env.CUSTOM_DOMAIN || "";

const words = `
ace act add age ago aid aim air ale all amp ant ape apt arc are arm art ash ask ate awe bad bag ban bar bat bay bed bee bet bid big bin bit blue boa boat bob bog book boon boot box boy bra cab cad can cap car card care cart cat cave code coin cold cone cook cool cop corn cost cot cove cow craft crate dare dart date deal dear deer den desk dew dial dog dome done door dove draw ear earn ease east eat eel egg elf elk elm end era face fact fade fair fame fare fast fate fear feat fed feel fern file find fine fire firm fish fit five flag flame flat flow foam fold food fool foot forge form fort four free frog game garden gear gem ghost gift girl give glow goal gold good grape gray green grin grit hand hard hare hat have heal hear heat held help hero hide hill hint hire home hope ice idea ink iron jam jar jazz jet job join joke jump key kite knit late leaf lean learn letter lift light line lion list listen loan lone long look lore lost love make maker map mark maze meal mean meat meet mint moon more most name near neat nest node note oak oath ocean open orange pace pack page pain pair pale panel part pass past path pear pet pine plan plane play player plot poem point pond port pose post prize race rack rain rake range rate read real reed rest rice ring ripe road roast rock role rose safe sand scar score seal seat seed seek seen send shape share sharp shine ship shoe short side sign silent since sink slate smart smile snake song sort sound space spear spell spike spine stack star start state stone story stream string style table tame team tear tile time tone tool trace track trade trail train tree trial true turn user veil vine vote wake walk wand water wave weak wear west wide wild wind wing winner wire wise word work world yarn year zone zoom
`;

function readWordFile(file) {
  const full = path.join(root, file);
  if (!existsSync(full)) return [];
  return readFileSync(full, "utf8").split(/\s+/);
}

function normalizeWords(items, maxLength = 10) {
  return [...new Set(items.map((word) => word.trim().toLowerCase()).filter((word) => /^[a-z]+$/.test(word) && word.length >= 2 && word.length <= maxLength))].sort();
}

const curatedWords = normalizeWords([...words.trim().split(/\s+/), ...readWordFile("data/word-source.txt")], 10);
const wordList = normalizeWords([...curatedWords, ...readWordFile("data/word-source-large.txt")], 10);
const staticWordList = curatedWords;
const scoreMap = { a:1,e:1,i:1,o:1,u:1,l:1,n:1,s:1,t:1,r:1,d:2,g:2,b:3,c:3,m:3,p:3,f:4,h:4,v:4,w:4,y:4,k:5,j:8,x:8,q:10,z:10 };
const scoreWord = (word) => [...word].reduce((sum, letter) => sum + (scoreMap[letter] || 0), 0);

const articles = [
  {
    slug: "word-game-tips",
    title: "How to Get Better at Word Games",
    desc: "Practical ways to improve pattern recognition, vocabulary recall, and decision making in word games.",
    body: article("How to Get Better at Word Games", [
      "Improving at word games is less about memorizing a mountain of obscure terms and more about building reliable habits. Strong players notice structure quickly. They see common endings, likely vowels, repeated consonants, and small words hiding inside larger racks. That skill grows when you practice with intention instead of simply playing more rounds.",
      "Start by learning the shapes of words. English has familiar clusters such as sh, ch, th, st, tr, and qu. It also has endings such as ing, ed, er, ly, ion, and ate. When a puzzle gives you scrambled letters, move those clusters around as units. This reduces the mental load and helps you find candidates faster.",
      "Short words matter more than beginners expect. Two-letter and three-letter words can unlock cramped boards, connect tiles, and rescue awkward letter sets. Keep a small personal list and review it often. The goal is not to sound encyclopedic; the goal is to recognize playable options under time pressure.",
      "Vowels deserve special attention. A rack with too many vowels may need consonant anchors, while a rack with too few vowels often needs flexible consonant blends. Try separating vowels and consonants before solving. Then test each vowel in the center of a pattern, such as CVC, CVCC, or CCVC.",
      "Use tools thoughtfully. A word finder can show possibilities you missed, but the learning happens when you ask why a result works. Look at the letters it reused, the prefix it formed, and whether a smaller word was inside it. That reflection turns a quick lookup into a training session.",
      "Finally, review your misses. After a puzzle, collect three words you did not see. Sort them by pattern rather than by alphabetical order. If you missed stone, note the st opening and one ending. If you missed crate, note the cr blend and ate ending. Over time your brain starts reaching for those shapes automatically."
    ])
  },
  {
    slug: "wordle-starting-strategies",
    title: "Best Starting Strategies for Wordle-Style Games",
    desc: "A clear guide to opening guesses, letter coverage, and positional thinking for Wordle-style puzzles.",
    body: article("Best Starting Strategies for Wordle-Style Games", [
      "A good start in a Wordle-style puzzle is not a magic word. It is a plan for gathering information. Your first guess should test useful letters, avoid unnecessary repeats, and give you enough positional clues to make the second guess meaningful.",
      "Many strong starting words include several common vowels and flexible consonants. Letters such as a, e, o, r, s, t, l, n, and c appear often in everyday English. A word that tests five distinct letters from that group gives you a broad scan without wasting a turn on duplicate information.",
      "After the first guess, resist the urge to lock onto one possible answer too early. If you have only one green letter and one yellow letter, a second information-rich guess can be better than a narrow guess. The goal is to remove uncertainty. Testing four or five new letters can quickly reveal the real shape of the answer.",
      "Position matters. A yellow letter is not simply present; it is excluded from one position. Write the pattern mentally as a set of constraints. If R is yellow in position two, try it at the beginning, middle, and end while keeping known greens fixed. This prevents you from repeating the same mistake.",
      "Repeated letters are the trap that separates casual solving from careful solving. Do not assume a letter appears once just because you found it once. When the candidate list gets small, consider words with doubled letters, especially common pairs such as ee, ll, ss, oo, and tt.",
      "A solver can help when you use it as a filter, not a replacement for judgment. Enter exact positions, present letters, and excluded letters. Then compare candidates by how much they teach you on the next turn. The best guess is often the one that balances answer likelihood with information value."
    ])
  },
  {
    slug: "anagrams-vocabulary",
    title: "How Anagrams Improve Vocabulary",
    desc: "Why rearranging letters can strengthen spelling, word memory, and vocabulary growth.",
    body: article("How Anagrams Improve Vocabulary", [
      "Anagrams train vocabulary because they force you to look at words as flexible letter systems rather than fixed shapes on a page. When you rearrange letters, you notice roots, prefixes, suffixes, and recurring patterns. That noticing is valuable for spelling and recall.",
      "The first benefit is attention. A normal reading habit lets familiar words pass by quickly. An anagram slows the word down. You examine each letter, test combinations, and ask whether a cluster sounds plausible. This makes the structure of the word more memorable.",
      "The second benefit is connection. A set of letters can produce related or unrelated words, and each result adds a new association. From listen you may find silent, enlist, and inlets. Seeing those words together builds a small network in memory, which makes future recall easier.",
      "Anagrams also reveal morphology. Endings such as er, ed, ing, and ion appear again and again. Prefixes such as re, un, in, and pre can change meaning while preserving a core. Once you learn to spot these pieces, unfamiliar words become less intimidating.",
      "For learners of English, anagram practice can be a low-pressure way to strengthen spelling. You do not need to know every definition immediately. Start with recognition: does this look like a real word? Then add meaning, pronunciation, and usage over time.",
      "The best practice routine is short and repeatable. Choose six to eight letters, find as many words as you can without help, then use a solver to reveal missed options. Pick five missed words, say them aloud, and write a sentence for each. That final step turns letter play into usable vocabulary."
    ])
  },
  {
    slug: "high-scoring-words",
    title: "Tips for Finding High-Scoring Words",
    desc: "Learn how letter values, board position, and rack balance affect scoring in word games.",
    body: article("Tips for Finding High-Scoring Words", [
      "High-scoring words are usually the result of two choices working together: using valuable letters and placing them well. A rare letter by itself is not enough. A short word with a strong tile on a premium square can beat a longer word placed in a dull position.",
      "Begin with the high-value letters. In Scrabble-style scoring, q and z are worth ten points, j and x are worth eight, and k is worth five. These letters are powerful, but they can also clog your rack. Learn common hooks and short words that help you place them cleanly.",
      "Next, look for multipliers. A premium square can change the value of a move more than the word itself. Before committing to a word, scan the board for places where a high-value tile can land on a double or triple letter score. Then check whether the whole word can reach a word multiplier.",
      "Hooks are another major scoring tool. A hook is a single letter that extends an existing word while forming a new word. Placing one tile can score in two directions. Players who notice hooks often find points in crowded boards where longer words are impossible.",
      "Rack balance protects your next move. A spectacular score can still leave a painful rack if it strands too many consonants or too many vowels. When two plays score similarly, choose the one that leaves flexible letters. Good future letters often include vowels plus common consonants such as r, s, t, l, and n.",
      "Use a word finder to explore options, then judge them like a player. Sort by score to see strong candidates, but also check length, placement, and leftover letters. The highest theoretical score in a list may not be the best move on an actual board."
    ])
  },
  {
    slug: "wildcards-blank-tiles",
    title: "Wildcards and Blank Tiles Explained",
    desc: "A friendly guide to using blank tiles and wildcard symbols in word solving tools.",
    body: article("Wildcards and Blank Tiles Explained", [
      "A wildcard is a flexible letter. In a word solver, it usually means one unknown letter that can stand for any letter from a to z. In tile games, a blank tile works in a similar way. It helps complete a word when your rack is missing one exact letter.",
      "In LetterForge, the symbols question mark and asterisk both act as wildcards. If you enter TCA?R, the tool can treat the blank as e to find crate or as other letters for different words. The wildcard does not add a fixed letter to your rack; it supplies whatever one result needs.",
      "Wildcards are powerful because they expand the search space. One blank can open many words. Two blanks can open hundreds. That is helpful, but it can also make results noisy. Use filters such as starts with, ends with, must include, and word length to keep the list useful.",
      "For exact anagrams, a wildcard still counts as one tile. If your input has five total symbols, exact mode returns five-letter words only. Without exact mode, the solver can return shorter words that can be made from part of the rack.",
      "A practical strategy is to solve once without filters, then solve again with a goal. If you need a five-letter word ending in e, add those constraints. If you need a word that uses q, put q in must include. The wildcard will then fill the missing pieces around your plan.",
      "Remember that scoring systems may treat blank tiles differently in real games. LetterForge shows Scrabble-style letter scores for the word itself as a helpful estimate, not as an official move calculator. Board bonuses and blank-tile rules depend on the game you are playing."
    ])
  }
];

function article(title, paras) {
  const wrap = [
    `A simple way to apply this guide is to keep a small practice note for ${title.toLowerCase()}. Write down patterns that helped, words you missed, and clues that were misleading. The note should stay short enough to review before a game, because useful memory is built through repeated contact rather than one long study session.`,
    "When you use an online tool, compare the result list with your own first attempt. Circle the words that feel surprising and ask what made them hard to see. Maybe the vowel was in an unusual place, maybe a consonant blend was hidden, or maybe the word used a common ending you forgot to test.",
    "Progress is easiest to notice over several sessions. Pick one focus at a time: five-letter words this week, high-value letters next week, then wildcard practice after that. Small focused drills keep the process friendly and make the skill transfer back into real puzzles."
  ];
  const expanded = [...paras, ...paras.slice(0, 4).map((p, i) => `${["Practice", "Pattern review", "Tool use", "Better habits"][i]}: ${p}`), ...wrap];
  return expanded.map((p) => `<p>${p}</p>`).join("\n");
}

const faqs = [
  ["What is a word unscrambler?", "A word unscrambler turns mixed letters into possible English words using a searchable word list and simple filters."],
  ["Can I use blank tiles or wildcards?", "Yes. Use ? or * as a wildcard. Each wildcard can stand for one missing letter."],
  ["How are the results sorted?", "Results are grouped by length and can be sorted by length, alphabetical order, or Scrabble-style score."],
  ["Does this use an official game dictionary?", "No. LetterForge uses an open demo word list and Scrabble-style scoring. It is designed so licensed dictionaries can be added later."],
  ["Can this help with Wordle-style puzzles?", "Yes, but the dedicated Wordle Solver is better for fixed positions, present letters, and excluded letters."],
  ["Why are some words missing?", "The included list is intentionally lightweight for this starter build. You can replace it with a larger open or licensed word list."]
];

const tools = [
  ["/", "Word Unscrambler"],
  ["/anagram-solver", "Anagram Solver"],
  ["/word-finder", "Word Finder"],
  ["/wordle-solver", "Wordle Solver"],
  ["/dictionary-checker", "Dictionary Checker"],
  ["/random-word-generator", "Random Word Generator"]
];

function faqHtml(items = faqs) {
  return `<section class="content-section" id="faq"><h2>Frequently Asked Questions</h2><div class="faq-list">${items.map(([q,a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div></section>`;
}

function relatedHtml() {
  return `<aside class="side-panel"><div class="ad-slot" data-ad-slot="sidebar">Ad placeholder</div><h2>Related tools</h2><nav class="related-links">${tools.map(([href,label]) => `<a href="${href}">${label}</a>`).join("")}</nav><h2>Popular searches</h2><nav class="related-links"><a href="/5-letter-words">5-letter words</a><a href="/6-letter-words">6-letter words</a><a href="/words-starting-with-a">Words starting with A</a><a href="/words-ending-with-e">Words ending with E</a></nav><div class="affiliate-block"><h2>Recommended word games</h2><p>Affiliate-ready placement for vocabulary apps and puzzle books.</p></div></aside>`;
}

function seo({ title, desc, url, h1, faq = faqs }) {
  const breadcrumb = url === "/" ? [{ name: "Home", url: site + "/" }] : [{ name: "Home", url: site + "/" }, { name: h1, url: site + url }];
  return `
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${site}${url}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${site}${url}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"WebSite",name:"LetterForge",url:site,potentialAction:{"@type":"SearchAction",target:`${site}/word/{search_term_string}`, "query-input":"required name=search_term_string"}})}</script>
    <script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"WebApplication",name:"LetterForge",applicationCategory:"GameApplication",operatingSystem:"Any",url:site+url,description:desc})}</script>
    <script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:breadcrumb.map((b,i)=>({"@type":"ListItem",position:i+1,name:b.name,item:b.url}))})}</script>
    <script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"FAQPage",mainEntity:faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))})}</script>`;
}

function layout({ title, desc, url, h1, body, pageClass = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="msvalidate.01" content="06348E2D3365CEEC6C11DC7D2A94F86E">
  <meta name="google-site-verification" content="9iR16Pj9o70OLRY0a8GwzryOAvnkJQR3gq2AYIfnFQ0">
  ${seo({ title, desc, url, h1 })}
  <link rel="stylesheet" href="/assets/styles.css">
  <script src="/assets/ads.js" defer></script>
  <script type="module" src="/assets/app.js"></script>
</head>
<body class="${pageClass}">
  <header class="site-header">
    <a class="logo" href="/" aria-label="LetterForge home"><span>Letter</span>Forge</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" class="site-nav">
      ${["Home","Word Unscrambler","Anagram Solver","Word Finder","Wordle Solver","Dictionary Checker","Random Word Generator","Blog"].map((label,i)=>{
        const href = ["/","/","/anagram-solver","/word-finder","/wordle-solver","/dictionary-checker","/random-word-generator","/blog"][i];
        return `<a href="${href}">${label}</a>`;
      }).join("")}
    </nav>
  </header>
  <main>${body}</main>
  <footer class="site-footer">
    <div><strong>LetterForge</strong><p>Fast word tools for puzzle players and English learners. Not affiliated with any word game brand.</p></div>
    <nav><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/sitemap">Sitemap</a></nav>
  </footer>
</body>
</html>`;
}

function toolHero({ mode, h1, subtitle, placeholder = "Enter letters, e.g. TCAER", exact = false }) {
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow">LetterForge word tools</p><h1>${h1}</h1><p>${subtitle}</p></div>${wordTool({ mode, exact, placeholder })}</section>`;
}

function wordTool({ mode, exact, placeholder }) {
  return `<section class="tool-card" data-tool="${mode}">
    <form class="word-form">
      <label for="letters">Letters</label>
      <div class="primary-row"><input id="letters" name="letters" inputmode="text" autocomplete="off" placeholder="${placeholder}"><button type="submit">Find Words</button><button type="button" data-action="clear" class="secondary">Clear</button></div>
      <div class="example-row">${["LISTEN","TCAER","STONE","PLAYER"].map(x=>`<button type="button" data-example="${x}">${x}</button>`).join("")}</div>
      <fieldset class="filters"><legend>Advanced filters</legend>
        <label>Dictionary<select name="dictionary"><option>General English</option><option>Scrabble-style US</option><option>Scrabble-style International</option><option>Words with Friends-style</option></select></label>
        <label>Starts with<input name="startsWith" maxlength="12"></label>
        <label>Ends with<input name="endsWith" maxlength="12"></label>
        <label>Must include<input name="mustInclude" maxlength="12"></label>
        <label>Word length<select name="length"><option value="">Any</option>${[2,3,4,5,6].map(n=>`<option value="${n}">${n}</option>`).join("")}<option value="7+">7+</option></select></label>
        <label>Sort by<select name="sortBy"><option value="length">Length</option><option value="alpha">Alphabetical</option><option value="score">Game score</option></select></label>
        <label class="check"><input type="checkbox" name="exact" ${exact ? "checked" : ""}> Exact anagram</label>
      </fieldset>
    </form>
    <section class="results" aria-live="polite"><h2>Results</h2><p class="empty-state">Enter letters above to make words from your rack.</p></section>
  </section>`;
}

function toolPage({ url, title, desc, h1, subtitle, mode, exact = false, sections }) {
  return layout({ title, desc, url, h1, body: `${toolHero({ mode, h1, subtitle, exact })}<div class="page-grid"><div>${sections}${faqHtml()}<section class="content-section"><h2>Related tools</h2><p>${tools.map(([href,label])=>`<a href="${href}">${label}</a>`).join(" · ")}</p></section><div class="ad-slot" data-ad-slot="content">Ad placeholder</div></div>${relatedHtml()}</div>` });
}

const homeSections = `
<section class="content-section"><h2>What is a word unscrambler?</h2><p>A word unscrambler helps you turn a loose set of letters into playable word ideas. Type your letters, add wildcards if you have blanks, and LetterForge filters a lightweight English word list in your browser.</p></section>
<section class="content-section"><h2>How to use LetterForge</h2><p>Enter letters such as TCAER, choose optional filters, then press Find Words. You can narrow results by beginning, ending, required letters, word length, exact anagram mode, and sorting style.</p></section>
<section class="content-section"><h2>What are wildcards or blank tiles?</h2><p>A question mark or asterisk represents one unknown letter. For example, TCA?E can match words where the blank supplies the missing character.</p></section>
<section class="content-section"><h2>How this helps with word games</h2><p>The tool is useful for anagrams, crosswords, jumble puzzles, Wordscapes-style levels, and Scrabble-style games where you need to inspect possible words quickly.</p></section>
<section class="content-section"><h2>Tips for finding better words</h2><p>Try longer words first, then add filters when the list is too broad. Search with and without exact mode to compare full-rack anagrams against shorter playable words.</p></section>`;

function wordleTool() {
  return `<section class="tool-card" data-tool="wordle"><form class="wordle-form"><label>Correct letters with positions<input name="pattern" placeholder="_ R A _ E" maxlength="9"></label><label>Present letters<input name="present" placeholder="t s"></label><label>Excluded letters<input name="excluded" placeholder="b c d"></label><button type="submit">Find Candidates</button><button type="button" class="secondary" data-action="clear">Clear</button></form><section class="results" aria-live="polite"><h2>Candidates</h2><p class="empty-state">Add a pattern or letter clues to filter five-letter words.</p></section></section>`;
}

function smallToolPage({ url, title, desc, h1, intro, tool, tips }) {
  return layout({ title, desc, url, h1, body: `<section class="hero compact"><div class="hero-copy"><p class="eyebrow">LetterForge</p><h1>${h1}</h1><p>${intro}</p></div>${tool}</section><div class="page-grid"><div><section class="content-section"><h2>How to use this tool</h2><p>${tips[0]}</p></section><section class="content-section"><h2>What this tool is useful for</h2><p>${tips[1]}</p></section><section class="content-section"><h2>Tips</h2><p>${tips[2]}</p></section>${faqHtml()}<div class="ad-slot" data-ad-slot="content">Ad placeholder</div></div>${relatedHtml()}</div>` });
}

function dictionaryTool() {
  return `<section class="tool-card" data-tool="dictionary"><form class="dictionary-form"><label>Word to check<input name="word" placeholder="example"></label><button type="submit">Check Word</button></form><section class="results" aria-live="polite"><h2>Lookup</h2><p class="empty-state">Enter one word to check the current list.</p></section></section>`;
}

function randomTool() {
  return `<section class="tool-card" data-tool="random"><form class="random-form"><label>Word length<select name="length"><option value="">Any</option>${[3,4,5,6,7].map(n=>`<option>${n}</option>`).join("")}</select></label><label>Starts with<input name="startsWith"></label><label>Ends with<input name="endsWith"></label><label>Number of words<input name="count" type="number" min="1" max="50" value="10"></label><button type="submit">Generate Words</button></form><section class="results" aria-live="polite"><h2>Random words</h2><p class="empty-state">Choose filters and generate a fresh list.</p></section></section>`;
}

function seoListPage({ url, title, desc, h1, filter, intro }) {
  const list = wordList.filter(filter).slice(0, 160);
  return layout({ title, desc, url, h1, body: `<section class="hero compact"><div class="hero-copy"><p class="eyebrow">Word lists</p><h1>${h1}</h1><p>${intro}</p></div>${wordTool({ mode:"finder", exact:false, placeholder:"Search letters or add filters" })}</section><div class="page-grid"><div><section class="content-section"><h2>${h1} list</h2><div class="word-list">${list.map(w=>`<a href="/word/${w}">${w}</a>`).join("")}</div></section><section class="content-section"><h2>How to use this list</h2><p>Use this page for quick browsing, puzzle warmups, and internal navigation. Open any word to see score, length, letters, and related word ideas.</p></section>${faqHtml()}<div class="ad-slot" data-ad-slot="content">Ad placeholder</div></div>${relatedHtml()}</div>` });
}

function basicPage({ url, title, desc, h1, content }) {
  return layout({ title, desc, url, h1, body: `<section class="narrow-page"><h1>${h1}</h1>${content}</section>` });
}

function staticWordPage(word) {
  const sortedLetters = [...word].sort().join("");
  const anagrams = wordList.filter((item) => item !== word && item.length === word.length && [...item].sort().join("") === sortedLetters).slice(0, 20);
  const start = word.slice(0, 2);
  const end = word.slice(-2);
  const starting = wordList.filter((item) => item.startsWith(start) && item !== word).slice(0, 20);
  const ending = wordList.filter((item) => item.endsWith(end) && item !== word).slice(0, 20);
  const linkList = (items) => items.length ? items.map((item) => `<a href="/word/${item}">${item}</a>`).join("") : "<p>No related words in the current list.</p>";
  return layout({
    title: `${word} - Word Details, Score and Anagrams | LetterForge`,
    desc: `View ${word} word length, Scrabble-style score, letters, anagrams, and related word links.`,
    url: `/word/${word}`,
    h1: word,
    body: `<section class="narrow-page"><h1>${word}</h1><article class="lookup-card"><strong>Found in current list</strong><p>Length: ${word.length}</p><p>Letters: ${[...word].join(" · ")}</p><p>Scrabble-style score: ${scoreWord(word)}</p><p>Definition placeholder: no authoritative definition is bundled in this starter build.</p></article><section class="content-section"><h2>Anagrams</h2><div class="word-list">${linkList(anagrams)}</div></section><section class="content-section"><h2>Words starting with ${start}</h2><div class="word-list">${linkList(starting)}</div></section><section class="content-section"><h2>Words ending with ${end}</h2><div class="word-list">${linkList(ending)}</div></section><p><a href="/anagram-solver">Solve another anagram</a> · <a href="/word-finder">Open word finder</a></p></section>`
  });
}

function blogIndex() {
  return layout({ title:"LetterForge Blog: Word Game Tips and Vocabulary Guides", desc:"Original guides for word game players, anagram fans, and vocabulary learners.", url:"/blog", h1:"LetterForge Blog", body:`<section class="narrow-page"><h1>LetterForge Blog</h1><p>Original, practical guides for puzzle players and word learners.</p><div class="post-grid">${articles.map(a=>`<article><h2><a href="/blog/${a.slug}">${a.title}</a></h2><p>${a.desc}</p></article>`).join("")}</div></section>` });
}

function blogArticle(a) {
  return layout({ title:`${a.title} | LetterForge`, desc:a.desc, url:`/blog/${a.slug}`, h1:a.title, body:`<article class="article"><a href="/blog">Blog</a><h1>${a.title}</h1>${a.body}${faqHtml([["Can tools help me practice?", "Yes. Use a tool to reveal patterns you missed, then review the words instead of only copying the answer."],["Are these strategies tied to one game?", "No. They are general vocabulary and puzzle-solving habits for many word games."]])}</article>` });
}

async function writePage(route, html) {
  const out = route === "/" ? path.join(root, "index.html") : path.join(root, route, "index.html");
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, html);
}

async function main() {
  await mkdir(path.join(root, "assets"), { recursive: true });
  await mkdir(path.join(root, "data"), { recursive: true });
  await writeFile(path.join(root, "data", "words.json"), JSON.stringify(wordList, null, 2));

  await writePage("/", toolPage({ url:"/", title:"Word Unscrambler - Unscramble Letters into Words | LetterForge", desc:"Unscramble letters, solve anagrams, and make words from letters with fast filters, wildcards, and Scrabble-style scores.", h1:"Unscramble Letters into Words", subtitle:"A fast, clean word finder for anagrams, word games, and puzzle solving.", mode:"unscrambler", sections:homeSections }));
  await writePage("/anagram-solver", toolPage({ url:"/anagram-solver", title:"Anagram Solver - Rearrange Letters into Words | LetterForge", desc:"Solve anagrams, rearrange letters, and find exact word matches with wildcards and helpful filters.", h1:"Anagram Solver", subtitle:"Rearrange letters into words and discover exact anagrams fast.", mode:"anagram", exact:true, sections:`<section class="content-section"><h2>How to use this tool</h2><p>Enter every letter from the clue, keep exact anagram enabled, and add wildcards when one letter is unknown.</p></section><section class="content-section"><h2>What this tool is useful for</h2><p>Use it for anagram clues, jumble puzzles, vocabulary practice, and checking whether a rearranged letter set forms a real word.</p></section><section class="content-section"><h2>Tips</h2><p>Look for common endings like ing, er, ate, and ion. Then test the remaining letters around that shape.</p></section>` }));
  await writePage("/word-finder", toolPage({ url:"/word-finder", title:"Word Finder - Find Words by Letters and Patterns | LetterForge", desc:"Find words by letters, starts with, ends with, contains, length, and Scrabble-style score.", h1:"Word Finder", subtitle:"Search words by letters, patterns, length, and score.", mode:"finder", sections:`<section class="content-section"><h2>How to use this tool</h2><p>Enter available letters or leave the box broad, then combine starts with, ends with, must include, and length filters.</p></section><section class="content-section"><h2>What this tool is useful for</h2><p>It helps with crossword-style pattern searches, word game planning, vocabulary exploration, and list building.</p></section><section class="content-section"><h2>Tips</h2><p>When you know a prefix or ending, add it before searching. Smaller candidate lists are easier to scan.</p></section>` }));
  await writePage("/wordle-solver", smallToolPage({ url:"/wordle-solver", title:"Wordle Solver - Find Five-Letter Word Candidates | LetterForge", desc:"Filter five-letter words by known positions, present letters, and excluded letters for Wordle-style puzzles.", h1:"Wordle Solver", intro:"Filter five-letter candidates with position clues, present letters, and excluded letters.", tool:wordleTool(), tips:["Use underscores for unknown positions, such as _ R A _ E, then add present and excluded letters from previous guesses.","This is useful for Wordle-style puzzles where every clue narrows a fixed five-letter answer.","Use early guesses to gather information, then switch to candidate filtering when the pattern becomes tight."] }));
  await writePage("/dictionary-checker", smallToolPage({ url:"/dictionary-checker", title:"Dictionary Checker - Check a Word in LetterForge", desc:"Check whether a word exists in the current LetterForge word list and see length and Scrabble-style score.", h1:"Dictionary Checker", intro:"Check one word against the current LetterForge word list.", tool:dictionaryTool(), tips:["Type a single English word and the checker reports whether it appears in the current list.","Use it for quick validation, score estimates, and future dictionary API integration testing.","Remember this starter word list is not an official game dictionary. Replace it when you need broader coverage."] }));
  await writePage("/random-word-generator", smallToolPage({ url:"/random-word-generator", title:"Random Word Generator - Generate Filtered English Words", desc:"Generate random English words by length, starting letters, ending letters, and count.", h1:"Random Word Generator", intro:"Generate random words for practice, prompts, warmups, and puzzle ideas.", tool:randomTool(), tips:["Choose length, prefix, suffix, and count, then generate a random set from the local list.","This is useful for vocabulary drills, writing prompts, classroom games, and puzzle design.","Use shorter lists when practicing recall and larger lists when collecting ideas."] }));
  await writePage("/word", layout({ title:"Word Details | LetterForge", desc:"View word length, score, letters, anagrams, and related word links.", url:"/word", h1:"Word Details", body:`<section class="narrow-page" data-tool="word-detail"><h1>Word Details</h1><section class="results"><p class="empty-state">Loading word details...</p></section></section>` }));
  for (const word of staticWordList) await writePage(`/word/${word}`, staticWordPage(word));
  await writePage("/5-letter-words", seoListPage({ url:"/5-letter-words", title:"5-Letter Words List and Finder | LetterForge", desc:"Browse 5-letter words and use the word finder to filter puzzle candidates.", h1:"5-Letter Words", filter:w=>w.length===5, intro:"Browse useful five-letter words for Wordle-style puzzles, anagrams, and vocabulary practice." }));
  await writePage("/6-letter-words", seoListPage({ url:"/6-letter-words", title:"6-Letter Words List and Finder | LetterForge", desc:"Browse 6-letter words and find related words by letters, prefixes, and endings.", h1:"6-Letter Words", filter:w=>w.length===6, intro:"Browse six-letter words for anagrams, word games, and study sessions." }));
  await writePage("/words-starting-with-a", seoListPage({ url:"/words-starting-with-a", title:"Words Starting With A | LetterForge", desc:"Browse words that start with A and filter by length, ending, and included letters.", h1:"Words Starting With A", filter:w=>w.startsWith("a"), intro:"Explore words beginning with A, from short puzzle plays to longer vocabulary picks." }));
  await writePage("/words-ending-with-e", seoListPage({ url:"/words-ending-with-e", title:"Words Ending With E | LetterForge", desc:"Browse words that end with E and search related word patterns.", h1:"Words Ending With E", filter:w=>w.endsWith("e"), intro:"Find words ending with E for anagrams, crosswords, and Wordle-style patterns." }));
  await writePage("/blog", blogIndex());
  for (const a of articles) await writePage(`/blog/${a.slug}`, blogArticle(a));
  await writePage("/about", basicPage({ url:"/about", title:"About LetterForge", desc:"Learn about LetterForge, a fast word finder and anagram tool for puzzle players.", h1:"About LetterForge", content:"<p>LetterForge is an original word tool website built for fast letter solving, anagram exploration, and vocabulary practice. It is independent and not affiliated with any word game brand.</p><p>The current version uses a lightweight open demo list so the interface stays fast and easy to inspect. The code is structured for replacing the list with a larger open or licensed dictionary later.</p>" }));
  await writePage("/contact", basicPage({ url:"/contact", title:"Contact LetterForge", desc:"Contact the LetterForge team for feedback, corrections, and partnership questions.", h1:"Contact", content:"<p>For feedback, dictionary corrections, partnership ideas, or accessibility notes, email hello@example.com. Replace this placeholder with your production inbox before launch.</p>" }));
  await writePage("/privacy", basicPage({ url:"/privacy", title:"Privacy Policy | LetterForge", desc:"Privacy policy for LetterForge word tools.", h1:"Privacy Policy", content:"<p>LetterForge is designed to run its core tools in your browser. This starter build does not require accounts, payments, or personal profiles.</p><p>Future analytics, ads, or affiliate tools should be added with clear consent controls and this policy should be updated before production use.</p>" }));
  await writePage("/terms", basicPage({ url:"/terms", title:"Terms of Use | LetterForge", desc:"Terms of use for LetterForge word tools.", h1:"Terms of Use", content:"<p>LetterForge is provided as a helpful word reference and puzzle-solving tool. Results are based on the current word list and may be incomplete.</p><p>Do not treat the included list as an official dictionary for tournament or paid competition decisions.</p>" }));
  await writePage("/sitemap", basicPage({ url:"/sitemap", title:"HTML Sitemap | LetterForge", desc:"Browse all main LetterForge pages.", h1:"Sitemap", content:`<ul>${["/","/anagram-solver","/word-finder","/wordle-solver","/dictionary-checker","/random-word-generator","/5-letter-words","/6-letter-words","/words-starting-with-a","/words-ending-with-e","/blog","/about","/contact","/privacy","/terms"].map(u=>`<li><a href="${u}">${u}</a></li>`).join("")}</ul>` }));

  const urls = ["/","/anagram-solver","/word-finder","/wordle-solver","/dictionary-checker","/random-word-generator","/word",...staticWordList.map((word)=>`/word/${word}`),"/5-letter-words","/6-letter-words","/words-starting-with-a","/words-ending-with-e","/blog",...articles.map(a=>`/blog/${a.slug}`),"/about","/contact","/privacy","/terms","/sitemap"];
  await writeFile(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${site}${u}</loc></url>`).join("")}</urlset>`);
  await writeFile(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`);
  await writeFile(path.join(root, "404.html"), layout({ title:"Word Details | LetterForge", desc:"View word length, score, letters, anagrams, and related word links.", url:"/404", h1:"Word Details", body:`<section class="narrow-page" data-tool="word-detail"><h1>Word Details</h1><section class="results"><p class="empty-state">Loading word details...</p></section></section>` }));
  if (customDomain) await writeFile(path.join(root, "CNAME"), `${customDomain.replace(/^https?:\/\//, "").replace(/\/$/, "")}\n`);
  await writeFile(path.join(root, "_redirects"), `/word/* /word/index.html 200\n/* /index.html 200\n`);
  await writeFile(path.join(root, "vercel.json"), JSON.stringify({ rewrites:[{ source:"/word/:word", destination:"/word/index.html" }] }, null, 2));
}

main();
