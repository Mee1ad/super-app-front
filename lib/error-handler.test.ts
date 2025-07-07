import { showErrorToast, showSuccessToast, parseApiError } from './error-handler';
import * as useToastModule from '@/hooks/use-toast';

describe('error-handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show a destructive (red) toast for string error', () => {
    const spy = jest.spyOn(useToastModule, 'toast');
    showErrorToast('Something went wrong');
    // We can't check color directly, but we can check the variant
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      variant: 'destructive',
      title: 'Error',
      description: 'Something went wrong',
    }));
  });

  it('should show a success (green) toast', () => {
    const spy = jest.spyOn(useToastModule, 'toast');
    showSuccessToast('Success!', 'It worked');
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      variant: 'success',
      title: 'Success!',
      description: 'It worked',
    }));
  });

  it('should parse validation error from API', async () => {
    const mockResponse = {
      status: 422,
      statusText: 'Unprocessable Entity',
      json: async () => ({
        detail: [
          { loc: ['field'], msg: 'Field required', type: 'missing' },
        ],
      }),
    } as Response;
    const error = await parseApiError(mockResponse);
    expect(error.status).toBe(422);
    expect(error.message).toContain('field: Field required');
  });
}); 