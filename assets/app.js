const words = await fetch("/data/words.json").then((response) => response.json());
const MAX_RESULTS = 1200;
const wordsByLength = words.reduce((map, word) => {
  (map[word.length] ||= []).push(word);
  return map;
}, {});

const scores = { a:1,e:1,i:1,o:1,u:1,l:1,n:1,s:1,t:1,r:1,d:2,g:2,b:3,c:3,m:3,p:3,f:4,h:4,v:4,w:4,y:4,k:5,j:8,x:8,q:10,z:10 };

const clean = (value = "", wild = false) => value.toLowerCase().replace(wild ? /[^a-z?*]/g : /[^a-z]/g, "");
const scoreWord = (word) => [...word].reduce((sum, ch) => sum + (scores[ch] || 0), 0);
const freq = (text) => [...text].reduce((map, ch) => ((map[ch] = (map[ch] || 0) + 1), map), {});

function canBuild(word, letters, wildcardCount) {
  const have = freq(letters);
  let blanks = wildcardCount;
  for (const [ch, count] of Object.entries(freq(word))) {
    const missing = Math.max(0, count - (have[ch] || 0));
    blanks -= missing;
    if (blanks < 0) return false;
  }
  return true;
}

function wildcardUseCount(word, letters) {
  const have = freq(letters);
  let used = 0;
  for (const [ch, count] of Object.entries(freq(word))) {
    used += Math.max(0, count - (have[ch] || 0));
  }
  return used;
}

function findWords(options) {
  const input = clean(options.letters, true);
  const letters = input.replace(/[?*]/g, "");
  const wildcards = (input.match(/[?*]/g) || []).length;
  const starts = clean(options.startsWith);
  const ends = clean(options.endsWith);
  const must = clean(options.mustInclude);
  const total = letters.length + wildcards;
  if (!total && !starts && !ends && !must && !options.length) return [];
  let candidates = words;
  if (options.length && options.length !== "7+") {
    candidates = wordsByLength[Number(options.length)] || [];
  } else if (total) {
    candidates = [];
    const max = options.exact ? total : Math.min(total, 10);
    const min = options.exact ? total : 2;
    for (let len = min; len <= max; len += 1) candidates.push(...(wordsByLength[len] || []));
  }
  let list = candidates.filter((word) => {
    if (total && word.length > total) return false;
    if (options.exact && word.length !== total) return false;
    if (options.length === "7+" && word.length < 7) return false;
    if (options.length && options.length !== "7+" && word.length !== Number(options.length)) return false;
    if (starts && !word.startsWith(starts)) return false;
    if (ends && !word.endsWith(ends)) return false;
    if (must && ![...must].every((ch) => word.includes(ch))) return false;
    return total ? canBuild(word, letters, wildcards) : true;
  });
  list = list.map((word) => ({ word, length: word.length, score: scoreWord(word), wildcardUses: wildcardUseCount(word, letters), definition: "Definition placeholder: add a licensed dictionary or API for meanings." }));
  list.sort((a, b) => {
    if (options.sortBy === "alpha") return a.word.localeCompare(b.word);
    if (options.sortBy === "score") return b.score - a.score || b.length - a.length || a.word.localeCompare(b.word);
    return b.length - a.length || b.score - a.score || a.word.localeCompare(b.word);
  });
  const truncated = list.length > MAX_RESULTS;
  list = list.slice(0, MAX_RESULTS);
  list.truncated = truncated;
  list.queryTotal = total;
  list.hasWildcards = wildcards > 0;
  return list;
}

function grouped(results) {
  return results.reduce((map, item) => ((map[item.length] ||= []).push(item), map), {});
}

function resultCard(item) {
  return `<article class="word-pill"><a href="/word/${item.word}">${item.word}</a><span>${item.length} letters</span><strong>${item.score} pts</strong><p>${item.definition}</p><button type="button" data-copy="${item.word}">Copy</button></article>`;
}

function miniWord(item) {
  return `<a href="/word/${item.word}" title="${item.score} points">${item.word}<span>${item.score}</span></a>`;
}

function resultSpotlight(title, items) {
  if (!items.length) return "";
  return `<section class="result-spotlight"><h3>${title}</h3><div class="mini-word-list">${items.slice(0, 14).map(miniWord).join("")}</div></section>`;
}

