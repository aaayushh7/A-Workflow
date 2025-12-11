import { http, HttpResponse, delay } from 'msw';
import type { AutomationAction, SimulationResult, Workflow } from '../../models/types';

// Mock automation actions available in the system
const automations: AutomationAction[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    description: 'Send an email notification to specified recipients',
    params: [
      { name: 'to', type: 'string', required: true },
      { name: 'subject', type: 'string', required: true },
      { name: 'body', type: 'string', required: false },
    ],
  },
  {
    id: 'generate_doc',
    label: 'Generate Document',
    description: 'Generate a document from a template',
    params: [
      { name: 'template', type: 'string', required: true },
      { name: 'recipient', type: 'string', required: true },
    ],
  },
  {
    id: 'send_slack',
    label: 'Send Slack Message',
    description: 'Send a message to a Slack channel',
    params: [
      { name: 'channel', type: 'string', required: true },
      { name: 'message', type: 'string', required: true },
    ],
  },
  {
    id: 'create_ticket',
    label: 'Create JIRA Ticket',
    description: 'Create a new JIRA ticket for tracking',
    params: [
      { name: 'project', type: 'string', required: true },
      { name: 'summary', type: 'string', required: true },
      { name: 'priority', type: 'string', required: false },
    ],
  },
  {
    id: 'update_hris',
    label: 'Update HRIS Record',
    description: 'Update employee record in HRIS system',
    params: [
      { name: 'employeeId', type: 'string', required: true },
      { name: 'field', type: 'string', required: true },
      { name: 'value', type: 'string', required: true },
    ],
  },
];

export const handlers = [
  // GET /automations - Returns list of available automation actions
  http.get('/automations', async () => {
    await delay(200);
    return HttpResponse.json(automations);
  }),

  // POST /simulate - Simulates workflow execution
  http.post('/simulate', async ({ request }) => {
    await delay(800);
    
    try {
      const body = await request.json() as { workflow: Workflow };
      const workflow = body.workflow;
      
      if (!workflow || !workflow.nodes || !Array.isArray(workflow.nodes)) {
        return HttpResponse.json(
          { status: 'error', error: 'Invalid workflow structure', execution: [] },
          { status: 400 }
        );
      }

      // Simulate each node in order
      const execution: SimulationResult['execution'] = workflow.nodes.map((node) => {
        const title = node.data?.title ?? `${node.type}-${node.id}`;
        const timestamp = new Date().toISOString();
        
        switch (node.type) {
          case 'start':
            return {
              nodeId: node.id,
              nodeType: 'start' as const,
              status: 'completed' as const,
              message: `Workflow started: "${title}"`,
              timestamp,
            };
            
          case 'task':
            const assignee = (node.data as Record<string, unknown>)?.assignee as string | undefined;
            return {
              nodeId: node.id,
              nodeType: 'task' as const,
              status: 'completed' as const,
              message: assignee 
                ? `Task "${title}" assigned to ${assignee} - completed`
                : `Task "${title}" completed`,
              timestamp,
            };
            
          case 'approval':
            const threshold = (node.data as Record<string, unknown>)?.autoApproveThreshold as number | undefined;
            const autoApproved = threshold && threshold > 0;
            const approverRole = (node.data as Record<string, unknown>)?.approverRole as string | undefined;
            return {
              nodeId: node.id,
              nodeType: 'approval' as const,
              status: autoApproved ? 'approved' as const : 'awaiting_manual_approval' as const,
              message: autoApproved
                ? `"${title}" auto-approved (threshold: ${threshold})`
                : `"${title}" requires manual approval from ${approverRole ?? 'approver'}`,
              timestamp,
            };
            
          case 'automated':
            const actionId = (node.data as Record<string, unknown>)?.actionId as string | undefined;
            const action = automations.find(a => a.id === actionId);
            return {
              nodeId: node.id,
              nodeType: 'automated' as const,
              status: 'executed' as const,
              message: action
                ? `Executed "${action.label}" for "${title}"`
                : `Executed automated step "${title}"`,
              timestamp,
            };
            
          case 'end':
            const endMessage = (node.data as Record<string, unknown>)?.message as string | undefined;
            return {
              nodeId: node.id,
              nodeType: 'end' as const,
              status: 'completed' as const,
              message: endMessage || `Workflow ended: "${title}"`,
              timestamp,
            };
            
          default:
            return {
              nodeId: node.id,
              nodeType: node.type as 'task',
              status: 'completed' as const,
              message: `Processed node "${title}"`,
              timestamp,
            };
        }
      });

      const result: SimulationResult = {
        status: 'ok',
        execution,
      };
      
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json(
        { status: 'error', error: 'Failed to parse workflow', execution: [] },
        { status: 400 }
      );
    }
  }),
];

