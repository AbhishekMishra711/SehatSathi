import { describe, it, expect } from 'vitest';
const { evaluateDoseEscalation } = require('../server/services/escalation');

describe('Escalation Logic Unit Tests', () => {
  const baseScheduledTime = new Date('2026-11-15T08:00:00.000Z');
  const graceMinutes = 15;

  it('should return NONE if the dose is already taken', () => {
    const dose = {
      status: 'TAKEN',
      scheduledFor: baseScheduledTime,
      escalationLevel: 0
    };
    const now = new Date('2026-11-15T08:30:00.000Z');
    expect(evaluateDoseEscalation(dose, graceMinutes, now)).toBe('NONE');
  });

  it('should return NONE before scheduled dose time', () => {
    const dose = {
      status: 'PENDING',
      scheduledFor: baseScheduledTime,
      escalationLevel: 0
    };
    const now = new Date('2026-11-15T07:55:00.000Z');
    expect(evaluateDoseEscalation(dose, graceMinutes, now)).toBe('NONE');
  });

  it('should trigger REMIND_ELDER at or past scheduled time when escalationLevel is 0', () => {
    const dose = {
      status: 'PENDING',
      scheduledFor: baseScheduledTime,
      escalationLevel: 0
    };
    const now = new Date('2026-11-15T08:01:00.000Z');
    expect(evaluateDoseEscalation(dose, graceMinutes, now)).toBe('REMIND_ELDER');
  });

  it('should trigger ALERT_CARETAKER when grace period has expired and escalationLevel is 1', () => {
    const dose = {
      status: 'PENDING',
      scheduledFor: baseScheduledTime,
      escalationLevel: 1
    };
    // 16 minutes after scheduled time (grace period is 15 minutes)
    const now = new Date('2026-11-15T08:16:00.000Z');
    expect(evaluateDoseEscalation(dose, graceMinutes, now)).toBe('ALERT_CARETAKER');
  });

  it('should return NONE during the active grace period when escalationLevel is 1', () => {
    const dose = {
      status: 'PENDING',
      scheduledFor: baseScheduledTime,
      escalationLevel: 1
    };
    // 10 minutes after scheduled time (still within 15 min grace)
    const now = new Date('2026-11-15T08:10:00.000Z');
    expect(evaluateDoseEscalation(dose, graceMinutes, now)).toBe('NONE');
  });

  it('should trigger ALERT_FAMILY when double grace period has expired and escalationLevel is 2', () => {
    const dose = {
      status: 'MISSED',
      scheduledFor: baseScheduledTime,
      escalationLevel: 2
    };
    // 31 minutes after scheduled time (2 * grace period = 30 mins)
    const now = new Date('2026-11-15T08:31:00.000Z');
    expect(evaluateDoseEscalation(dose, graceMinutes, now)).toBe('ALERT_FAMILY');
  });

  it('should return NONE when escalation has reached maximum level (3)', () => {
    const dose = {
      status: 'MISSED',
      scheduledFor: baseScheduledTime,
      escalationLevel: 3
    };
    const now = new Date('2026-11-15T09:00:00.000Z');
    expect(evaluateDoseEscalation(dose, graceMinutes, now)).toBe('NONE');
  });
});
