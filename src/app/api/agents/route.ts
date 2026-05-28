import { NextResponse } from 'next/server';
import { db, seedDatabase, persistTerminalLog } from '@/lib/db';
import { runSingleAgent, isAzureOpenAIConfigured } from '@/lib/azureOpenAi';
import { pushStreamEvent } from '@/lib/stream';

export async function GET() {
  // Ensure database is seeded
  await seedDatabase();

  // Advance simulation on each poll/request!
  db.commands.forEach((cmd) => {
    if (cmd.status === 'executing') {
      // Find the specific agent associated with this command
      const agent = db.agents.find(a => cmd.command.includes(a.agent_name));
      // If the agent is offline, pause its command progression!
      if (agent && agent.status === 'offline') {
        return;
      }

      const increment = Math.floor(Math.random() * 15) + 10; // 10-25% progress per poll
      cmd.progress = Math.min(100, cmd.progress + increment);
      
      if (cmd.progress === 100) {
        cmd.status = 'completed';
        
        // Find agent and restore to idle
        const agentToRestore = agent || db.agents.find(a => cmd.command.includes(a.agent_name) || a.status === 'active' || a.status === 'investigating');
        if (agentToRestore && agentToRestore.status !== 'offline') {
          agentToRestore.status = 'idle';
          agentToRestore.current_task = 'Ready for incident response';
          agentToRestore.success_rate = Math.min(100, (agentToRestore.success_rate || 90) + 1);
          agentToRestore.incidents_handled = (agentToRestore.incidents_handled || 0) + 1;
        }

        // Add success log
        const successLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: agentToRestore?.agent_name || 'Swarm Orchestrator',
          status: 'success' as const,
          message: `Execution complete: ${cmd.command}`
        };
        db.terminalLogs.unshift(successLog);

        // Push to SSE
        pushStreamEvent({
          type: 'terminal_log',
          data: successLog,
          timestamp: new Date().toISOString(),
        });
        pushStreamEvent({
          type: 'agent_status',
          data: { agentName: agentToRestore?.agent_name, status: agentToRestore?.status || 'idle' },
          timestamp: new Date().toISOString(),
        });

        persistTerminalLog(successLog);
      }
    } else if (cmd.status === 'pending') {
      // Check if there are no executing ones, then promote this one
      const anyExecuting = db.commands.some(c => c.status === 'executing');
      if (!anyExecuting) {
        // Find agent associated with the pending command
        const agent = db.agents.find(a => cmd.command.includes(a.agent_name));
        // If agent is offline, don't execute yet
        if (agent && agent.status === 'offline') {
          return;
        }

        cmd.status = 'executing';
        cmd.progress = 10;
        
        const dequeueLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Swarm Orchestrator',
          status: 'info' as const,
          message: `De-queued operations request: ${cmd.command}`
        };
        db.terminalLogs.unshift(dequeueLog);
        pushStreamEvent({ type: 'terminal_log', data: dequeueLog, timestamp: new Date().toISOString() });
        persistTerminalLog(dequeueLog);
      }
    }
  });

  return NextResponse.json({
    agents: db.agents,
    terminalLogs: db.terminalLogs,
    commands: db.commands,
    aiMode: isAzureOpenAIConfigured() ? 'live' : 'simulated',
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, command, agentName } = body;

    // Support control actions: stop_all, continue_all, toggle_agent
    if (action === 'stop_all') {
      db.agents.forEach(agent => {
        agent.status = 'offline';
        agent.current_task = 'Suspended by operator';
      });

      const stopLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Swarm Orchestrator',
        status: 'warning' as const,
        message: 'All swarm agents suspended (OFFLINE) by central operations.'
      };
      db.terminalLogs.unshift(stopLog);
      pushStreamEvent({ type: 'terminal_log', data: stopLog, timestamp: new Date().toISOString() });
      persistTerminalLog(stopLog);

      db.agents.forEach(a => {
        pushStreamEvent({
          type: 'agent_status',
          data: { agentName: a.agent_name, status: 'offline', task: 'Suspended by operator' },
          timestamp: new Date().toISOString(),
        });
      });

      return NextResponse.json({
        success: true,
        agents: db.agents,
        terminalLogs: db.terminalLogs,
      });
    }

    if (action === 'continue_all') {
      db.agents.forEach(agent => {
        // Find if this agent has active commands running
        const hasActiveCmd = db.commands.some(c => c.status === 'executing' && c.command.includes(agent.agent_name));
        if (hasActiveCmd) {
          agent.status = 'active';
          agent.current_task = 'Resuming telemetry triage';
        } else {
          agent.status = 'idle';
          agent.current_task = 'Ready for incident response';
        }
      });

      const resumeLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Swarm Orchestrator',
        status: 'success' as const,
        message: 'All swarm agents resumed (ONLINE) by central operations.'
      };
      db.terminalLogs.unshift(resumeLog);
      pushStreamEvent({ type: 'terminal_log', data: resumeLog, timestamp: new Date().toISOString() });
      persistTerminalLog(resumeLog);

      db.agents.forEach(a => {
        pushStreamEvent({
          type: 'agent_status',
          data: { agentName: a.agent_name, status: a.status, task: a.current_task },
          timestamp: new Date().toISOString(),
        });
      });

      return NextResponse.json({
        success: true,
        agents: db.agents,
        terminalLogs: db.terminalLogs,
      });
    }

    if (action === 'toggle_agent') {
      if (!agentName) {
        return NextResponse.json({ error: 'Missing agentName' }, { status: 400 });
      }

      const agent = db.agents.find(a => a.agent_name === agentName);
      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }

      const isOffline = agent.status === 'offline';
      if (isOffline) {
        // Resume the agent
        const hasActiveCmd = db.commands.some(c => c.status === 'executing' && c.command.includes(agent.agent_name));
        if (hasActiveCmd) {
          agent.status = 'active';
          agent.current_task = 'Resuming telemetry triage';
        } else {
          agent.status = 'idle';
          agent.current_task = 'Ready for incident response';
        }

        const toggleLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Swarm Orchestrator',
          status: 'success' as const,
          message: `Swarm agent [${agent.agent_name}] has been resumed (ONLINE).`
        };
        db.terminalLogs.unshift(toggleLog);
        pushStreamEvent({ type: 'terminal_log', data: toggleLog, timestamp: new Date().toISOString() });
        persistTerminalLog(toggleLog);
      } else {
        // Suspend the agent
        agent.status = 'offline';
        agent.current_task = 'Suspended by operator';

        const toggleLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Swarm Orchestrator',
          status: 'warning' as const,
          message: `Swarm agent [${agent.agent_name}] has been suspended (OFFLINE).`
        };
        db.terminalLogs.unshift(toggleLog);
        pushStreamEvent({ type: 'terminal_log', data: toggleLog, timestamp: new Date().toISOString() });
        persistTerminalLog(toggleLog);
      }

      pushStreamEvent({
        type: 'agent_status',
        data: { agentName: agent.agent_name, status: agent.status, task: agent.current_task },
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        agents: db.agents,
        terminalLogs: db.terminalLogs,
      });
    }

    if (!command) {
      return NextResponse.json({ error: 'Missing command' }, { status: 400 });
    }

    // Pick target agent or default to first idle agent
    let targetAgent = db.agents.find(a => a.agent_name === agentName);
    if (!targetAgent) {
      targetAgent = db.agents.find(a => a.status === 'idle') || db.agents[0];
    }

    // Modify agent status
    targetAgent.status = 'active';
    targetAgent.current_task = `Executing command: ${command}`;

    // Add command to queue
    const id = `cmd-${Date.now()}`;
    const newCmd = {
      id,
      command: `[${targetAgent.agent_name}] ${command}`,
      status: 'executing' as const,
      progress: 0,
      timestamp: new Date().toLocaleTimeString(),
      affectedAgents: 1
    };

    db.commands.unshift(newCmd);

    // Add log
    const cmdLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      agent: targetAgent.agent_name,
      status: 'info' as const,
      message: `Triggered command: ${command}`
    };
    db.terminalLogs.unshift(cmdLog);

    // Push to SSE
    pushStreamEvent({ type: 'terminal_log', data: cmdLog, timestamp: new Date().toISOString() });
    pushStreamEvent({
      type: 'agent_status',
      data: { agentName: targetAgent.agent_name, status: 'active', task: command },
      timestamp: new Date().toISOString(),
    });

    persistTerminalLog(cmdLog);

    // ─── Run AI agent analysis (async, non-blocking) ─────────────────────
    const agentKeyMap: Record<string, string> = {
      'AutoScaler-Alpha': 'analyzer',
      'MemoryOptimizer-Beta': 'rootcause',
      'HealthMonitor-Gamma': 'prediction',
      'NetworkDefense-Delta': 'security',
      'ResponseUnit-Epsilon': 'remediation',
      'TelemetryStreamer-Zeta': 'telemetry',
    };

    const agentKey = agentKeyMap[targetAgent.agent_name] || 'analyzer';

    runSingleAgent(agentKey, command).then((result) => {
      const aiLog = {
        id: `log-${Date.now()}-ai`,
        timestamp: new Date().toLocaleTimeString(),
        agent: result.agent,
        status: (result.confidence > 85 ? 'success' : 'info') as 'success' | 'info',
        message: `[AI] ${result.analysis} (Confidence: ${result.confidence}%)`,
      };
      db.terminalLogs.unshift(aiLog);
      pushStreamEvent({ type: 'terminal_log', data: aiLog, timestamp: new Date().toISOString() });
      persistTerminalLog(aiLog);
    }).catch((err) => {
      console.error('[Agent AI Error]', err);
    });

    return NextResponse.json({
      success: true,
      command: newCmd,
      agents: db.agents,
      aiMode: isAzureOpenAIConfigured() ? 'live' : 'simulated',
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to execute: ' + String(err) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
