/**
 * Test suite for the Itho Daalderop Amber heat pump device
 * 
 * Run with: npm test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FaultCodes, EntityIds } from '../lib/entities/EntityTypes';

describe('EntityTypes', () => {
  describe('FaultCodes', () => {
    it('should have all protection codes (P01-P13)', () => {
      const protectionCodes = Object.entries(FaultCodes)
        .filter(([_, info]) => info.type === 'protection');
      
      expect(protectionCodes.length).toBeGreaterThanOrEqual(13);
      
      // Check specific codes exist
      const codes = protectionCodes.map(([_, info]) => info.code);
      expect(codes).toContain('P01');
      expect(codes).toContain('P13');
    });

    it('should have all failure codes (F series)', () => {
      const failureCodes = Object.entries(FaultCodes)
        .filter(([_, info]) => info.type === 'failure');
      
      expect(failureCodes.length).toBeGreaterThanOrEqual(20);
    });

    it('should have all error codes (E series)', () => {
      const errorCodes = Object.entries(FaultCodes)
        .filter(([_, info]) => info.type === 'error');
      
      expect(errorCodes.length).toBeGreaterThanOrEqual(8);
    });

    it('should have all status codes (S series)', () => {
      const statusCodes = Object.entries(FaultCodes)
        .filter(([_, info]) => info.type === 'status');
      
      expect(statusCodes.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('EntityIds', () => {
    it('should have system entities', () => {
      expect(EntityIds.SYSTEM_ON_OFF).toBe('system_on_off');
    });

    it('should have mode entities', () => {
      expect(EntityIds.DOMESTIC_HOT_WATER_MODE).toBe('domestic_hot_water_mode');
      expect(EntityIds.HEATING_MODE).toBe('heating_mode');
      expect(EntityIds.COOLING_MODE).toBe('cooling_mode');
      expect(EntityIds.WORKING_MODE).toBe('working_mode');
    });

    it('should have temperature entities', () => {
      expect(EntityIds.AMBIENT_TEMPERATURE).toBe('ambient_temperature');
      expect(EntityIds.DOMESTIC_HOT_WATER_TEMPERATURE).toBe('domestic_hot_water_temperature');
      expect(EntityIds.HEAT_EXCHANGER_WATER_OUTLET_TEMPERATURE).toBe('heat_exchanger_water_outlet_temperature');
    });

    it('should have setpoint entities', () => {
      expect(EntityIds.HEATING_SETPOINT).toBe('heating_setpoint');
      expect(EntityIds.COOLING_SETPOINT).toBe('cooling_setpoint');
      expect(EntityIds.DOMESTIC_HOT_WATER_SETPOINT).toBe('domestic_hot_water_setpoint');
    });

    it('should have relay entities', () => {
      expect(EntityIds.RELAIS_1).toBe('relais_1');
      expect(EntityIds.RELAIS_2).toBe('relais_2');
      expect(EntityIds.RELAIS_3).toBe('relais_3');
      expect(EntityIds.RELAIS_4).toBe('relais_4');
    });

    it('should have heating curve entities', () => {
      expect(EntityIds.HEATING_CURVE_AMBIENT_TEMPERATURE_1).toBe('heating_curve_ambient_temperature_1');
      expect(EntityIds.HEATING_CURVE_WATER_TEMPERATURE_1).toBe('heating_curve_water_temperature_1');
      expect(EntityIds.HEATING_CURVE_AMBIENT_TEMPERATURE_5).toBe('heating_curve_ambient_temperature_5');
      expect(EntityIds.HEATING_CURVE_WATER_TEMPERATURE_5).toBe('heating_curve_water_temperature_5');
    });
  });
});

describe('EspHomeApi', () => {
  // Mock tests for API wrapper
  it('should be importable', async () => {
    const module = await import('../lib/EspHomeApi');
    expect(module.default).toBeDefined();
  });
});
