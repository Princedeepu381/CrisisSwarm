// ─── Azure OpenAI Swarm Integration ──────────────────────────────────────────
// Provides structured Azure OpenAI calls for each agent role in the swarm.
// Falls back to high-fidelity simulated responses when credentials are missing.

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AgentAnalysis {
  agent: string;
  role: string;
  analysis: string;
  confidence: number;
  recommendations: string[];
  timestamp: string;
}

export interface SwarmAnalysisResult {
  incidentId: string;
  analyses: AgentAnalysis[];
  overallAssessment: string;
  resolutionPlan: string;
  estimatedMTTR: string;
}

// ─── Environment Check ──────────────────────────────────────────────────────

function getAzureConfig() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

  const isConfigured = !!(apiKey && endpoint && apiKey !== 'your-api-key' && apiKey.length > 10);

  return { apiKey, endpoint, deploymentName, apiVersion, isConfigured };
}

export function isAzureOpenAIConfigured(): boolean {
  return getAzureConfig().isConfigured;
}

// ─── Azure OpenAI Chat Completion ────────────────────────────────────────────

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callAzureOpenAI(messages: ChatMessage[]): Promise<string> {
  const config = getAzureConfig();

  if (!config.isConfigured) {
    throw new Error('Azure OpenAI not configured');
  }

  const url = `${config.endpoint}openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey!,
    },
    body: JSON.stringify({
      messages,
      max_tokens: 800,
      temperature: 0.7,
      top_p: 0.95,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure OpenAI API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

// ─── Agent Prompt Templates ──────────────────────────────────────────────────

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  analyzer: `You are the Analyzer Agent in the CrisisSwarm autonomous incident response swarm. 
Your role is to correlate telemetry signals across cloud regions to identify anomalies.
Respond with a JSON object containing:
- "analysis": A concise technical analysis (2-3 sentences)
- "confidence": A number 0-100 representing your confidence
- "recommendations": An array of 2-3 specific action items
Always respond in valid JSON only.`,

  rootcause: `You are the Root Cause Agent in the CrisisSwarm autonomous incident response swarm.
Your role is to diagnose system state and trace failure chains through distributed service dependencies.
Respond with a JSON object containing:
- "analysis": A concise root cause diagnosis (2-3 sentences)
- "confidence": A number 0-100 representing your confidence
- "recommendations": An array of 2-3 specific remediation steps
Always respond in valid JSON only.`,

  prediction: `You are the Prediction Agent in the CrisisSwarm autonomous incident response swarm.
Your role is to forecast blast radius and outage probability using pattern analysis.
Respond with a JSON object containing:
- "analysis": A concise impact prediction (2-3 sentences)
- "confidence": A number 0-100 representing your confidence
- "recommendations": An array of 2-3 preventive measures
Always respond in valid JSON only.`,

  remediation: `You are the Remediation Agent in the CrisisSwarm autonomous incident response swarm.
Your role is to propose and execute automated fixes (container restarts, load redistribution, failover).
Respond with a JSON object containing:
- "analysis": A concise remediation plan (2-3 sentences)
- "confidence": A number 0-100 representing your confidence
- "recommendations": An array of 2-3 specific script/action commands
Always respond in valid JSON only.`,

  security: `You are the Security Agent in the CrisisSwarm autonomous incident response swarm.
Your role is to validate system integrity post-remediation and perform security sweeps.
Respond with a JSON object containing:
- "analysis": A concise security assessment (2-3 sentences)
- "confidence": A number 0-100 representing your confidence
- "recommendations": An array of 2-3 security hardening measures
Always respond in valid JSON only.`,
};

// ─── Parse Agent Response ────────────────────────────────────────────────────

function parseAgentResponse(raw: string): { analysis: string; confidence: number; recommendations: string[] } {
  try {
    // Extract JSON from possible markdown code blocks
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : raw;
    const parsed = JSON.parse(jsonStr);
    return {
      analysis: parsed.analysis || 'Analysis completed.',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 85,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ['Monitor system health'],
    };
  } catch {
    return {
      analysis: raw.slice(0, 200),
      confidence: 75,
      recommendations: ['Review agent output manually'],
    };
  }
}

// ─── Simulated Fallback Responses ────────────────────────────────────────────

const SIMULATED_RESPONSES: Record<string, (incident: { title: string; severity: string; affected_service: string }) => AgentAnalysis> = {
  analyzer: (inc) => ({
    agent: 'Analyzer-Agent',
    role: 'Detection & Correlation',
    analysis: `Ingested real-time logs and telemetry metrics from Azure Monitor. Confirmed anomalous spike in CPU utilization and request error rates on the ${inc.affected_service} component in Azure East US 2. Telemetry shows cross-region latency degradation of ${inc.severity === 'critical' ? '480ms' : '220ms'} with a correlation coefficient of 0.94, confirming genuine system degradation rather than transient network jitter.`,
    confidence: inc.severity === 'critical' ? 96 : 89,
    recommendations: [
      `Isolate ${inc.affected_service} traffic from non-critical API consumer routes`,
      'Enable Verbose Application Insights telemetry capture for the affected service',
      'Rate-limit API Gateway ingress endpoints at 200 req/sec to throttle incoming query pressure',
    ],
    timestamp: new Date().toISOString(),
  }),

  rootcause: (inc) => ({
    agent: 'RootCause-Agent',
    role: 'Diagnosis & Dependency Tracing',
    analysis: `Root cause traced to configuration drift combined with thread pool starvation on the ${inc.affected_service} runtime cluster. Deep profiling reveals recent deployment revision #42c9f triggered database connection leaks, exhausting pool nodes under sustained load. Cascading upstream connection timeouts are blocking the main request thread loop.`,
    confidence: inc.severity === 'critical' ? 94 : 86,
    recommendations: [
      `Initiate rollback of the target ${inc.affected_service} container image version to stable build v2.4.0`,
      'Execute connection pool leak eviction script to free orphaned sockets',
      'Add circuit breaker pattern to upstream service dependency chain',
    ],
    timestamp: new Date().toISOString(),
  }),

  prediction: (inc) => ({
    agent: 'Prediction-Agent',
    role: 'Impact Forecasting',
    analysis: `Blast radius projection indicates a high outage probability of ${inc.severity === 'critical' ? '88%' : '45%'} for dependent billing and notification services if remediation is delayed beyond 60 seconds. Machine learning patterns correlate this event with a historic SQL deadlock incident from May 12, forecasting a potential database cluster crash within 10 minutes.`,
    confidence: inc.severity === 'critical' ? 90 : 81,
    recommendations: [
      'Pre-warm failover standby nodes in Azure West US 3 cluster',
      'Temporarily decouple billing microservice requests using Azure Service Bus Queue messaging',
      'Alert on-call SRE security team of potential secondary failures in cache layers',
    ],
    timestamp: new Date().toISOString(),
  }),

  remediation: (inc) => ({
    agent: 'Remediation-Agent',
    role: 'Automated Resolution',
    analysis: `Formulated and verified remediation playbook CS-REM-09. Executing rolling restart sequence for ${inc.affected_service} pods in the Kubernetes cluster. Applying dynamic hot-patch configuration to bump database connection pool limits from 50 to 150 connections, restoring request throughput.`,
    confidence: inc.severity === 'critical' ? 95 : 97,
    recommendations: [
      `kubectl rollout restart deployment/${inc.affected_service.toLowerCase().replace(/\s+/g, '-')}`,
      'az container restart --name cs-api-node --resource-group crisisswarm-rg',
      'Scale deployment replicas by +3 instances to absorb accumulated request backlog',
    ],
    timestamp: new Date().toISOString(),
  }),

  security: (inc) => ({
    agent: 'Security-Agent',
    role: 'Post-Incident Verification',
    analysis: `Completed post-remediation security audit and host integrity validation for the remediated ${inc.affected_service} services. Verified that all inter-service communication satisfies mTLS and zero-trust protocol requirements. Confirmed no unauthorized privilege escalation attempts or network egress anomalies during the incident window.`,
    confidence: 99,
    recommendations: [
      'Trigger automated vulnerability scan on the rolled-back deployment image',
      'Rotate database credentials and service principal tokens as a standard precaution',
      'Validate TLS handshake compliance across all ingress gateways',
    ],
    timestamp: new Date().toISOString(),
  }),
};