function renderResultInsights(results) {
  const best = [...results].sort((a, b) => b.length - a.length || b.score - a.score || a.word.localeCompare(b.word));
  const scoring = [...results].sort((a, b) => b.score - a.score || b.length - a.length || a.word.localeCompare(b.word));
  const short = results.filter((item) => item.length <= 4).sort((a, b) => a.length - b.length || a.word.localeCompare(b.word));
  const allLetters = results.queryTotal ? results.filter((item) => item.length === results.queryTotal) : [];
  const blanks = results.hasWildcards ? results.filter((item) => item.wildcardUses > 0).sort((a, b) => b.score - a.score || a.word.localeCompare(b.word)) : [];
  return `<section class="result-insights">
    <h2>Word Ideas</h2>
    ${resultSpotlight("Best words from these letters", best)}
    ${resultSpotlight("Highest scoring words", scoring)}
    ${resultSpotlight("Short words", short)}
    ${resultSpotlight("Words using all letters", allLetters)}
    ${resultSpotlight("Words with blanks", blanks)}
  </section>`;
}

function renderResults(container, results) {
  if (!results.length) {
    container.innerHTML = `<h2>Results</h2><p class="empty-state">No words found. Try fewer filters, add a wildcard, or choose a shorter length.</p>`;
    return;
  }
  const groups = grouped(results);
  const capped = results.truncated ? `<p class="empty-state">Showing the first ${MAX_RESULTS} matches. Add a length, prefix, ending, or required letter to narrow the list.</p>` : "";
  container.innerHTML = `${renderResultInsights(results)}<h2>${results.length}${results.truncated ? "+" : ""} words found</h2>${capped}${Object.keys(groups).sort((a,b)=>b-a).map((len) => {
    const visible = groups[len].slice(0, 24);
    const hidden = groups[len].slice(24);
    return `<section class="result-group"><h3>${len}-letter words</h3><div class="result-grid">${visible.map(resultCard).join("")}${hidden.map((item)=>`<span class="hidden-result">${resultCard(item)}</span>`).join("")}</div>${hidden.length ? `<button type="button" class="show-more">Show more</button>` : ""}</section>`;
  }).join("")}`;
}

function setupWordTool(tool) {
  const form = tool.querySelector(".word-form");
  const results = tool.querySelector(".results");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.exact = form.exact.checked;
    data.length = form.length.value;
    renderResults(results, findWords(data));
  });
  tool.querySelector("[data-action='clear']")?.addEventListener("click", () => {
    form.reset();
    results.innerHTML = `<h2>Results</h2><p class="empty-state">Enter letters above to make words from your rack.</p>`;
  });
  tool.querySelectorAll("[data-example]").forEach((button) => button.addEventListener("click", () => {
    form.letters.value = button.dataset.example;
    form.requestSubmit();
  }));
}

function setupWordle(tool) {
  const form = tool.querySelector(".wordle-form");
  const results = tool.querySelector(".results");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const grid = Array.from({ length: 5 }, (_, i) => ({ letter: clean(data[`cell${i}`]).slice(0, 1), state: data[`state${i}`] || "unknown" }));
    const gridPattern = grid.map((cell) => cell.state === "green" && cell.letter ? cell.letter : "_").join("");
    const typedPattern = String(data.pattern || "").toLowerCase().replace(/\s/g, "").replace(/[^a-z_?]/g, "_").padEnd(5, "_").slice(0, 5).replace(/\?/g, "_");
    const pattern = [...gridPattern].map((ch, i) => ch !== "_" ? ch : typedPattern[i]).join("");
    const yellowPositions = grid.map((cell, i) => cell.state === "yellow" && cell.letter ? [cell.letter, i] : null).filter(Boolean);
    const present = clean(String(data.present || "") + grid.filter((cell) => cell.state === "yellow").map((cell) => cell.letter).join(""));
    const excluded = clean(String(data.excluded || "") + grid.filter((cell) => cell.state === "gray").map((cell) => cell.letter).join(""));
    const candidates = (wordsByLength[5] || [])
      .filter((word) => [...pattern].every((ch, i) => ch === "_" || ch === word[i]))
      .filter((word) => yellowPositions.every(([letter, index]) => word.includes(letter) && word[index] !== letter))
      .filter((word) => [...present].every((ch) => word.includes(ch)))
      .filter((word) => ![...excluded].some((ch) => word.includes(ch)));
    const list = candidates.map((word) => ({ word, length: 5, score: scoreWord(word), definition: "Candidate five-letter word from the current list." }));
    list.queryTotal = 5;
    const recommendationPool = form.hardMode.checked ? candidates : (wordsByLength[5] || []).filter((word) => ![...excluded].some((ch) => word.includes(ch)));
    const recommended = recommendGuesses(candidates, recommendationPool).slice(0, 8);
    const recommendationHtml = recommended.length ? `<section class="result-spotlight"><h3>Recommended next guess</h3><div class="mini-word-list">${recommended.map((word) => miniWord({ word, score: scoreWord(word) })).join("")}</div></section>` : "";
    renderResults(results, list);
    results.insertAdjacentHTML("afterbegin", recommendationHtml);
  });
  tool.querySelector("[data-action='clear']")?.addEventListener("click", () => {
    form.reset();
    results.innerHTML = `<h2>Candidates</h2><p class="empty-state">Add green, yellow, gray, or pattern clues to filter five-letter words.</p>`;
  });
}

