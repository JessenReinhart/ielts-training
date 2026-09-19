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

    const speechRef = useRef(0);

    useEffect(() => {
      speechRef.current++;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setStarted(false); setDone(false); setAudioError(''); setSubmitted(false);
    }, [part]);

    const speakFallback = () => {
      if (!('speechSynthesis' in window)) {
        setStarted(false); setDone(false);
        setAudioError('The recording file is unavailable and browser speech is not supported.');
        return;
      }
      const items = (window.IELTS_LISTENING_AUDIO?.[P.number] || []).map(item => String(item.text || ''));
      if (!items.length) {
        setStarted(false); setDone(false);
        setAudioError('The recording asset is missing.');
        return;
      }
      const token = ++speechRef.current;
      window.speechSynthesis.cancel();
      let index = 0;
      const next = () => {
        if (token !== speechRef.current) return;
        if (index >= items.length) { setStarted(false); setDone(true); return; }
        const utterance = new SpeechSynthesisUtterance(items[index++]);
        utterance.lang = 'en-US';
        utterance.rate = 0.94;
        utterance.onstart = () => setStarted(true);
        utterance.onend = next;
        utterance.onerror = () => { setStarted(false); setDone(false); setAudioError('Browser voice playback failed.'); };
        window.speechSynthesis.speak(utterance);
      };
      setStarted(true);
      next();
    };

    const begin = () => {
      if (started || done) return;
      setAudioError('');
      const audio = new Audio(P.audioUrl);
      audio.preload = 'auto';
      audio.onplay = () => setStarted(true);
      audio.onended = () => { setDone(true); setStarted(false); };
      audio.onerror = () => speakFallback();
      audio.src = P.audioUrl;
      setStarted(true);
      audio.play().catch(() => speakFallback());
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
    const [pid, setPid] = useState(data?.passages?.[0]?.id);
    const [question, setQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [reviewQuestion, setReviewQuestion] = useState(false);
    const passage = data?.passages?.find(p => p.id === pid) || data?.passages?.[0];

    useEffect(() => {
      setQuestion(0);
      setAnswers({});
      setSubmitted(false);
      setReviewQuestion(false);
    }, [pid]);

    if (!passage) {
      return h("main", { className: "home-shell" },
        h(Nav, { route: "reading", go }),
        h("p", null, "Reading data unavailable.")
      );
    }

    const score = passage.questions.reduce(
      (total, item) => total + (answers[item.id] === item.answer ? 1 : 0),
      0
    );
    const answered = Object.keys(answers).length;
    const unanswered = passage.questions.length - answered;
    const percentage = Math.round((score / passage.questions.length) * 100);
    const q = passage.questions[question];

    const submitPassage = () => {
      setSubmitted(true);
      setReviewQuestion(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const answerSheet = h("section", { className: "reading-result-list" },
      h("div", { className: "section-head compact-head" },
        h("div", null,
          h("p", { className: "eyebrow" }, "ANSWER KEY"),
          h("h2", null, "Review every decision.")
        ),
        h(Button, {
          className: "secondary",
          onClick: () => { setSubmitted(false); setReviewQuestion(true); setQuestion(0); }
        }, "Review question by question →")
      ),
      h("div", { className: "reading-answer-sheet" },
        passage.questions.map((item, i) => {
          const selected = answers[item.id];
          const ok = selected === item.answer;
          return h("article", {
            key: item.id,
            className: `reading-answer-item ${ok ? "ok" : "miss"}`
          },
            h("button", {
              className: "reading-answer-row",
              onClick: () => {
                setSubmitted(false);
                setReviewQuestion(true);
                setQuestion(i);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            },
              h("span", { className: "reading-answer-num" }, String(i + 1).padStart(2, "0")),
              h("span", { className: "reading-answer-prompt" }, item.prompt),
              h("span", { className: "reading-answer-selected" },
                selected === undefined ? "—" : String.fromCharCode(65 + selected)
              ),
              h("span", { className: "reading-answer-correct" },
                `Correct: ${String.fromCharCode(65 + item.answer)}`
              )
            ),
            h("div", { className: "reading-answer-explanation" },
              h("span", { className: "explanation-label" },
                ok ? "Why this is correct" : "Why you missed it"
              ),
              h("p", null, item.explanation)
            )
          );
        })
      )
    );

    if (submitted) {
      return h("main", { className: "reading-result-react" },
        h(Nav, { route: "reading", go }),
        h("section", { className: "reading-result-hero" },
          h("p", { className: "eyebrow" }, "READING / PRACTICE COMPLETE"),
          h("h1", null, score, h("span", null, `/${passage.questions.length}`)),
          h("p", null,
            `${percentage}% accuracy. ${score} correct, ${passage.questions.length - score} missed, ${unanswered} unanswered.`
          ),
          h("div", { className: "reading-result-actions" },
            h(Button, {
              onClick: () => { setSubmitted(false); setReviewQuestion(true); setQuestion(0); }
            }, "Review answers →"),
            h(Button, { className: "secondary", onClick: () => {
              setPid(data.passages[0]?.id);
              setSubmitted(false);
              setAnswers({});
              setQuestion(0);
            }}, "Try another passage")
          )
        ),
        h("section", { className: "reading-result-breakdown" },
          h("div", null, h("span", null, "ACCURACY"), h("strong", null, `${percentage}%`)),
          h("div", null, h("span", null, "CORRECT"), h("strong", null, String(score))),
          h("div", null, h("span", null, "MISSED"), h("strong", null, String(passage.questions.length - score))),
          h("div", null, h("span", null, "ANSWERED"), h("strong", null, String(answered)))
        ),
        answerSheet
      );
    }

    const review = reviewQuestion;
    return h("main", { className: "practice-shell" },
      h(Nav, { route: "reading", go }),
      h("section", { className: "reading-react-head" },
        h("p", { className: "eyebrow" }, `READING / PASSAGE ${passage.number}`),
        h("h1", null, passage.title),
        h("p", null, `${passage.questions.length} questions · ${passage.difficulty} · ~${passage.estimatedMinutes} min`),
        h("div", { className: "reading-select" },
          data.passages.map(item =>
            h("button", {
              key: item.id,
              className: item.id === passage.id ? "active" : "",
              onClick: () => setPid(item.id)
            }, `0${item.number}`)
          )
        )
      ),
      h("section", { className: "workspace" },
        h("article", { className: "reading-pane" },
          h("div", { className: "pane-label" }, "READING PASSAGE"),
          h("div", { className: "passage-copy" },
            passage.text.split("\\n\\n").map((text, i) => h("p", { key: i }, text))
          )
        ),
        h("aside", { className: "question-pane" },
          h("div", { className: "question-topline" },
            h("span", { className: "mono" }, `QUESTION ${question + 1} / ${passage.questions.length}`),
            review ? h("span", { className: "mono" }, "REVIEW MODE") : null
          ),
          h("div", { className: "question-card" },
            h("h2", null, q.prompt),
            h("div", { className: "options" },
              q.options.map((option, i) =>
                h("button", {
                  key: i,
                  className: `option ${answers[q.id] === i ? "selected" : ""} ${review && i === q.answer ? "correct" : ""} ${review && answers[q.id] === i && i !== q.answer ? "wrong" : ""}`,
                  onClick: () => !review && setAnswers({ ...answers, [q.id]: i }),
                  disabled: review
                },
                  h("span", { className: "option-letter" }, String.fromCharCode(65 + i)),
                  h("span", null, option)
                )
              )
            ),
            review ? h("div", {
              className: `explanation ${answers[q.id] === q.answer ? "" : "is-wrong"}`
            },
              h("span", { className: "explanation-label" },
                answers[q.id] === q.answer ? "Correct" : `Correct answer: ${String.fromCharCode(65 + q.answer)}`
              ),
              h("p", null, q.explanation)
            ) : null
          ),
          h("div", { className: "question-controls" },
            review
              ? h(Button, { className: "secondary", onClick: () => setSubmitted(true) }, "← Back to score")
              : h(Button, {
                  className: "secondary",
                  onClick: () => setQuestion(Math.max(0, question - 1)),
                  disabled: question === 0
                }, "← Previous"),
            h(Button, {
              onClick: () => {
                if (question < passage.questions.length - 1) {
                  setQuestion(question + 1);
                } else if (review) {
                  setSubmitted(true);
                } else {
                  submitPassage();
                }
              }
            }, question < passage.questions.length - 1 ? "Next →" : review ? "Back to score →" : "Submit passage →")
          ),
          !review ? h("div", { className: "reading-answer-progress" },
            h("span", null, `${answered}/${passage.questions.length} answered`),
            h("span", null, "Submit when you are ready")
          ) : null,
          h("div", { className: "navigator" },
            passage.questions.map((item, i) =>
              h("button", {
                key: item.id,
                className: i === question ? "current" : answers[item.id] !== undefined ? "answered" : "",
                onClick: () => setQuestion(i)
              }, i + 1)
            )
          )
        )
      )
    );
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