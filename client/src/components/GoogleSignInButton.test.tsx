import { render, screen, fireEvent } from '@testing-library/react';
import { GoogleSignInButton } from './GoogleSignInButton';

// Replace the Google widget with a plain button that lets the test choose
// which credential response to send.
jest.mock('@react-oauth/google', () => ({
  GoogleLogin: ({
    onSuccess,
    onError,
  }: {
    onSuccess: (r: { credential?: string }) => void;
    onError: () => void;
  }) => (
    <div>
      <button onClick={() => onSuccess({ credential: 'id-token-123' })}>
        good
      </button>
      <button onClick={() => onSuccess({})}>no-credential</button>
      <button onClick={() => onError()}>fail</button>
    </div>
  ),
}));

describe('GoogleSignInButton', () => {
  it('passes the credential to onSuccess', () => {
    const onSuccess = jest.fn();
    render(<GoogleSignInButton onSuccess={onSuccess} />);
    fireEvent.click(screen.getByText('good'));
    expect(onSuccess).toHaveBeenCalledWith('id-token-123');
  });

  it('ignores responses without a credential', () => {
    const onSuccess = jest.fn();
    render(<GoogleSignInButton onSuccess={onSuccess} />);
    fireEvent.click(screen.getByText('no-credential'));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onError when the Google widget fails', () => {
    const onError = jest.fn();
    render(<GoogleSignInButton onSuccess={() => {}} onError={onError} />);
    fireEvent.click(screen.getByText('fail'));
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('does not throw when onError is not provided', () => {
    render(<GoogleSignInButton onSuccess={() => {}} />);
    expect(() => fireEvent.click(screen.getByText('fail'))).not.toThrow();
  });
});
