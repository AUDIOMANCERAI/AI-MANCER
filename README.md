# 🎵 Audiomancer - Your AI Music Creation Suite

Audiomancer is a modern web application that leverages the power of Google's Gemini AI to provide a suite of tools for music creation. It can assist with music theory, generate MIDI patterns from text prompts, create detailed prompts for other AI music platforms, and analyze music files.

This application is designed to run in an environment where the Google AI API key is provided automatically.

## ✨ Features

- **🧙 AI Wizard:** A chat interface to ask questions about music theory, production techniques, and more, with an optional web search capability.
- **🎹 MIDI Generator:** Describe a musical idea (e.g., "a funky Daft Punk bassline") and get a complete MIDI pattern. Includes an interactive piano roll for editing and playback.
- **✍️ Prompt Generator:** A step-by-step wizard to build the perfect, detailed prompt for AI music generators like Suno or Udio. It also features a "Song Analysis" mode to generate a prompt based on an existing track.
- **📁 File Wizard:** Upload a music file (MIDI, WAV, MP3) to get an instant, detailed AI analysis of its potential sound structure, instrumentation, and style.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **AI:** Google Gemini API (`@google/genai`)

---

## 🚀 Running the App

This application is ready to run. The necessary Google AI API key is automatically configured by the environment, so no special setup is required. Just launch the app and start creating!