function recommendGuesses(candidates, pool) {
  const base = candidates.length ? candidates : (wordsByLength[5] || []);
  const letterWeight = {};
  base.forEach((word) => [...new Set(word)].forEach((letter) => letterWeight[letter] = (letterWeight[letter] || 0) + 1));
  return [...pool].sort((a, b) => guessValue(b, letterWeight) - guessValue(a, letterWeight) || a.localeCompare(b));
}

function guessValue(word, letterWeight) {
  return [...new Set(word)].reduce((sum, letter) => sum + (letterWeight[letter] || 0), 0);
}

function setupCrossword(tool) {
  const form = tool.querySelector(".crossword-form");
  const results = tool.querySelector(".results");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const pattern = String(data.pattern || "").toLowerCase().replace(/\s/g, "").replace(/_/g, "?").replace(/[^a-z?]/g, "");
    const must = clean(data.mustInclude);
    const excluded = clean(data.excluded);
    if (!pattern) {
      results.innerHTML = `<h2>Matches</h2><p class="empty-state">Enter a pattern such as c?a?e or __a_e.</p>`;
      return;
    }
    const list = (wordsByLength[pattern.length] || [])
      .filter((word) => [...pattern].every((ch, i) => ch === "?" || ch === word[i]))
      .filter((word) => [...must].every((ch) => word.includes(ch)))
      .filter((word) => ![...excluded].some((ch) => word.includes(ch)))
      .slice(0, MAX_RESULTS)
      .map((word) => ({ word, length: word.length, score: scoreWord(word), definition: "Crossword pattern match from the current word list." }));
    list.queryTotal = pattern.length;
    renderResults(results, list);
  });
  tool.querySelector("[data-action='clear']")?.addEventListener("click", () => {
    form.reset();
    results.innerHTML = `<h2>Matches</h2><p class="empty-state">Enter a pattern with ? or _ for unknown letters.</p>`;
  });
}

function setupDictionary(tool) {
  const form = tool.querySelector(".dictionary-form");
  const results = tool.querySelector(".results");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const word = clean(new FormData(form).get("word"));
    const exists = words.includes(word);
    results.innerHTML = `<h2>${word || "Word"} lookup</h2><article class="lookup-card"><strong>${exists ? "Found in current list" : "Not found in current list"}</strong><p>Length: ${word.length || 0}</p><p>Scrabble-style score: ${scoreWord(word)}</p><p>Definition placeholder: connect a dictionary API or licensed data source for real definitions.</p></article>`;
  });
}

function setupRandom(tool) {
  const form = tool.querySelector(".random-form");
  const results = tool.querySelector(".results");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const starts = clean(data.startsWith);
    const ends = clean(data.endsWith);
    const count = Math.min(Math.max(Number(data.count) || 10, 1), 50);
    const pool = words.filter((word) => (!data.length || word.length === Number(data.length)) && (!starts || word.startsWith(starts)) && (!ends || word.endsWith(ends)));
    const list = [...pool].sort(() => Math.random() - 0.5).slice(0, count).map((word) => ({ word, length: word.length, score: scoreWord(word), definition: "Random word from the current list." }));
    renderResults(results, list);
  });
}

function setupDaily(tool) {
  const kind = tool.dataset.dailyKind || "word";
  const results = tool.querySelector(".results");
  const render = (offset = 0) => {
    const pool = kind === "five" ? (wordsByLength[5] || []) : words.filter((word) => word.length >= 4 && word.length <= 8);
    const picked = pool[dailyIndex(pool.length, offset)];
    if (kind === "anagram") {
      const scrambled = scrambleWord(picked);
      const letters = [...picked].sort().join("");
      const answers = words.filter((word) => word.length === picked.length && [...word].sort().join("") === letters).slice(0, 20);
      results.innerHTML = `<h2>Daily anagram</h2><article class="lookup-card"><strong>${scrambled.toUpperCase()}</strong><p>Unscramble these ${picked.length} letters.</p><p>Scrabble-style score: ${scoreWord(picked)}</p></article>${relatedSet("Possible answers", answers)}<p><a href="/anagram-solver">Open Anagram Solver</a></p>`;
      return;
    }
    if (kind === "five") {
      results.innerHTML = `<h2>Daily 5-letter challenge</h2><article class="lookup-card"><strong>${"_ ".repeat(5).trim()}</strong><p>Hint: starts with ${picked[0].toUpperCase()} and ends with ${picked[picked.length - 1].toUpperCase()}.</p><p>Letters include: ${[...new Set(picked)].slice(0, 3).join(", ")}</p><p>Answer: <a href="/word/${picked}">${picked}</a></p><p>Scrabble-style score: ${scoreWord(picked)}</p></article><p><a href="/wordle-solver">Open Wordle Solver</a></p>`;
      return;
    }
    results.innerHTML = `<h2>Word of the day</h2><article class="lookup-card"><strong><a href="/word/${picked}">${picked}</a></strong><p>Length: ${picked.length}</p><p>Letters: ${[...picked].join(" ")}</p><p>Scrabble-style score: ${scoreWord(picked)}</p><p>Use it as a writing prompt, vocabulary warmup, or word game practice word.</p></article><p><a href="/word-finder">Find related words</a> · <a href="/random-word-generator">Generate random words</a></p>`;
  };
  render(0);
  tool.querySelector("[data-action='new-daily']")?.addEventListener("click", () => render(Math.floor(Math.random() * 100000)));
}

