(() => {
  const topics = [
    {id:'overview', label:'IELTS at a glance'},
    {id:'listening', label:'Listening'},
    {id:'reading', label:'Reading'},
    {id:'writing', label:'Writing'},
    {id:'speaking', label:'Speaking'},
    {id:'scores', label:'Scoring'},
    {id:'strategy', label:'Test strategy'},
    {id:'plan', label:'Study plan'}
  ];
  const lessonData = {
    listening: {
      eyebrow:'SKILL 01 / RECEPTIVE', title:'Listen for meaning, not every word.',
      intro:'IELTS Listening is a 40-question, four-part test. You hear each recording once, and the situations move from everyday conversations to academic discussion.',
      facts:[['30 min','Approx. test time'],['4 parts','Increasingly academic'],['40','Questions'],['1×','Recording played once']],
      sections:[
        ['What you are tested on','Following a conversation, locating specific facts, recognising relationships between ideas, understanding opinions and catching detail. Accents can include British, Australian, New Zealand and North American varieties.'],
        ['Question families','Multiple choice, matching, plan/map/diagram labelling, form completion, note completion, table completion, flow-chart completion, summary completion, sentence completion and short-answer questions.'],
        ['The core habit','Before the audio starts, predict what kind of information can fit each gap. During the recording, listen for meaning shifts and paraphrases rather than waiting for the exact wording from the question.'],
        ['Common trap','A speaker can mention an attractive option and then reject it. Treat the whole idea as evidence. Do not choose an answer merely because you heard one of its words.']
      ],
      drill:'Read the question → underline the key idea → predict the answer type → listen for paraphrase → write/check spelling.'
    },
    reading: {
      eyebrow:'SKILL 02 / RECEPTIVE', title:'Read for structure before you read for detail.',
      intro:'Academic Reading has three sections, 40 questions and 60 minutes. The passages total roughly 2,150–2,750 words and may be narrative, descriptive or argumentative; at least one contains detailed logical argument.',
      facts:[['60 min','Fixed time'],['3','Passages'],['40','Questions'],['2,150–2,750','Approx. words']],
      sections:[
        ['Question families','Multiple choice, True/False/Not Given, Yes/No/Not Given, matching information, matching headings, matching features, matching sentence endings, summary/note/table/flow-chart/diagram completion and short answers.'],
        ['True / False / Not Given','TRUE means the statement agrees with the text. FALSE means the text contradicts it. NOT GIVEN means the passage neither confirms nor contradicts it. Your outside knowledge does not count.'],
        ['Matching headings','Look for the paragraph’s controlling idea, not its most interesting example. A paragraph can contain several details while only one heading captures its function.'],
        ['Paraphrase is the game','The question often changes vocabulary and grammar. Build synonym awareness: increase → rise, drawback → disadvantage, examine → investigate. Then verify the meaning in context.']
      ],
      drill:'Skim the title and paragraph openings → map the passage → locate keywords → scan for paraphrases → read the local evidence closely → answer.'
    },
    writing: {
      eyebrow:'SKILL 03 / PRODUCTIVE', title:'Make your argument easy to follow.',
      intro:'Academic Writing lasts 60 minutes and has two tasks. Task 1 asks you to describe visual information; Task 2 asks you to respond to a point of view, argument or problem. Task 2 carries twice the weight of Task 1.',
      facts:[['60 min','Total'],['150+','Task 1 words'],['250+','Task 2 words'],['2×','Task 2 weighting']],
      sections:[
        ['Task 1: overview first','Identify the biggest patterns before reporting individual numbers. For a graph, compare major changes and groups. For a process, show stages and sequencing. For a map, describe the important changes and relationships.'],
        ['Task 2: answer the actual question','Identify exactly what the prompt asks you to discuss. Give a clear position when required, develop each main idea, and support claims with relevant explanation or examples. Avoid writing a generic essay about the broad topic.'],
        ['Four assessment criteria','Task achievement/response, coherence and cohesion, lexical resource, and grammatical range and accuracy. These criteria are central to how examiners assess the writing.'],
        ['Useful structure','Introduction → overview/position → developed body idea 1 → developed body idea 2 → conclusion when appropriate. Structure is a tool for clarity, not a formula that can replace ideas.']
      ],
      drill:'Plan for 3–5 minutes → write the answer to the exact prompt → develop ideas → leave time to check grammar, articles, plurals, spelling and agreement.'
    },
    speaking: {
      eyebrow:'SKILL 04 / INTERACTIVE', title:'Sound natural while staying organised.',
      intro:'Speaking is an 11–14 minute, three-part interview with a certified examiner. You are assessed throughout the test, not only on a single answer.',
      facts:[['11–14 min','Total'],['3','Parts'],['1 min','Part 2 preparation'],['4','Assessment criteria']],
      sections:[
        ['Part 1','Familiar topics such as home, family, work, studies and interests. Aim for direct answers with a small amount of development rather than memorised speeches.'],
        ['Part 2','You receive a task card, have one minute to prepare, then speak for up to two minutes. Use the bullet points as a route through the answer, but keep the talk connected.'],
        ['Part 3','The discussion becomes more abstract. You need to explain opinions, analyse, discuss and speculate. Extend answers with reasons, consequences, comparisons and examples.'],
        ['Four criteria','Fluency and coherence, lexical resource, grammatical range and accuracy, and pronunciation. Pronunciation is about being understood without too much effort, not about copying one particular accent.']
      ],
      drill:'Answer → explain why → give an example → add a consequence or contrast. Record yourself and mark hesitation, repetition, unclear sounds and grammar errors.'
    }
  };
  function injectNav(){
    document.querySelectorAll('.topbar').forEach(nav => {
      if(nav.querySelector('.learn-nav')) return;
      const btn=document.createElement('button'); btn.className='learn-nav'; btn.innerHTML='<span class="learn-nav-dot"></span>Learn';
      btn.onclick=()=>openLearn('overview'); nav.appendChild(btn);
    });
  }
  function openLearn(section='overview'){
    document.body.classList.add('learn-mode');
    document.querySelector('#app').innerHTML = render(section);
    bind(); window.scrollTo({top:0,behavior:'instant'});
    history.replaceState(null,'','#learn/'+section);
  }
  function closeLearn(){location.href=location.pathname+'#bank'; location.reload();}
  function render(section){
    return `<main class="learn-shell"><nav class="learn-top"><button class="brand brand-button" data-learn-back><span class="brand-mark">I/</span><span>IELTS TRAINING</span></button><div class="learn-top-label"><span class="status-dot"></span> Learning centre</div></nav>
    <section class="learn-hero"><div><p class="eyebrow">LEARNING CENTRE / ACADEMIC</p><h1>Understand the test.<br><em>Then train the skill.</em></h1><p class="learn-lede">A proper study layer for IELTS Academic: format, task types, scoring logic, strategies and practical drills. No motivational fluff. Learn what the examiner is actually asking you to demonstrate.</p></div><div class="learn-manifesto"><span class="mono">THE RULE</span><strong>Don't practise mistakes faster.</strong><p>Learn the task first. Practise deliberately. Review the evidence. Then increase speed.</p></div></section>
    <section class="learn-layout"><aside class="learn-sidebar"><p class="mono">CURRICULUM</p>${topics.map(t=>`<button class="learn-tab ${section===t.id?'active':''}" data-topic="${t.id}"><span>${String(topics.indexOf(t)+1).padStart(2,'0')}</span>${t.label}</button>`).join('')}<div class="learn-back-card"><p>Ready to test yourself?</p><button class="button primary" data-learn-back>Open question bank →</button></div></aside><article class="learn-content">${content(section)}</article></section>
    <footer class="learn-footer"><span class="mono">IELTS TRAINING / LEARNING CENTRE</span><p>Unofficial learning material written for this project. IELTS is a trademark of its respective owners.</p></footer></main>`;
  }
  function content(id){
    if(id==='overview') return overview();
    if(id==='scores') return scores();
    if(id==='strategy') return strategy();
    if(id==='plan') return plan();
    const d=lessonData[id];
    return `<div class="lesson-head"><p class="eyebrow">${d.eyebrow}</p><h2>${d.title}</h2><p>${d.intro}</p></div><div class="fact-grid">${d.facts.map(x=>`<div><strong>${x[0]}</strong><span>${x[1]}</span></div>`).join('')}</div><div class="lesson-sections">${d.sections.map((x,i)=>`<section class="lesson-section"><span class="section-num">0${i+1}</span><div><h3>${x[0]}</h3><p>${x[1]}</p></div></section>`).join('')}</div><div class="drill-box"><span class="mono">PRACTICE LOOP</span><strong>${d.drill}</strong></div>`;
  }
  function overview(){return `<div class="lesson-head"><p class="eyebrow">FOUNDATION / KNOW THE EXAM</p><h2>IELTS is four skills, not one English score.</h2><p>IELTS Academic assesses Listening, Reading, Writing and Speaking. Listening and Reading are scored from correct answers; Writing and Speaking are assessed by trained examiners using published criteria. The Academic test takes 2 hours and 45 minutes in total, excluding the separate Speaking scheduling arrangements.</p></div><div class="skill-cards">${[['01','Listening','30 min · 4 parts · 40 questions','Hear information, relationships, opinions and detail.','listening'],['02','Reading','60 min · 3 passages · 40 questions','Extract information, infer meaning and follow argument.','reading'],['03','Writing','60 min · 2 tasks','Describe visual information and develop a written argument.','writing'],['04','Speaking','11–14 min · 3 parts','Communicate, explain, analyse and respond in real time.','speaking']].map(x=>`<button class="skill-card" data-topic="${x[4]}"><span class="mono">${x[0]}</span><h3>${x[1]}</h3><small>${x[2]}</small><p>${x[3]}</p><span class="skill-arrow">→</span></button>`).join('')}</div><div class="callout"><span class="mono">IMPORTANT</span><div><strong>Academic and General Training are not identical.</strong><p>Listening and Speaking are shared. Academic Reading and Writing differ from General Training Reading and Writing. This site is currently built around Academic Reading.</p></div></div>`}
  function scores(){return `<div class="lesson-head"><p class="eyebrow">SCORING / BAND 1–9</p><h2>Know what a raw score actually means.</h2><p>Listening and Reading each contain 40 questions. Each correct answer earns one mark, then the raw score is converted to the 9-band scale. The exact conversion can vary slightly between test versions.</p></div><div class="score-table"><div class="score-row head"><span>Raw / 40</span><span>Illustrative band</span><span>What it tells you</span></div>${[['16','5.0','Basic control, with frequent limitations'],['23','6.0','Competent performance with some errors'],['30','7.0','Strong control across many tasks'],['35','8.0','Very strong control and comprehension']].map(x=>`<div class="score-row"><strong>${x[0]}</strong><strong>${x[1]}</strong><span>${x[2]}</span></div>`).join('')}</div><p class="tiny-note">These are official IELTS-published average conversion points for Listening; Reading uses the same 40-mark structure but conversion can differ by test version and test type. Do not treat one raw-score table as a universal guarantee.</p><div class="band-ladder">${[['9','Expert user','Full operational command'],['8','Very good','Wide command with occasional inaccuracies'],['7','Good','Effective command despite some errors'],['6','Competent','Generally effective language use'],['5','Modest','Partial command; many mistakes'],['4','Limited','Basic competence in familiar situations']].map(x=>`<div><b>${x[0]}</b><span><strong>${x[1]}</strong>${x[2]}</span></div>`).join('')}</div>`}
  function strategy(){return `<div class="lesson-head"><p class="eyebrow">STRATEGY / EXAM CONTROL</p><h2>Strategy should reduce wasted effort, not replace English.</h2><p>The strongest approach is task-specific. Learn the rules of each question family, practise the underlying language skill, then add time pressure.</p></div><div class="strategy-grid">${[['01','Read the instructions','Word limits and the number of answers matter. In completion tasks, exceeding a stated word limit can lose the mark.'],['02','Predict before you search','Ask what kind of answer you need: person, place, number, reason, opinion, noun phrase, verb or comparison.'],['03','Expect paraphrase','Questions and recordings often express the same idea with different vocabulary or grammar. Train meaning recognition, not keyword matching.'],['04','Separate evidence from inference','Answer from what the task gives you. Especially in Reading, outside knowledge is not a substitute for textual evidence.'],['05','Review by error type','Label mistakes: vocabulary, grammar, misread instruction, missed paraphrase, careless spelling, timing or reasoning. Then practise the category.'],['06','Build speed last','Accuracy under low pressure comes before speed. A fast method that produces systematic errors is simply a fast way to practise the wrong behaviour.']].map(x=>`<article><span class="mono">${x[0]}</span><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join('')}</div><div class="callout dark"><span class="mono">THE 3-PASS REVIEW</span><div><strong>Attempt → diagnose → retry.</strong><p>On the first attempt, focus on solving. In review, explain why the correct answer is correct and why the distractors are wrong. On the second attempt, repeat the task without looking at your previous reasoning.</p></div></div>`}
  function plan(){return `<div class="lesson-head"><p class="eyebrow">PLAN / 6 WEEKS</p><h2>A study plan that turns knowledge into performance.</h2><p>Adjust the volume to your starting level. The important part is the sequence: understand → drill → timed practice → review → retest.</p></div><div class="week-grid">${[['01','Diagnostic','Take one timed section. Record raw score, time and every mistake.'],['02','Foundations','Learn all task types. Build vocabulary and grammar notebooks from your actual errors.'],['03','Skill drills','Do short sets without full-test pressure. Explain every answer after checking.'],['04','Mixed practice','Mix question families and passages. Start introducing strict timing.'],['05','Full simulations','Run complete sections under realistic timing. Review more than you test.'],['06','Polish','Target your two biggest error patterns, then run a final full simulation.']].map(x=>`<article><span class="week-no">${x[0]}</span><div><h3>${x[1]}</h3><p>${x[2]}</p></div></article>`).join('')}</div><div class="checklist"><p class="mono">WEEKLY CHECK</p>${['I can explain the format without guessing.','I know which question types cost me marks.','I can explain my wrong answers, not just see the key.','My timing is improving without a drop in accuracy.','I am practising the skill behind the question, not memorising answers.'].map(x=>`<label><input type="checkbox"> <span>${x}</span></label>`).join('')}</div>`}
  function bind(){
    document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>openLearn(b.dataset.topic));
    document.querySelectorAll('[data-learn-back]').forEach(b=>b.onclick=closeLearn);
  }
  const observer=new MutationObserver(injectNav); observer.observe(document.body,{childList:true,subtree:true});
  if(location.hash.startsWith('#learn')) openLearn(location.hash.split('/')[1]||'overview'); else injectNav();
})();