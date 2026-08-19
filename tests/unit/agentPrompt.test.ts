import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, ZONE_CONSTRAINTS } from '../../src/lib/agentPrompt';
import type { AgentConfig, MCPConnection } from '../../src/lib/settings';

describe('agentPrompt', () => {
  describe('ZONE_CONSTRAINTS', () => {
    it('is a non-empty string', () => {
      expect(ZONE_CONSTRAINTS).toBeTruthy();
      expect(typeof ZONE_CONSTRAINTS).toBe('string');
    });

    it('mentions all 5 zone types', () => {
      expect(ZONE_CONSTRAINTS).toContain('data-zone="intro"');
      expect(ZONE_CONSTRAINTS).toContain('data-zone="story"');
      expect(ZONE_CONSTRAINTS).toContain('data-zone="ideas"');
      expect(ZONE_CONSTRAINTS).toContain('data-zone="media"');
      expect(ZONE_CONSTRAINTS).toContain('data-zone="closing"');
    });

    it('contains the critical constraint rules', () => {
      expect(ZONE_CONSTRAINTS).toContain('NEVER');
      expect(ZONE_CONSTRAINTS).toContain('MANDATORY');
    });
  });

  describe('buildSystemPrompt', () => {
    it('returns base prompt with no args', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('GitHub AI Web Forge');
      expect(prompt).toContain('universe');
      expect(prompt).toContain('CRITICAL ZONE CONTAINER RULES');
      expect(prompt).toContain('OUTPUT FORMAT');
    });

    it('includes user custom instructions', () => {
      const config: AgentConfig = {
        systemPrompt: 'Use only red and blue colors',
        selectedMCPs: [],
        selectedSkills: [],
        temperature: 0.7,
        maxTokens: 4096,
      };
      const prompt = buildSystemPrompt(config);
      expect(prompt).toContain('USER CUSTOM INSTRUCTIONS');
      expect(prompt).toContain('Use only red and blue colors');
    });

    it('includes selected skills', () => {
      const config: AgentConfig = {
        selectedMCPs: [],
        selectedSkills: ['text-layout', 'style-80s'],
        temperature: 0.7,
        maxTokens: 4096,
      };
      const prompt = buildSystemPrompt(config);
      expect(prompt).toContain('ACTIVE SKILLS');
      expect(prompt).toContain('text-layout');
      expect(prompt).toContain('style-80s');
    });

    it('includes enabled MCP connections', () => {
      const mcps: MCPConnection[] = [
        { id: '1', name: 'Code MCP', url: 'http://localhost:3000', enabled: true },
        { id: '2', name: 'Disabled MCP', url: 'http://localhost:4000', enabled: false },
      ];
      const prompt = buildSystemPrompt(undefined, mcps);
      expect(prompt).toContain('MCP CONNECTIONS');
      expect(prompt).toContain('Code MCP');
      expect(prompt).not.toContain('Disabled MCP');
    });

    it('does not include MCP section when no enabled connections', () => {
      const mcps: MCPConnection[] = [
        { id: '1', name: 'Off', url: 'http://localhost:3000', enabled: false },
      ];
      const prompt = buildSystemPrompt(undefined, mcps);
      expect(prompt).not.toContain('MCP CONNECTIONS');
    });

    it('does not include MCP section when empty array', () => {
      const prompt = buildSystemPrompt(undefined, []);
      expect(prompt).not.toContain('MCP CONNECTIONS');
    });

    it('combines custom instructions + skills + MCPs', () => {
      const config: AgentConfig = {
        systemPrompt: 'Be creative',
        selectedMCPs: [],
        selectedSkills: ['animations'],
        temperature: 0.7,
        maxTokens: 4096,
      };
      const mcps: MCPConnection[] = [
        { id: '1', name: 'Tool MCP', url: 'http://localhost:3000', enabled: true },
      ];
      const prompt = buildSystemPrompt(config, mcps);
      expect(prompt).toContain('USER CUSTOM INSTRUCTIONS');
      expect(prompt).toContain('ACTIVE SKILLS');
      expect(prompt).toContain('MCP CONNECTIONS');
    });
  });
});
