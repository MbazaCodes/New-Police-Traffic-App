import { describe, expect, it, vi } from 'vitest';

import { CONFIG } from '../config';

describe('simulation wiring', () => {
    it('exposes the expected runtime config', () => {
        expect(CONFIG.simulation).toBe(true);
        expect(CONFIG.offline).toBe(true);
        expect(CONFIG.sync).toBe(true);
        expect(CONFIG.mockDatabase).toBe('../Mock Database');
    });

    it('starts the engine entrypoint', async () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

        await import('../engine/engine');

        expect(logSpy).toHaveBeenCalledWith('Simulation Started');
        logSpy.mockRestore();
    });
});