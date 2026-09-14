# Multimodal AI for Post-Operative Rehabilitation

A multimodal AI virtual assistant designed to support personalized post-operative knee rehabilitation through conversational AI, neural speech synthesis, and neural lip synchronization.

## Overview

This research project presents an AI-based virtual rehabilitation assistant that combines a large language model, text-to-speech synthesis, and a personalized talking-head avatar.

The system is designed to provide rehabilitation-related conversational assistance while presenting responses through a personalized, lip-synchronized virtual avatar.

## Research Contributions

- End-to-end multimodal rehabilitation assistance pipeline.
- Conversational AI using LLaMA 3.1 8B Instruct through the Groq Cloud API.
- Neural text-to-speech generation using Microsoft Edge-TTS.
- Personalized avatar generation from a user's face image.
- Neural lip synchronization using Wav2Lip.
- Custom mel-spectrogram extraction using NumPy and SciPy.
- Evaluation across clinical response quality, system performance, and user experience.

## System Architecture

The system follows a modular architecture consisting of:

1. **React frontend** – user interaction and presentation.
2. **Flask backend** – application orchestration and API handling.
3. **Conversational AI** – generates rehabilitation-focused responses.
4. **Text-to-Speech** – converts generated responses into speech.
5. **Audio processing** – extracts the mel-spectrogram required for lip synchronization.
6. **Wav2Lip** – generates a lip-synchronized avatar video.
7. **Multimodal output** – presents the generated response through text, speech, and an animated avatar.

The response pipeline separates the immediate conversational response from the computationally intensive audio/video generation stage.

## Evaluation

The system was evaluated using clinical response quality, safety, lip-sync quality, pipeline latency, and a user study.

| Metric | Result |
|---|---:|
| Clinical response quality | 4.17 / 5 |
| Patient safety | 4.63 / 5 |
| Lip-sync quality (LSE-D) | 6.84 |
| LLM latency | 1.8 s |
| Total video generation latency | 91 s |
| User study | 8 participants |

An ablation study also evaluated text-only, TTS-enhanced, and full avatar-based configurations, showing improved engagement with the multimodal avatar system.

## Technology Stack

- **Frontend:** React, Vite
- **Backend:** Python, Flask
- **LLM:** LLaMA 3.1 8B Instruct
- **LLM API:** Groq Cloud API
- **Speech synthesis:** Microsoft Edge-TTS
- **Lip synchronization:** Wav2Lip
- **Audio processing:** NumPy, SciPy
- **Computer vision:** OpenCV
- **Deep learning:** PyTorch, TensorFlow
- **Media processing:** FFmpeg

## Project Structure

```text
multimodal-ai-for-rehabilitation/
├── backend/
├── public/
├── src/
├── Wav2Lip/
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt
├── package.json
└── vite.config.js