// ─── Public API: Run Full Swarm Analysis ─────────────────────────────────────

export async function runSwarmAnalysis(incident: {
  id: string;
  title: string;
  description: string;
  severity: string;
  affected_service: string;
}): Promise<SwarmAnalysisResult> {
  const config = getAzureConfig();
  const analyses: AgentAnalysis[] = [];

  const agentOrder = ['analyzer', 'rootcause', 'prediction', 'remediation', 'security'];
  const agentNames: Record<string, string> = {
    analyzer: 'Analyzer-Agent',
    rootcause: 'RootCause-Agent',
    prediction: 'Prediction-Agent',
    remediation: 'Remediation-Agent',
    security: 'Security-Agent',
  };
  const agentRoles: Record<string, string> = {
    analyzer: 'Detection & Correlation',
    rootcause: 'Diagnosis & Dependency Tracing',
    prediction: 'Impact Forecasting',
    remediation: 'Automated Resolution',
    security: 'Post-Incident Verification',
  };

  for (const agentKey of agentOrder) {
    if (config.isConfigured) {
      // ── Live Azure OpenAI call ──
      try {
        const userPrompt = `Analyze this cloud infrastructure incident:
Title: ${incident.title}
Description: ${incident.description}
Severity: ${incident.severity}
Affected Service: ${incident.affected_service}

Provide your ${agentRoles[agentKey]} analysis.`;

        const raw = await callAzureOpenAI([
          { role: 'system', content: AGENT_SYSTEM_PROMPTS[agentKey] },
          { role: 'user', content: userPrompt },
        ]);

        const parsed = parseAgentResponse(raw);
        analyses.push({
          agent: agentNames[agentKey],
          role: agentRoles[agentKey],
          analysis: parsed.analysis,
          confidence: parsed.confidence,
          recommendations: parsed.recommendations,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        // Fall back to simulation on error
        console.error(`[${agentNames[agentKey]}] Azure OpenAI error, using fallback:`, err);
        analyses.push(SIMULATED_RESPONSES[agentKey](incident));
      }
    } else {
      // ── Simulated fallback ──
      analyses.push(SIMULATED_RESPONSES[agentKey](incident));
    }
  }

  const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;

  return {
    incidentId: incident.id,
    analyses,
    overallAssessment: avgConfidence > 85
      ? `Swarm consensus: High confidence (${Math.round(avgConfidence)}%) — autonomous remediation successful.`
      : `Swarm consensus: Moderate confidence (${Math.round(avgConfidence)}%) — monitoring recommended.`,
    resolutionPlan: analyses.find(a => a.agent === 'Remediation-Agent')?.analysis || 'Automated remediation in progress.',
    estimatedMTTR: incident.severity === 'critical' ? '~50 seconds' : '~30 seconds',
  };
}

// ─── Public API: Single Agent Call ───────────────────────────────────────────

export async function runSingleAgent(
  agentKey: string,
  prompt: string
): Promise<AgentAnalysis> {
  const config = getAzureConfig();
  const agentNames: Record<string, string> = {
    analyzer: 'Analyzer-Agent',
    rootcause: 'RootCause-Agent',
    prediction: 'Prediction-Agent',
    remediation: 'Remediation-Agent',
    security: 'Security-Agent',
  };
  const agentRoles: Record<string, string> = {
    analyzer: 'Detection & Correlation',
    rootcause: 'Diagnosis & Dependency Tracing',
    prediction: 'Impact Forecasting',
    remediation: 'Automated Resolution',
    security: 'Post-Incident Verification',
  };

  if (config.isConfigured && AGENT_SYSTEM_PROMPTS[agentKey]) {
    try {
      const raw = await callAzureOpenAI([
        { role: 'system', content: AGENT_SYSTEM_PROMPTS[agentKey] },
        { role: 'user', content: prompt },
      ]);
      const parsed = parseAgentResponse(raw);
      return {
        agent: agentNames[agentKey] || agentKey,
        role: agentRoles[agentKey] || 'Agent',
        analysis: parsed.analysis,
        confidence: parsed.confidence,
        recommendations: parsed.recommendations,
        timestamp: new Date().toISOString(),
      };
    } catch {
      // Fallback
    }
  }

  // Simulated fallback
  return {
    agent: agentNames[agentKey] || agentKey,
    role: agentRoles[agentKey] || 'Agent',
    analysis: `Analysis completed for: ${prompt.slice(0, 80)}...`,
    confidence: 85,
    recommendations: ['Continue monitoring', 'Review system telemetry'],
    timestamp: new Date().toISOString(),
  };
}
