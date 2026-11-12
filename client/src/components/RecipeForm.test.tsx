import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecipeForm } from './RecipeForm';

function setup(props: Partial<React.ComponentProps<typeof RecipeForm>> = {}) {
  const onSubmit = jest.fn().mockResolvedValue(true);
  const onCancel = jest.fn();
  render(<RecipeForm onSubmit={onSubmit} onCancel={onCancel} {...props} />);
  return { onSubmit, onCancel };
}

const titleInput = () => screen.getByPlaceholderText('e.g., Classic Pour Over');
const submit = () => screen.getByRole('button', { name: 'Create' });

describe('RecipeForm', () => {
  it('keeps submit disabled until a title and phase names are entered', () => {
    setup();
    expect(submit()).toBeDisabled();
    fireEvent.change(titleInput(), { target: { value: 'V60' } });
    expect(submit()).toBeDisabled(); // first phase still has no name
    fireEvent.change(screen.getByPlaceholderText('e.g., Bloom'), {
      target: { value: 'Bloom' },
    });
    expect(submit()).toBeEnabled();
  });

  it('submits the recipe with numeric fields converted', async () => {
    const { onSubmit, onCancel } = setup();
    fireEvent.change(titleInput(), { target: { value: 'V60' } });
    fireEvent.change(screen.getByPlaceholderText('e.g., Bloom'), {
      target: { value: 'Bloom' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g., 20'), { target: { value: '20' } });
    fireEvent.change(screen.getByPlaceholderText('e.g., 180'), { target: { value: '180' } });
    fireEvent.change(screen.getByPlaceholderText('e.g., 195'), { target: { value: '94' } });
    fireEvent.change(screen.getByPlaceholderText('e.g., 50'), { target: { value: '40' } });
    fireEvent.click(submit());

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'V60',
        dose: 20,
        brewTime: 180,
        phases: [expect.objectContaining({ name: 'Bloom', waterTemp: 94, waterAmount: 40 })],
      })
    );
    await waitFor(() => expect(onCancel).toHaveBeenCalled());
  });

  it('does not close when the submit fails', async () => {
    const onSubmit = jest.fn().mockResolvedValue(false);
    const onCancel = jest.fn();
    render(<RecipeForm onSubmit={onSubmit} onCancel={onCancel} />);
    fireEvent.change(titleInput(), { target: { value: 'V60' } });
    fireEvent.change(screen.getByPlaceholderText('e.g., Bloom'), { target: { value: 'Bloom' } });
    fireEvent.click(submit());
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('adds and removes phases', () => {
    setup();
    expect(screen.getAllByText(/^Phase \d+$/)).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: '+ Add Phase' }));
    expect(screen.getAllByText(/^Phase \d+$/)).toHaveLength(2);
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0]);
    expect(screen.getAllByText(/^Phase \d+$/)).toHaveLength(1);
  });

  it('does not offer removing the only phase', () => {
    setup();
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('switches grind size to microns and shows a number input', () => {
    setup();
    expect(screen.getByRole('option', { name: 'Medium' })).toBeInTheDocument();
    // The toggle is the switch between the "Standard" and "Microns" labels.
    const toggle = screen.getByText('Microns (µm)').parentElement!.querySelector('button') as HTMLElement;
    fireEvent.click(toggle);
    expect(screen.getByPlaceholderText('e.g., 200')).toBeInTheDocument();
  });

  it('pre-fills from initialValues', () => {
    setup({
      submitLabel: 'Save',
      initialValues: {
        title: 'French Press',
        description: '',
        brewMethod: 'FrenchPress',
        phases: [{ name: 'Steep', waterTemp: 92, waterAmount: 300 }],
        dose: 30,
        waterMl: 500,
      } as any,
    });
    expect(screen.getByDisplayValue('French Press')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Steep')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('hides its own buttons in inline mode', () => {
    setup({ inline: true });
    expect(screen.queryByRole('button', { name: 'Create' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('calls onCancel from the Cancel button', () => {
    const { onCancel } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
