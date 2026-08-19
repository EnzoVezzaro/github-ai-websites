import type { Tool, ToolResult } from './types';

/**
 * Registry for AI-discoverable tools.
 * Plugins register tools here, and AI agents can discover and invoke them.
 */
class ToolRegistry {
  private tools = new Map<string, Tool>();

  /** Register a tool */
  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /** Register multiple tools */
  registerAll(tools: Tool[]): void {
    for (const tool of tools) {
      this.tools.set(tool.name, tool);
    }
  }

  /** Unregister a tool */
  unregister(name: string): void {
    this.tools.delete(name);
  }

  /** Get a tool by name */
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /** List all registered tools */
  list(): Tool[] {
    return Array.from(this.tools.values());
  }

  /** Get tool schemas for AI consumption (OpenAI function calling format) */
  getSchemas(): Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }> {
    return this.list().map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  /** Invoke a tool by name */
  async invoke(name: string, params: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { success: false, error: `Tool "${name}" not found` };
    }
    try {
      return await tool.execute(params);
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  /** Clear all tools */
  clear(): void {
    this.tools.clear();
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();
