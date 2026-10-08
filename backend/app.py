from __future__ import annotations

import io
import json
import os
import re
from typing import Any

from flask import Flask, jsonify, request
from openai import OpenAI
from pypdf import PdfReader


app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 12 * 1024 * 1024


DEMO_FACTS = [
    "The uploaded document introduces a set of connected ideas that can be reviewed in small steps.",
    "Key terms are easiest to remember when each term is linked to an example.",
    "A short retrieval practice session helps reveal which concepts need another review.",
    "Comparing related ideas makes it easier to notice their differences and relationships.",
    "Summarizing a section in your own words is a useful check for understanding.",
    "Organizing information into groups reduces the amount of detail held in working memory.",
    "Spaced review gives important ideas more than one opportunity to move into long-term memory.",
    "Questions are most useful when they ask for an explanation rather than simple recognition.",
    "A good study plan alternates between learning new material and recalling older material.",
    "Small, regular study sessions are easier to sustain than one very long session.",
    "Examples make abstract ideas more concrete and easier to apply.",
    "Reviewing mistakes provides information about what to practice next.",
    "Connections between topics help learners transfer knowledge to a new situation.",
    "Clear definitions prevent confusion when similar terms appear in the same subject.",
    "A final self-check helps confirm whether the main ideas can be recalled without notes.",
]


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    return text


