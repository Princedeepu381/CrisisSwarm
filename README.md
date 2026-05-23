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

```text
                    ┌────────────────────┐
                    │       Users        │
                    └─────────┬──────────┘
                              │
                              ▼
                ┌─────────────────────────┐
                │ Azure App Service       │
                │ (Node.js Web App)       │
                └─────────┬───────────────┘
                          │
                          ▼
                ┌─────────────────────────┐
                │ Application Insights    │
                │ Telemetry & Monitoring  │
                └─────────┬───────────────┘
                          │
                          ▼
                ┌─────────────────────────┐
                │ Azure Monitor Alerts    │
                │ Smart Detection Rules   │
                └─────────┬───────────────┘
                          │
                          ▼
                ┌─────────────────────────┐
                │ CrisisSwarm Engine      │
                │ Incident Analysis Layer │
                └─────────┬───────────────┘
                          │
              ┌───────────┴────────────┐
              ▼                        ▼
   ┌─────────────────┐      ┌──────────────────┐
   │ Log Analytics    │      │ Future AI Swarm │
   │ Diagnostic Logs  │      │ Autonomous Agents│
   └─────────────────┘      └──────────────────┘
