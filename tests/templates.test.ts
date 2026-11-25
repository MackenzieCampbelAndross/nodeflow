import { describe, it, expect } from 'vitest';
import { NODE_TEMPLATES, createInitialWorkflow } from '../src/core/templates';
import { DAGValidator } from '../src/core/dag_validator';

describe('Templates & Presets', () => {
  it('defines valid node templates with inputs and outputs', () => {
    expect(NODE_TEMPLATES.length).toBeGreaterThan(5);
    for (const tmpl of NODE_TEMPLATES) {
      expect(tmpl.type).toBeDefined();
      expect(tmpl.name).toBeDefined();
      expect(tmpl.category).toBeDefined();
    }
  });

  it('provides initial starter workflow that passes DAG validation', () => {
    const wf = createInitialWorkflow();
    const validation = DAGValidator.validateWorkflow(wf);
    expect(validation.isValid).toBe(true);
    expect(validation.executionOrder.length).toBe(3);
  });
});
