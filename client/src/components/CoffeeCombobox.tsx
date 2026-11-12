import { Combobox, ComboboxOption } from './Combobox';
import { useCoffees } from '@/hooks/useCoffees';

export function CoffeeCombobox({
  roasterId,
  value,
  onChange,
  onConfirm,
  onSelect,
}: {
  roasterId: number;
  value: string;
  onChange: (v: string) => void;
  onConfirm: (isNew?: boolean) => void;
  onSelect: (option: ComboboxOption) => void;
}) {
  const { coffees } = useCoffees(roasterId);
  const options = coffees
    .filter((r) => r.name.toLowerCase().includes(value.toLowerCase()))
    .map((r) => ({ label: r.name, data: { value: r.id } }));

  return (
    <Combobox
      value={value}
      onChange={onChange}
      onSelect={onSelect}
      onConfirm={() => onConfirm()}
      options={options}
      placeholder="e.g. Ethiopia Yirgacheffe"
      required
      minChars={1}
      addLabel="Add"
      onAdd={() => onConfirm(true)}
    />
  );
}
