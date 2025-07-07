import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  function ProblemChild() {
    throw new Error('Boom!');
    // eslint-disable-next-line no-unreachable
    return <div />;
  }

  it('renders fallback UI on error', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/boom/i)).toBeInTheDocument();
  });

  it('restores children after retry (remount boundary)', () => {
    function FlakyChild({ fail }: { fail: boolean }) {
      if (fail) throw new Error('Oops!');
      return <div>Safe</div>;
    }
    function TestWrapper() {
      const [fail, setFail] = useState(true);
      const [boundaryKey, setBoundaryKey] = useState(0);
      return (
        <>
          <ErrorBoundary key={boundaryKey}>
            <FlakyChild fail={fail} />
          </ErrorBoundary>
          <button onClick={() => { setFail(false); setBoundaryKey(k => k + 1); }}>Remount</button>
        </>
      );
    }
    render(<TestWrapper />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /remount/i }));
    expect(screen.getByText('Safe')).toBeInTheDocument();
  });
}); 