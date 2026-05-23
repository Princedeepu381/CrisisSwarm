# 🎥 CrisisSwarm 3-Minute Demo Video Script

### Title: "Zero-Human Incident Response in 180 Seconds"
**Target Audience:** Microsoft Build AI Hackathon 2026 Judges & Technical Reviewers
**Presenter Role:** Lead Engineer / Swarm Architect

---

## ⏱️ Timeline & Segment Breakdown

### 🎬 Segment 1: The Hook & Platform Introduction (0:00 - 0:30)
* **Visual on Screen:**
  * Zoomed-in look at the high-fidelity dark-themed CrisisSwarm Dashboard page (`/dashboard`).
  * System Health displays `98%` (Optimal green glow), Active Incidents shows `0`, and Response Time is a steady `195ms`.
  * Show the interactive "Global Cloud Regions" glowing grid.
* **Voiceover (Audio):**
  * "Welcome to CrisisSwarm, an autonomous AI-powered incident response platform built for the Microsoft Build AI Hackathon 2026. Instead of paging developers at 3 AM when cloud infrastructure degrades, CrisisSwarm deploys a coordinated swarm of 6 specialized AI agents to handle the entire incident lifecycle—completely autonomously."

---

### 🎬 Segment 2: Simulating a Critical Crisis (0:30 - 1:15)
* **Visual on Screen:**
  * Cursor hovers over and clicks the large red **"Simulate Crisis"** button in the header.
  * *Immediate UI Reaction:*
    * Dashboard health bar drops to `42%` in real-time.
    * An incident titled `"Database connection pool exhaustion"` appears as **Active** with a critical red status badge.
    * The metric charts (CPU Usage, Latency) spike upward instantly.
    * An AI Swarm Advisory banner appears: `"Swarm engaged. Analyzer agent correlating regional signals."`
* **Voiceover (Audio):**
  * "Let's trigger a simulation by clicking 'Simulate Crisis'. Immediately, the dashboard reacts. Our reactive telemetry engine spikes CPU utilization and latency charts. An anomaly is registered in the database, and the autonomous lifecycle engine starts ticking. The agent swarm is activated."

---

### 🎬 Segment 3: Coordinated Swarm & Live Terminal (1:15 - 2:00)
* **Visual on Screen:**
  * Switch tabs to **AI Swarm Operations** page (`/agents`).
  * Highlight the **Swarm Terminal** streaming live logs.
  * Show logs appearing from different agents:
    * `[Analyzer-Agent] Detected anomalous pattern... Confidence 94%`
    * `[RootCause-Agent] Root cause traced to API Gateway connection pool timeouts...`
    * `[Prediction-Agent] Blast radius covers US-East region, impact 3,200 users...`
* **Voiceover (Audio):**
  * "Navigating to Swarm Operations, we see our live terminal feed. Instead of a single LLM trying to do everything, specialized agents execute in sequence. The Analyzer correlates regional signals, the Root Cause traces the cascading timeouts, and the Prediction Agent forecasts blast radius—all streaming in real-time via Server-Sent Events."

---

### 🎬 Segment 4: Operator-in-the-Loop Controls (2:00 - 2:40)
* **Visual on Screen:**
  * Highlight the new **"Stop Swarm"** and **"Resume Swarm"** global buttons in the sticky header.
  * Click **"Stop Swarm"**:
    * All agent cards on the grid immediately turn from electric blue to warning crimson glassmorphic borders.
    * All status badges change to `offline` in a flash.
    * The terminal prints a warning: `[Swarm Orchestrator] All swarm agents suspended (OFFLINE) by central operations.`
    * Point out that the active command progress bar has paused.
  * Hover over `AutoScaler-Alpha` and click the individual **"Resume"** quick action button.
    * `AutoScaler-Alpha` immediately returns to `idle` (green highlight), and its individual processing resumes while others remain suspended.
  * Click **"Resume Swarm"**:
    * All agents transition back online instantly.
    * Command progress bars resume advancing toward completion.
* **Voiceover (Audio):**
  * "But autonomous systems need human guardrails. CrisisSwarm introduces granular global and individual controls. By clicking 'Stop Swarm', we can instantly suspend all agents. The backend immediately pauses command progression and halts the incident's automatic progression. Individual toggles let us wake or sleep specific agents, turning their card borders a glowing crimson alert shade or restoring them to active blue. Resuming the swarm gets everything moving again."

---

### 🎬 Segment 5: Resolution & Value Recap (2:40 - 3:00)
* **Visual on Screen:**
  * Show the terminal print: `[Remediation-Agent] Execution complete: kubectl rollout restart deployment...`
  * Show the incident status changes to **Resolved** (optimal green) and the telemetry graphs return to normal baseline levels.
  * End on slide/stats screen: `MTTR 4 Hours -> 50 Seconds`.
* **Voiceover (Audio):**
  * "As the swarm finishes, the Remediation Agent applies a container restart, the Security Agent audits certificates, the incident self-resolves, and telemetry metrics return to normal. By replacing manual workflows with coordinated AI swarms on Azure, CrisisSwarm slashes incident resolution time from 4 hours to just 50 seconds. Thank you."