function dailyIndex(length, offset = 0) {
  const stamp = new Date().toISOString().slice(0, 10);
  let hash = offset;
  for (const ch of stamp) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return length ? hash % length : 0;
}

function scrambleWord(word) {
  const letters = [...word];
  for (let i = letters.length - 1; i > 0; i -= 1) {
    const j = (i * 7 + word.charCodeAt(i % word.length)) % (i + 1);
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const scrambled = letters.join("");
  return scrambled === word ? [...word].reverse().join("") : scrambled;
}

function setupWordDetail(tool) {
  const raw = decodeURIComponent(location.pathname.split("/").filter(Boolean).pop() || "");
  const word = clean(raw);
  const results = tool.querySelector(".results");
  if (!word) return;
  const exists = words.includes(word);
  const sortedLetters = [...word].sort().join("");
  const anagrams = words.filter((item) => item !== word && item.length === word.length && [...item].sort().join("") === sortedLetters).slice(0, 20);
  const start = word.slice(0, 2);
  const end = word.slice(-2);
  const starting = words.filter((item) => item.startsWith(start) && item !== word).slice(0, 20);
  const ending = words.filter((item) => item.endsWith(end) && item !== word).slice(0, 20);
  document.title = `${word} - Word Details, Score and Anagrams | LetterForge`;
  tool.querySelector("h1").textContent = word;
  results.innerHTML = `<article class="lookup-card"><strong>${exists ? "Found in current list" : "Not found in current list"}</strong><p>Length: ${word.length}</p><p>Letters: ${[...word].join(" · ")}</p><p>Scrabble-style score: ${scoreWord(word)}</p><p>Definition placeholder: no authoritative definition is bundled in this starter build.</p></article>${relatedSet("Anagrams", anagrams)}${relatedSet(`Words starting with ${start}`, starting)}${relatedSet(`Words ending with ${end}`, ending)}<p><a href="/anagram-solver">Solve another anagram</a> · <a href="/word-finder">Open word finder</a></p>`;
}

function relatedSet(title, list) {
  return `<section class="content-section"><h2>${title}</h2><div class="word-list">${list.length ? list.map((w)=>`<a href="/word/${w}">${w}</a>`).join("") : "<p>No related words in the current list.</p>"}</div></section>`;
}

document.querySelector(".menu-toggle")?.addEventListener("click", (buttonEvent) => {
  const button = buttonEvent.currentTarget;
  const nav = document.querySelector("#site-nav");
  const open = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!open));
  nav.classList.toggle("is-open", !open);
});

document.addEventListener("click", async (event) => {
  const copy = event.target.closest("[data-copy]");
  if (copy) {
    await navigator.clipboard?.writeText(copy.dataset.copy);
    copy.textContent = "Copied";
  }
  const more = event.target.closest(".show-more");
  if (more) {
    more.parentElement.querySelectorAll(".hidden-result").forEach((item) => item.classList.remove("hidden-result"));
    more.remove();
  }
});

document.querySelectorAll("[data-tool='unscrambler'],[data-tool='anagram'],[data-tool='finder']").forEach(setupWordTool);
document.querySelectorAll("[data-tool='wordle']").forEach(setupWordle);
document.querySelectorAll("[data-tool='crossword']").forEach(setupCrossword);
document.querySelectorAll("[data-tool='dictionary']").forEach(setupDictionary);
document.querySelectorAll("[data-tool='random']").forEach(setupRandom);
document.querySelectorAll("[data-tool='daily']").forEach(setupDaily);
document.querySelectorAll("[data-tool='word-detail']").forEach(setupWordDetail);
