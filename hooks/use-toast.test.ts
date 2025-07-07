import { toast } from './use-toast';

describe('toast', () => {
  it('should add a toast with correct props', () => {
    const result = toast({ title: 'Test', description: 'Desc', variant: 'success' });
    expect(result).toHaveProperty('id');
    // No error thrown
  });

  it('should allow dismissing a toast', () => {
    const result = toast({ title: 'Dismiss', variant: 'info' });
    expect(() => result.dismiss()).not.toThrow();
  });

  it('should allow updating a toast', () => {
    const result = toast({ title: 'Update', variant: 'warning' });
    expect(() => result.update({ title: 'Updated', id: result.id })).not.toThrow();
  });
}); 