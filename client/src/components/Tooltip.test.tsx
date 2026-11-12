import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('does not show content until hovered', () => {
    render(
      <Tooltip content="Helpful hint">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.queryByText('Helpful hint')).not.toBeInTheDocument();
  });

  it('shows content on mouse enter and hides it on mouse leave', () => {
    render(
      <Tooltip content="Helpful hint">
        <button>Hover me</button>
      </Tooltip>
    );
    const trigger = screen.getByText('Hover me').parentElement as HTMLElement;
    fireEvent.mouseEnter(trigger);
    expect(screen.getByText('Helpful hint')).toBeInTheDocument();
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByText('Helpful hint')).not.toBeInTheDocument();
  });

  it('positions the bubble above the trigger by default', () => {
    render(
      <Tooltip content="Top tip">
        <span>Target</span>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Target').parentElement as HTMLElement);
    const bubble = screen.getByText('Top tip').parentElement as HTMLElement;
    expect(bubble.style.bottom).toBe('calc(100% + 8px)');
  });

  it('positions the bubble to the right when requested', () => {
    render(
      <Tooltip content="Right tip" position="right">
        <span>Target</span>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Target').parentElement as HTMLElement);
    const bubble = screen.getByText('Right tip').parentElement as HTMLElement;
    expect(bubble.style.left).toBe('calc(100% + 8px)');
  });
});
