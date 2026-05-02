# Project SOBAT (Sistem Pengingat Obat)

## 1. Project Overview
SOBAT is an m-Health application designed to monitor outpatient medication adherence and predict non-adherence risks proactively using Machine Learning.

## 2. Tech Stack
* Frontend: React Native
* Backend: Laravel (API-only), MySQL
* AI/ML: Python, Scikit-Learn (Logistic Regression)

## 3. Core Architecture & Development Rules
* The primary input for the AI model is `time_difference_minutes` (the gap between scheduled medication time and actual confirmation time).
* **Strict Exception Handling:** All backend logic, database transactions, and API communications MUST be wrapped in `try-catch` blocks. Failures must return descriptive JSON responses with appropriate HTTP status codes.
* Ensure SOLID principles and clean code practices are maintained across all frameworks.

## 4. Progress Tracker
* [x] Phase 1: Database Schema (Medications, Schedules, AdherenceLogs)
* [x] Phase 2: Core API & Sanctum Auth (CRUD & Confirm Consumption Endpoint)
* [x] Phase 3: Data Simulation (Kaggle/Faker) & AI Engineering (Logistic Regression)
* [x] Phase 4: Integration AI Service & Laravel
* [x] Phase 5: Frontend Development (React Native)
* [x] Phase 6: Smart Notification & Error Monitoring

## 5. Maintenance Protocol
**CRITICAL AGENT RULE:** At the conclusion of every development session, major feature implementation, or phase completion, the AI agent MUST update the "Progress Tracker" section and append any new architectural decisions to this `context.md` file. Always read this file before starting a new task.

---
CRITICAL INSTRUCTION FOR THE AGENT:
Please create the `context.md` file in the root directory of this workspace and write the exact markdown content above into it. Apply the file creation directly. Do not just output the text in the chat.

## 6. Project Status
MVP Completed successfully. The application demonstrates end-to-end functionality integrating a React Native mobile frontend, a Laravel core backend, and a FastAPI Machine Learning microservice for adherence prediction.
