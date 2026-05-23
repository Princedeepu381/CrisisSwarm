# 🚨 CrisisSwarm

> AI-Powered Autonomous Incident Monitoring & Response System built on Microsoft Azure

CrisisSwarm is a cloud-native intelligent monitoring and incident response prototype designed to detect failures, monitor anomalies, stream telemetry, and simulate autonomous incident handling workflows using Microsoft Azure services.

Built as part of a hackathon project under **Theme 5 — Agent Swarms**.

---

# 📌 Problem Statement

Modern enterprises suffer significant downtime due to:
- delayed incident detection
- slow manual troubleshooting
- fragmented monitoring systems
- lack of intelligent remediation

Traditional monitoring tools only generate alerts after failures occur, forcing engineers to manually investigate logs, analyze failures, and coordinate fixes.

This increases:
- Mean Time To Resolution (MTTR)
- operational costs
- downtime impact
- alert fatigue

---

# 💡 Solution

CrisisSwarm introduces an intelligent monitoring and response pipeline using Azure cloud services.

The platform:
- monitors application health
- streams live telemetry
- detects failed requests
- generates alerts
- simulates autonomous incident response workflows

It serves as the foundation for a future AI-driven multi-agent incident remediation system.

---

# ⚡ Features

## ✅ Cloud-Native Deployment
- Azure App Service deployment
- Node.js backend hosted on Azure

## ✅ Monitoring & Observability
- Azure Application Insights integration
- Real-time telemetry collection
- Live request monitoring
- Health endpoint monitoring

## ✅ Incident Detection
- Failed request detection
- Response time alerting
- Real-time log streaming
- Simulated failure generation

## ✅ Alerting Pipeline
- Azure Monitor alert rules
- Smart detection integration
- Diagnostic logging
- Log Analytics integration

## ✅ Deployment Pipeline
- Kudu ZIP deployment
- GitHub integration
- Cloud-based deployment workflow

---

# 🏗️ Architecture
flowchart TD

    U[👤 Users / Enterprise Systems]

    A[☁️ Azure App Service<br/>Node.js Web Application]

    B[📊 Application Insights<br/>Telemetry & Monitoring]

    C[🚨 Azure Monitor Alerts<br/>Smart Detection Rules]

    D[🧠 CrisisSwarm Monitoring Engine<br/>Incident Analysis Layer]

    E[🤖 Future AI Swarm Agents<br/>Autonomous Response System]

    F[🛠 Suggested Remediation<br/>Incident Response Actions]

    G[📂 Log Analytics Workspace]

    H[📜 Diagnostic Logs]

    I[❤️ Health Monitoring]

    J[❌ Failed Request Detection]

    K[📡 Real-Time Telemetry]

    U --> A
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F

    B --> G
    B --> H
    B --> I
    B --> J
    B --> K

    C -->|Anomaly Detection| D
    D -->|Alert Orchestration| E
    E -->|Autonomous Response Pipeline| F

    style A fill:#0078D4,color:#fff,stroke:#005A9E
    style B fill:#00BCF2,color:#fff,stroke:#0078D4
    style C fill:#FFB900,color:#000,stroke:#D18F00
    style D fill:#6B69D6,color:#fff,stroke:#4B48B5
    style E fill:#107C10,color:#fff,stroke:#0B5E0B
    style F fill:#D83B01,color:#fff,stroke:#A62D00
    style G fill:#505050,color:#fff
    style H fill:#505050,color:#fff
    style I fill:#505050,color:#fff
    style J fill:#505050,color:#fff
    style K fill:#505050,color:#fff
