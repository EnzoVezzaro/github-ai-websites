import { toolRegistry } from '../plugins/toolRegistry';
import type { ToolResult } from '../plugins/types';

/**
 * MCP (Model Context Protocol) Server for AI agents.
 * Exposes the tool registry via a simple HTTP API.
 */

interface MCPRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

const SERVER_PORT = 7600;

/**
 * Handle an MCP request
 */
async function handleRequest(req: MCPRequest): Promise<MCPResponse> {
  const { id, method, params } = req;

  try {
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: { listChanged: false },
            },
            serverInfo: {
              name: 'github-ai-websites',
              version: '1.0.0',
            },
          },
        };

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: toolRegistry.getSchemas().map(schema => ({
              name: schema.function.name,
              description: schema.function.description,
              inputSchema: schema.function.parameters,
            })),
          },
        };

      case 'tools/call': {
        const { name, arguments: args } = params as { name: string; arguments: Record<string, unknown> };
        const result: ToolResult = await toolRegistry.invoke(name, args || {});
        
        if (result.success) {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result.data),
                },
              ],
            },
          };
        } else {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32000,
              message: result.error || 'Tool execution failed',
            },
          };
        }
      }

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`,
          },
        };
    }
  } catch (err) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: String(err),
      },
    };
  }
}

/**
 * Start the MCP server
 */
export function startMCPServer(_port = SERVER_PORT): void {
  // For browser environments, we expose a global handler
  // In production, this would be a proper HTTP server
  if (typeof window !== 'undefined') {
    (window as any).__mcpHandler = handleRequest;
    console.log(`[MCP] Handler registered. Use window.__mcpHandler(request) to invoke.`);
    console.log(`[MCP] Available tools: ${toolRegistry.list().map(t => t.name).join(', ')}`);
  }
}

/**
 * Send an MCP request (for client-side use)
 */
export async function mcpRequest(request: MCPRequest): Promise<MCPResponse> {
  const handler = (window as any).__mcpHandler;
  if (!handler) {
    return {
      jsonrpc: '2.0',
      id: request.id,
      error: { code: -32000, message: 'MCP server not running' },
    };
  }
  return handler(request);
}

/**
 * List available MCP tools
 */
export function mcpListTools(): Promise<MCPResponse> {
  return mcpRequest({
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/list',
  });
}

/**
 * Call an MCP tool
 */
export function mcpCallTool(name: string, args: Record<string, unknown>): Promise<MCPResponse> {
  return mcpRequest({
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: { name, arguments: args },
  });
}
