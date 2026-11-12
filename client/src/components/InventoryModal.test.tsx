import { render, screen, fireEvent } from '@testing-library/react';
import { InventoryModal } from './InventoryModal';

describe('InventoryModal', () => {
  it('shows the add heading by default', () => {
    render(<InventoryModal onSubmit={jest.fn()} onCancel={() => {}} />);
    expect(
      screen.getByRole('heading', { name: 'Add to Inventory' })
    ).toBeInTheDocument();
  });

  it('shows an edit heading in edit mode', () => {
    render(
      <InventoryModal mode="edit" onSubmit={jest.fn()} onCancel={() => {}} />
    );
    expect(
      screen.getByRole('heading', { name: 'Edit Inventory' })
    ).toBeInTheDocument();
  });

  it('shows a duplicate heading in duplicate mode', () => {
    render(
      <InventoryModal
        mode="duplicate"
        onSubmit={jest.fn()}
        onCancel={() => {}}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Duplicate Inventory' })
    ).toBeInTheDocument();
  });

  it('submits undefined when no roast date is entered', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<InventoryModal onSubmit={onSubmit} onCancel={() => {}} />);
    fireEvent.submit(screen.getByRole('button', { name: 'Add to Inventory' }).closest('form')!);
    expect(onSubmit).toHaveBeenCalledWith(undefined);
  });

  it('submits a Date built from the roast date input', () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<InventoryModal onSubmit={onSubmit} onCancel={() => {}} />);
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2026-05-01' } });
    fireEvent.submit(input.closest('form')!);
    const sent = onSubmit.mock.calls[0][0] as Date;
    expect(sent).toBeInstanceOf(Date);
    expect(sent.toISOString().slice(0, 10)).toBe('2026-05-01');
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = jest.fn();
    render(<InventoryModal onSubmit={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
