# IELTS Training

A polished, zero-build IELTS-style Academic Reading practice app with **100 original multiple-choice questions**.

## What is included

- 8 original long-form Academic Reading passages
- 100 single-answer multiple-choice questions (A–D)
- Detailed answer explanations after submission
- Per-passage timer, question navigator and flag-for-review flow
- Local progress persistence with `localStorage`
- Responsive split reading / question workspace
- No framework, package install or backend required

## Run locally

Because the app is static, serve the repository with any local HTTP server:

```bash
python -m http.server 5173
```

Then open `http://localhost:5173`.

## Deploy

This repository can be deployed directly with GitHub Pages from the repository root (`main` branch), or on any static hosting provider.

## Practice design

The current release focuses on **Academic Reading / single-answer multiple choice**. It is intentionally not presented as an official mock exam. Official IELTS Academic Reading uses 3 sections, 40 questions in 60 minutes and a wider range of task types. This project starts with MCQ as a focused training bank and can be expanded with True/False/Not Given, matching headings, summary completion, Listening and other modules later.

## Disclaimer

This is an unofficial practice project. All passages and questions in this repository are original. IELTS is a trademark of its respective owners; this project is not affiliated with or endorsed by IELTS.
