import { useRoasters } from '@/hooks/useRoasters';
import { Combobox, ComboboxOption } from './Combobox';

export function RoasterCombobox({
  value,
  onChange,
  onConfirm,
  onSelect,
}: {
  value: string;
  onChange: (v: string) => void;
  onConfirm: (isNew?: boolean) => void;
  onSelect: (option: ComboboxOption) => void;
}) {
  const { roasters } = useRoasters();
  const options = roasters
    .filter((r) => r.name.toLowerCase().includes(value.toLowerCase()))
    .map((r) => ({ label: r.name, data: { value: r.id } }));

  return (
    <Combobox
      value={value}
      onChange={onChange}
      onSelect={onSelect}
      onConfirm={() => onConfirm()}
      options={options}
      placeholder="e.g. Blue Bottle"
      required
      minChars={1}
      addLabel="Add"
      onAdd={() => onConfirm(true)}
    />
  );
}