def extract_pdf_text(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    return clean_text(" ".join(pages))


def sentences_from(text: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", clean_text(text))
    result: list[str] = []
    for sentence in sentences:
        sentence = clean_text(sentence).strip(" -•")
        if len(sentence) >= 35 and sentence not in result:
            result.append(sentence)
    return result


def topic_for(sentence: str, index: int) -> str:
    words = re.findall(r"[A-Za-z][A-Za-z'-]+", sentence)
    meaningful = [word for word in words if len(word) > 3]
    if meaningful:
        return " ".join(meaningful[:3]).lower()
    return f"idea {index + 1}"


def generate_study_material(text: str, file_name: str) -> dict[str, Any]:
    """Create a complete study kit from extracted text.

    This local generator keeps the app usable without an API key. The returned
    shape is provider-agnostic, so an LLM call can replace this implementation.
    """

    if os.environ.get("OPENAI_API_KEY") and clean_text(text):
        try:
            return generate_with_openai(text, file_name)
        except Exception:
            app.logger.exception("OpenAI generation failed; using local fallback")

    source_sentences = sentences_from(text)
    if len(source_sentences) < 15:
        source_sentences = (source_sentences + DEMO_FACTS)[:15]

    summary_points = source_sentences[:5]
    summary = " ".join(summary_points)

    quiz: list[dict[str, Any]] = []
    for index in range(10):
        correct = source_sentences[index % len(source_sentences)]
        distractors = [
            source_sentences[(index + offset) % len(source_sentences)]
            for offset in (3, 6, 9)
        ]
        options = list(dict.fromkeys([correct, *distractors]))
        while len(options) < 4:
            options.append(DEMO_FACTS[len(options) + index])
        options = options[:4]
        quiz.append(
            {
                "id": index + 1,
                "question": (
                    f"Which statement best captures a key idea about "
                    f"{topic_for(correct, index)}?"
                ),
                "options": options,
                "correctAnswer": correct,
                "explanation": (
                    "This answer is supported by the uploaded study material. "
                    "Re-read the idea and explain it in your own words."
                ),
            }
        )

    flashcards: list[dict[str, Any]] = []
    for index in range(15):
        answer = source_sentences[index % len(source_sentences)]
        flashcards.append(
            {
                "id": index + 1,
                "front": f"What should you remember about {topic_for(answer, index)}?",
                "back": answer,
            }
        )

    return {
        "fileName": file_name,
        "summary": summary,
        "quiz": quiz,
        "flashcards": flashcards,
    }


def generate_with_openai(text: str, file_name: str) -> dict[str, Any]:
    """Ask OpenAI for structured study material while preserving our API shape."""

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    prompt = f"""
Create a study kit from the source text below.

Return JSON only with this exact shape:
{{
  "summary": "A concise 2-4 paragraph summary.",
  "quiz": [
    {{
      "id": 1,
      "question": "A clear multiple-choice question.",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": "The exact text of the correct option.",
      "explanation": "Why the correct answer is supported by the source."
    }}
  ],
  "flashcards": [
    {{
      "id": 1,
      "front": "A concise recall prompt.",
      "back": "The answer grounded in the source."
    }}
  ]
}}

Rules:
- Generate exactly 10 quiz questions and exactly 15 flashcards.
- Each quiz question must have exactly 4 distinct options.
- The correctAnswer must exactly match one option.
- Use only information supported by the source.
- Make distractors plausible but clearly incorrect.
- Keep the summary focused on the most important ideas.
- Do not include markdown fences or any text outside the JSON.

Source file: {file_name}
Source text:
{text[:50000]}
"""
    response = client.chat.completions.create(
        model=os.environ.get("OPENAI_MODEL", "gpt-4.1-mini"),
        messages=[
            {
                "role": "system",
                "content": "You are a precise study-material generator.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        max_tokens=7000,
    )
    content = response.choices[0].message.content
    if not content:
        raise ValueError("OpenAI returned an empty response")

    generated = json.loads(content)
    quiz = generated.get("quiz")
    flashcards = generated.get("flashcards")
    summary = clean_text(str(generated.get("summary", "")))
    if (
        not summary
        or not isinstance(quiz, list)
        or len(quiz) != 10
        or not isinstance(flashcards, list)
        or len(flashcards) != 15
    ):
        raise ValueError("OpenAI returned an invalid study kit shape")

    normalized_quiz: list[dict[str, Any]] = []
    for index, item in enumerate(quiz):
        options = [clean_text(str(option)) for option in item.get("options", [])]
        correct = clean_text(str(item.get("correctAnswer", "")))
        if len(options) != 4 or len(set(options)) != 4 or correct not in options:
            raise ValueError("OpenAI returned invalid quiz options")
        normalized_quiz.append(
            {
                "id": index + 1,
                "question": clean_text(str(item.get("question", ""))),
                "options": options,
                "correctAnswer": correct,
                "explanation": clean_text(str(item.get("explanation", ""))),
            }
        )

    normalized_cards: list[dict[str, Any]] = []
    for index, item in enumerate(flashcards):
        front = clean_text(str(item.get("front", "")))
        back = clean_text(str(item.get("back", "")))
        if not front or not back:
            raise ValueError("OpenAI returned an invalid flashcard")
        normalized_cards.append({"id": index + 1, "front": front, "back": back})

    return {
        "fileName": file_name,
        "summary": summary,
        "quiz": normalized_quiz,
        "flashcards": normalized_cards,
    }


@app.get("/api/healthz")
def health() -> tuple[Any, int]:
    return jsonify({"status": "ok"}), 200


@app.post("/api/study-materials/generate")
def generate() -> tuple[Any, int]:
    uploaded = request.files.get("file")
    if uploaded is None or not uploaded.filename:
        return jsonify({"error": "Please upload a PDF file."}), 400
    if not uploaded.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported."}), 400

    try:
        raw = uploaded.read()
        if not raw:
            return jsonify({"error": "The uploaded PDF is empty."}), 400
        text = extract_pdf_text(raw)
        result = generate_study_material(text, uploaded.filename)
        return jsonify(result), 200
    except Exception:
        app.logger.exception("Failed to generate study material")
        return jsonify(
            {"error": "We could not read that PDF. Try a text-based PDF under 12 MB."}
        ), 400


@app.errorhandler(413)
def too_large(_error: Any) -> tuple[Any, int]:
    return jsonify({"error": "That PDF is too large. Please upload one under 12 MB."}), 413

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

