const words = await fetch("/data/words.json").then((response) => response.json());

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

function findWords(options) {
  const input = clean(options.letters, true);
  const letters = input.replace(/[?*]/g, "");
  const wildcards = (input.match(/[?*]/g) || []).length;
  const starts = clean(options.startsWith);
  const ends = clean(options.endsWith);
  const must = clean(options.mustInclude);
  const total = letters.length + wildcards;
  let list = words.filter((word) => {
    if (total && word.length > total) return false;
    if (options.exact && word.length !== total) return false;
    if (options.length === "7+" && word.length < 7) return false;
    if (options.length && options.length !== "7+" && word.length !== Number(options.length)) return false;
    if (starts && !word.startsWith(starts)) return false;
    if (ends && !word.endsWith(ends)) return false;
    if (must && ![...must].every((ch) => word.includes(ch))) return false;
    return total ? canBuild(word, letters, wildcards) : true;
  });
  list = list.map((word) => ({ word, length: word.length, score: scoreWord(word), definition: "Definition placeholder: add a licensed dictionary or API for meanings." }));
  list.sort((a, b) => {
    if (options.sortBy === "alpha") return a.word.localeCompare(b.word);
    if (options.sortBy === "score") return b.score - a.score || b.length - a.length || a.word.localeCompare(b.word);
    return b.length - a.length || b.score - a.score || a.word.localeCompare(b.word);
  });
  return list;
}

function grouped(results) {
  return results.reduce((map, item) => ((map[item.length] ||= []).push(item), map), {});
}

function resultCard(item) {
  return `<article class="word-pill"><a href="/word/${item.word}">${item.word}</a><span>${item.length} letters</span><strong>${item.score} pts</strong><p>${item.definition}</p><button type="button" data-copy="${item.word}">Copy</button></article>`;
}

function renderResults(container, results) {
  if (!results.length) {
    container.innerHTML = `<h2>Results</h2><p class="empty-state">No words found. Try fewer filters, add a wildcard, or choose a shorter length.</p>`;
    return;
  }
  const groups = grouped(results);
  container.innerHTML = `<h2>${results.length} words found</h2>${Object.keys(groups).sort((a,b)=>b-a).map((len) => {
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
    const pattern = data.pattern.toLowerCase().replace(/\s/g, "").padEnd(5, "_").slice(0, 5);
    const present = clean(data.present);
    const excluded = clean(data.excluded);
    const list = words.filter((word) => word.length === 5)
      .filter((word) => [...pattern].every((ch, i) => ch === "_" || ch === word[i]))
      .filter((word) => [...present].every((ch) => word.includes(ch)))
      .filter((word) => ![...excluded].some((ch) => word.includes(ch)))
      .map((word) => ({ word, length: 5, score: scoreWord(word), definition: "Candidate five-letter word from the current list." }));
    renderResults(results, list);
  });
  tool.querySelector("[data-action='clear']")?.addEventListener("click", () => {
    form.reset();
    results.innerHTML = `<h2>Candidates</h2><p class="empty-state">Add a pattern or letter clues to filter five-letter words.</p>`;
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
document.querySelectorAll("[data-tool='dictionary']").forEach(setupDictionary);
document.querySelectorAll("[data-tool='random']").forEach(setupRandom);
document.querySelectorAll("[data-tool='word-detail']").forEach(setupWordDetail);
