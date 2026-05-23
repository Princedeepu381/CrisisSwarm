import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  // Advance simulation on each poll/request!
  db.commands.forEach((cmd) => {
    if (cmd.status === 'executing') {
      const increment = Math.floor(Math.random() * 15) + 10; // 10-25% progress per poll
      cmd.progress = Math.min(100, cmd.progress + increment);
      
      if (cmd.progress === 100) {
        cmd.status = 'completed';
        
        // Find agent and restore to idle
        const agent = db.agents.find(a => cmd.command.includes(a.agent_name) || a.status === 'active' || a.status === 'investigating');
        if (agent) {
          agent.status = 'idle';
          agent.current_task = 'Ready for incident response';
          agent.success_rate = Math.min(100, agent.success_rate + 1);
          agent.incidents_handled += 1;
        }

        // Add success log
        db.terminalLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: agent?.agent_name || 'Swarm Orchestrator',
          status: 'success',
          message: `Execution complete: ${cmd.command}`
        });
      }
    } else if (cmd.status === 'pending') {
      // Check if there are no executing ones, then promote this one
      const anyExecuting = db.commands.some(c => c.status === 'executing');
      if (!anyExecuting) {
        cmd.status = 'executing';
        cmd.progress = 10;
        
        db.terminalLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Swarm Orchestrator',
          status: 'info',
          message: `De-queued operations request: ${cmd.command}`
        });
      }
    }
  });

  return NextResponse.json({
    agents: db.agents,
    terminalLogs: db.terminalLogs,
    commands: db.commands
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { command, agentName } = body;

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
    db.terminalLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      agent: targetAgent.agent_name,
      status: 'info',
      message: `Triggered command: ${command}`
    });

    return NextResponse.json({
      success: true,
      command: newCmd,
      agents: db.agents
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to execute: ' + String(err) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
