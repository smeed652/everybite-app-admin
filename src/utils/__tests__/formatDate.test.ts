import { describe, it, expect } from 'vitest';
import { formatDate } from '../formatDate';

describe('formatDate', () => {
  it('formats a date string correctly', () => {
    const date = '2023-01-15';
    const formatted = formatDate(date);
    
    // Check that the formatted date contains the expected parts
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('2023');
    expect(formatted).toMatch(/\w{3} \d{1,2}, \d{4}/);
  });

  it('handles different date formats', () => {
    const date = '2023-12-25T12:00:00Z';
    const formatted = formatDate(date);
    
    // Check that the formatted date contains the expected parts
    expect(formatted).toContain('Dec');
    expect(formatted).toContain('2023');
    expect(formatted).toMatch(/\w{3} \d{1,2}, \d{4}/);
  });
});
