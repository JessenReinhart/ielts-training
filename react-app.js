(()=>{
  const { useState, useEffect } = React;
  const h = React.createElement;

  function Button({ children, className = "primary", onClick, disabled = false }) {
    return h("button", { className: `button ${className}`, onClick, disabled }, children);
  }

  function Nav({ route, go }) {
    const items = ["learn", "reading", "listening"];
    return h("nav", { className: "topbar" },
      h("button", { className: "brand brand-button", onClick: () => go("home") },
        h("span", { className: "brand-mark" }, "I/"),
        h("span", null, "IELTS TRAINING")
      ),
      h("div", { className: "react-nav" }, items.map((item) =>
        h("button", { key: item, className: route === item ? "active" : "", onClick: () => go(item) }, item[0].toUpperCase() + item.slice(1))
      ))
    );
  }

  function Listening({ go }) {
    const data = window.IELTS_LISTENING;
    if (!data || !data.parts || !data.parts.length) return h("main", { className: "home-shell" }, h("p", null, "Listening data unavailable."));
    const [part, setPart] = useState(0);
    const [started, setStarted] = useState(false);
    const [done, setDone] = useState(false);
    const [audioError, setAudioError] = useState("");
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const P = data.parts[part];

    useEffect(() => { setStarted(false); setDone(false); setAudioError(""); setSubmitted(false); }, [part]);

    const begin = () => {
      if (started || done) return;
      setAudioError("");
      const audio = new Audio();
      audio.preload = "auto";
      audio.onplay = () => setStarted(true);
      audio.onended = () => { setDone(true); setStarted(false); };
      audio.onerror = () => { setStarted(false); setDone(false); setAudioError("The recording file could not be loaded."); };
      audio.src = P.audioUrl;
      setStarted(true);
      audio.play().catch(() => { setStarted(false); setDone(false); setAudioError("The recording could not be started."); });
    };

    const score = P.q.reduce((total, q, i) => total + (answers[`${part}-${i}`] === q[2] ? 1 : 0), 0);

    return h("main", { className: "listening-react" },
      h(Nav, { route: "listening", go }),
      h("section", { className: "listening-hero" },
        h("div", null,
          h("p", { className: "eyebrow" }, `LISTENING LAB / PART ${String(P.number).padStart(2, "0")}`),
          h("h1", null, "Listen once.", h("br"), h("em", null, "Choose precisely.")),
          h("p", null, "Four parts, 40 questions and pre-generated recordings. Each recording can only be started once."),
          h("div", { className: "hero-actions" },
            h(Button, { onClick: begin, disabled: started || done }, done ? "✓ Recording complete" : started ? "Recording playing…" : "▶ Play recording"),
            h(Button, { className: "secondary", onClick: () => go("home") }, "Back to practice")
          )
        ),
        h("div", { className: "listening-stats" },
          h("strong", null, "40"), h("span", null, "questions"),
          h("strong", null, "04"), h("span", null, "parts"),
          h("strong", null, "1×"), h("span", null, "playback")
        )
      ),
      h("div", { className: "part-tabs" }, data.parts.map((item, i) =>
        h("button", { key: item.number, className: i === part ? "active" : "", disabled: i > part, onClick: () => i <= part && setPart(i) }, `Part ${item.number}`)
      )),
      h("div", { className: "listening-workspace" },
        h("section", { className: "listening-instructions" },
          h("p", { className: "eyebrow" }, P.context),
          h("h2", null, P.title),
          h("p", null, P.instructions),
          h("div", { className: `audio-status ${started ? "live" : audioError ? "error" : ""}` }, started ? "● Recording in progress" : done ? "✓ Recording complete" : audioError ? `⚠ ${audioError}` : "○ Recording not started"),
          h("div", { className: "listening-rule" }, "IELTS-style rule: listen carefully, predict paraphrases, and do not replay the recording.")
        ),
        h("section", { className: "listening-questions" }, P.q.map((q, i) =>
          h("article", { className: "listen-question", key: i },
            h("div", { className: "listen-q-number" }, String((P.number - 1) * 10 + i + 1).padStart(2, "0")),
            h("div", null,
              h("h3", null, q[0]),
              h("div", { className: "listen-options" }, q[1].map((option, j) =>
                h("button", {
                  key: j,
                  className: `listen-option ${answers[`${part}-${i}`] === j ? "selected" : ""} ${submitted && j === q[2] ? "correct" : ""}`,
                  onClick: () => !submitted && setAnswers({ ...answers, [`${part}-${i}`]: j }),
                  disabled: !started || submitted
                }, h("b", null, String.fromCharCode(65 + j)), option)
              ))
            )
          )
        ))
      ),
      h("div", { className: "listening-footer" },
        h("span", null, `${Object.keys(answers).filter((key) => key.startsWith(`${part}-`)).length}/10 answered`),
        submitted ? h("strong", null, `Score ${score}/10`) : h(Button, { onClick: () => done && setSubmitted(true), disabled: !done }, "Check part"),
        part < data.parts.length - 1 && !submitted ? h(Button, { className: "secondary", onClick: () => done && setPart(part + 1), disabled: !done }, "Next part →") : null
      )
    );
  }

  function Home({ go }) {
    const data = window.IELTS_DATA || {};
    const passages = data.passages || [];
    return h("main", { className: "home-shell" },
      h(Nav, { route: "home", go }),
      h("section", { className: "hero reveal" },
        h("div", null,
          h("p", { className: "eyebrow" }, "IELTS TRAINING / ACADEMIC"),
          h("h1", null, "Read closely.", h("br"), h("em", null, "Choose precisely.")),
          h("p", { className: "hero-deck" }, "Original IELTS-style practice with a dedicated learning centre and a full listening lab. Build the skill, then test it."),
          h("div", { className: "hero-actions" }, h(Button, { onClick: () => go("reading") }, "Start Reading →"), h(Button, { className: "secondary", onClick: () => go("learn") }, "Learn the test"))
        ),
        h("aside", { className: "hero-scorecard" }, h("span", { className: "mono" }, "TRAINING CENTRE"), h("strong", null, "100"), h("span", { className: "score-label" }, "reading questions"),
          h("div", { className: "scorecard-grid" }, h("div", null, h("span", null, "40"), h("small", null, "listening")), h("div", null, h("span", null, "08"), h("small", null, "passages")), h("div", null, h("span", null, "04"), h("small", null, "parts")))
        )
      ),
      h("section", { className: "listening-feature" },
        h("div", { className: "listening-feature-copy" }, h("p", { className: "eyebrow" }, "LISTENING LAB / TEST 01"), h("h2", null, "Listen once.", h("br"), h("em", null, "Choose precisely.")), h("p", null, "Four parts, 40 original questions and pre-generated recordings. No replay once a part starts."), h(Button, { onClick: () => go("listening") }, "Start Listening Test →")),
        h("div", { className: "listening-feature-meta" }, [["40", "questions"], ["04", "parts"], ["1×", "playback"], ["MCQ", "format"]].map(([value, label]) => h("div", { key: label }, h("strong", null, value), h("span", null, label))))
      ),
      h("section", { className: "bank", id: "bank" },
        h("div", { className: "section-head" }, h("div", null, h("p", { className: "eyebrow" }, "PRACTICE BANK"), h("h2", null, "Eight readings. ", h("em", null, "One hundred decisions.")))),
        h("div", { className: "passage-grid" }, passages.map((p) => h("article", { className: "passage-card", key: p.id, onClick: () => go("reading") }, h("div", { className: "card-index mono" }, String(p.number).padStart(2, "0")), h("div", { className: "card-body" }, h("p", { className: "card-kicker" }, p.kicker), h("h3", null, p.title)), h("div", { className: "card-arrow" }, "→"))))
      )
    );
  }

  function Learn({ go }) {
    const lessons = [["01", "IELTS at a glance", "Understand the four skills, timing and scoring."], ["02", "Listening", "Question types, distractors, prediction and paraphrase."], ["03", "Reading", "Evidence, paraphrase, headings and completion tasks."], ["04", "Writing", "Task 1, Task 2 and the four assessment criteria."], ["05", "Speaking", "Parts 1–3, fluency, vocabulary, grammar and pronunciation."], ["06", "Scoring", "How raw scores become IELTS bands."], ["07", "Test strategy", "Turn mistakes into deliberate practice."], ["08", "Study plan", "A practical six-week progression."]];
    return h("main", { className: "home-shell" }, h(Nav, { route: "learn", go }), h("section", { className: "learn-hero" }, h("p", { className: "eyebrow" }, "LEARNING CENTRE"), h("h1", null, "Understand the test.", h("br"), h("em", null, "Then train the skill.")), h("p", null, "A structured curriculum covering IELTS Academic format, task types, scoring and strategy.")), h("section", { className: "lesson-grid" }, lessons.map(([number, title, description]) => h("article", { className: "lesson-card", key: number }, h("span", { className: "mono" }, number), h("h2", null, title), h("p", null, description), h("button", { onClick: () => go(title === "Listening" ? "listening" : "reading") }, "Open lesson →")))));
  }

  function Reading({ go }) {
    const data = window.IELTS_DATA;
    const passage = data && data.passages && data.passages[0];
    if (!passage) return h("main", { className: "home-shell" }, h(Nav, { route: "reading", go }), h("p", null, "Reading data unavailable."));
    const [question, setQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const q = passage.questions[question];
    return h("main", { className: "practice-shell" }, h(Nav, { route: "reading", go }), h("section", { className: "reading-react-head" }, h("p", { className: "eyebrow" }, `READING / PASSAGE ${passage.number}`), h("h1", null, passage.title), h("p", null, `${passage.questions.length} questions · ${passage.difficulty} · ~${passage.estimatedMinutes} min`)), h("section", { className: "workspace" }, h("article", { className: "reading-pane" }, h("div", { className: "pane-label" }, "READING PASSAGE"), h("div", { className: "passage-copy" }, passage.text.split("\n\n").map((text, i) => h("p", { key: i }, text)))), h("aside", { className: "question-pane" }, h("div", { className: "question-topline" }, h("span", { className: "mono" }, `QUESTION ${question + 1} / ${passage.questions.length}`)), h("div", { className: "question-card" }, h("h2", null, q.prompt), h("div", { className: "options" }, q.options.map((option, i) => h("button", { key: i, className: `option ${answers[q.id] === i ? "selected" : ""} ${submitted && i === q.answer ? "correct" : ""}`, onClick: () => !submitted && setAnswers({ ...answers, [q.id]: i }), disabled: submitted }, h("span", { className: "option-letter" }, String.fromCharCode(65 + i)), h("span", null, option)))), submitted ? h("div", { className: "explanation" }, h("span", { className: "explanation-label" }, answers[q.id] === q.answer ? "Correct" : "Answer"), h("p", null, q.explanation)) : null), h("div", { className: "question-controls" }, h(Button, { className: "secondary", onClick: () => setQuestion(Math.max(0, question - 1)), disabled: question === 0 }, "← Previous"), h(Button, { onClick: () => question < passage.questions.length - 1 ? setQuestion(question + 1) : setSubmitted(true) }, question < passage.questions.length - 1 ? "Next →" : "Reveal answer")))));
  }

  function App() {
    const initial = location.hash === "#listening-test" ? "listening" : location.hash === "#learn" ? "learn" : location.hash === "#reading" ? "reading" : "home";
    const [route, setRoute] = useState(initial);
    useEffect(() => { const onHash = () => { const hash = location.hash; setRoute(hash === "#listening-test" ? "listening" : hash === "#learn" ? "learn" : hash === "#reading" ? "reading" : "home"); }; window.addEventListener("hashchange", onHash); return () => window.removeEventListener("hashchange", onHash); }, []);
    const go = (next) => { setRoute(next); history.pushState(null, "", next === "listening" ? "#listening-test" : next === "home" ? "#" : `#${next}`); };
    if (route === "listening") return h(Listening, { go });
    if (route === "learn") return h(Learn, { go });
    if (route === "reading") return h(Reading, { go });
    return h(Home, { go });
  }

  ReactDOM.createRoot(document.getElementById("app")).render(h(App));
})();