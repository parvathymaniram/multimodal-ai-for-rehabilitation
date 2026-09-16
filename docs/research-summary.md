# AI-Based Multimodal Virtual Assistant with Neural Lip Synchronization for Post-Operative Knee Rehabilitation

**Parvathy Maniram | M.Tech (AI/ML), Amrita Vishwa Vidyapeetham, Amritapuri**

**Publication:** Accepted at ICDSA 2026, Springer Lecture Notes in Networks and Systems (LNNS), Scopus-indexed

## Overview

This project presents an AI-based virtual rehabilitation assistant that combines a large language model, neural text-to-speech synthesis, and GAN-based lip synchronization to deliver a personalized, talking-avatar rehabilitation coach generated from a patient's own face photograph.

The system is designed to provide rehabilitation-related conversational assistance while presenting responses through a personalized, lip-synchronized virtual avatar.

## Motivation and Research Gap

Existing digital rehabilitation tools include passive exercise-tracking applications and text-based chatbots, which can face challenges related to patient trust and sustained engagement.

This project integrates three modalities into a single personalized platform:

- Conversational reasoning
- Natural speech synthesis
- Per-response facial animation through neural lip synchronization

The research investigates the integration of domain-grounded conversational AI with personalized neural lip synchronization in a deployable rehabilitation platform.

## System Design

The system follows a three-tier architecture:

1. **React.js presentation layer**
2. **Flask REST application layer** for conversational state and orchestration
3. **Isolated media tier** running Wav2Lip as a subprocess

Responses are delivered in two phases: an initial text response followed by asynchronous audio and lip-synchronized video.

### Technical Contributions

- Domain-grounded conversational AI using **LLaMA 3.1 8B Instruct** through the Groq Cloud API.
- Prompt-based guardrails enforcing rehabilitation scope and referral to the treating surgeon for medication or infection-related queries.
- Neural speech synthesis using **Microsoft Edge-TTS**.
- Custom **NumPy/SciPy mel-spectrogram extraction** compatible with Wav2Lip processing.
- Personalized avatar generation from a single face photograph.
- Per-response neural lip synchronization using **Wav2Lip**.

## Evaluation

The system was evaluated across three dimensions:

- Clinical response quality
- Technical pipeline performance
- User experience

| Metric | Result |
|---|---|
| Clinical response accuracy | 4.17 / 5 |
| Patient safety score | 4.63 / 5 |
| Lip-Sync Error Distance (LSE-D) | 6.84 |
| End-to-end pipeline latency | 91 seconds (CPU-only) |
| Wav2Lip processing contribution | 82 seconds |
| User trust / engagement | 4.45 vs 3.53 (avatar vs text-only) |

The clinical response evaluation used 10 responses, while the user experience study included 8 participants.

The avatar interface showed statistically significant improvements over the text-only baseline in perceived trust, engagement, and helpfulness.

## Research Significance

The project demonstrates an end-to-end multimodal rehabilitation assistant that combines conversational AI, neural speech synthesis, and personalized lip-synchronized avatar generation.

The asynchronous two-phase delivery architecture enables the conversational response to remain usable while the computationally intensive avatar video is generated.

## Future Directions

- GPU-accelerated inference to reduce end-to-end video latency.
- Retrieval-augmented generation (RAG) for phase-specific exercise libraries and clinical grounding.
- Extension to hip, shoulder, and spine rehabilitation.
- Unity/XR-based deployment on mobile headsets.

## Technology Stack

**AI/ML:** LLaMA 3.1 8B Instruct, PyTorch, TensorFlow  
**Backend:** Python, Flask  
**Frontend:** React.js, Vite  
**Speech:** Microsoft Edge-TTS  
**Lip Synchronization:** Wav2Lip  
**Audio Processing:** NumPy, SciPy  
**Computer Vision:** OpenCV  
**Media Processing:** FFmpeg  
**Deployment/Infrastructure:** Docker, GCP

## Publication

**ICDSA 2026 — Springer LNNS (Scopus-indexed)**

**Authors:** Parvathy Maniram, Divya Udayan J  
**Affiliation:** Amrita School of Computing, Amritapuri
