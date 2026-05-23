# CrisisSwarm 🚨

AI-Powered Autonomous Incident Monitoring & Response System built on Microsoft Azure.

## Problem Statement
Enterprise outages and failures can cause massive downtime, financial loss, and delayed incident response. Traditional monitoring systems only notify humans after failures occur, leading to slower Mean Time To Resolution (MTTR).

## Solution
CrisisSwarm is an intelligent incident monitoring and response prototype built on Azure. It combines cloud monitoring, anomaly detection, logging, and alert orchestration to simulate an autonomous incident response system.

The system detects anomalies, monitors failures, streams logs in real-time, and lays the foundation for future AI-driven swarm orchestration.

---

# Features

- Live Azure App Service deployment
- Application Insights monitoring
- Real-time log streaming
- Failed request detection
- Alert rule configuration
- Health monitoring endpoint
- Simulated failure generation
- Cloud-native monitoring pipeline

---

# Azure Services Used

- Azure App Service
- Azure Monitor
- Application Insights
- Log Analytics Workspace
- Azure Alerts
- Kudu Deployment Engine

---

# Architecture

User Requests
↓
Azure App Service
↓
Application Insights
↓
Azure Monitor Alerts
↓
CrisisSwarm Monitoring Layer
↓
Future AI Incident Response Swarm

---

# Demo Flow

1. User accesses the application
2. Requests are logged through Application Insights
3. Azure Monitor tracks anomalies
4. Failed requests trigger alerts
5. Monitoring pipeline captures telemetry
6. CrisisSwarm analyzes incidents for future remediation workflows

---

# Endpoints

## Health Check
/health

## Failure Simulation
/error

---

# Future Scope

- AI-powered root cause analysis
- Autonomous remediation agents
- Microsoft Teams integration
- GPT-powered incident summaries
- Swarm-based multi-agent orchestration
- Predictive anomaly detection
- Compliance-aware audit logging

---

# Tech Stack

- Node.js
- Microsoft Azure
- Azure Monitor
- Application Insights
- GitHub
- Kudu Deployment

---

# Author

Deepak M

---

# Hackathon Theme

Theme 5 — Agent Swarms

Secondary Relevance:
- Security
- Productivity
- Autonomous Operations
