import { useState } from 'react';

export type EnchantmentOption = {
  enchantmentName: string;
  enchantmentEffectBrief: string;
};

type EnchantmentSelectProps = {
  enchantments: EnchantmentOption[];
  id: string;
  label: string;
  value: string;
  onChange: (nextEnchantmentName: string) => void;
};

function EnchantmentSelect({
  enchantments,
  id,
  label,
  value,
  onChange,
}: EnchantmentSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewName, setPreviewName] = useState(value);
  const selectedEnchantment = enchantments.find(
    (enchantment) => enchantment.enchantmentName === value,
  );
  const previewEnchantment = enchantments.find(
    (enchantment) => enchantment.enchantmentName === previewName,
  );
  const displayedEnchantment = previewEnchantment ?? selectedEnchantment;

  function closeDropdown() {
    setIsOpen(false);
    setPreviewName(value);
  }

  return (
    <div className="enchantment-select-wrap">
      <span className="enchantment-label" id={`${id}-label`}>
        {label}
      </span>
      <button
        type="button"
        className="enchantment-select-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}-trigger`}
        id={`${id}-trigger`}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) {
            closeDropdown();
          }
        }}
        onClick={() => {
          setPreviewName(value);
          setIsOpen((currentOpenState) => !currentOpenState);
        }}
      >
        {value || 'No enchantment'}
      </button>
      {isOpen && (
        <div
          className="enchantment-options"
          role="listbox"
          aria-labelledby={`${id}-label`}
          tabIndex={-1}
          onBlur={(event) => {
            if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) {
              closeDropdown();
            }
          }}
        >
          <button
            type="button"
            className={!value ? 'active' : ''}
            role="option"
            aria-selected={!value}
            onFocus={() => setPreviewName('')}
            onMouseEnter={() => setPreviewName('')}
            onClick={() => {
              onChange('');
              setPreviewName('');
              setIsOpen(false);
            }}
          >
            No enchantment
          </button>
          {enchantments.map((enchantment) => (
            <button
              type="button"
              className={value === enchantment.enchantmentName ? 'active' : ''}
              key={enchantment.enchantmentName}
              role="option"
              aria-selected={value === enchantment.enchantmentName}
              onFocus={() => setPreviewName(enchantment.enchantmentName)}
              onMouseEnter={() => setPreviewName(enchantment.enchantmentName)}
              onClick={() => {
                onChange(enchantment.enchantmentName);
                setPreviewName(enchantment.enchantmentName);
                setIsOpen(false);
              }}
            >
              {enchantment.enchantmentName}
            </button>
          ))}
        </div>
      )}
      {displayedEnchantment && (
        <aside className="enchantment-hover-card" aria-live="polite">
          {displayedEnchantment.enchantmentEffectBrief}
        </aside>
      )}
    </div>
  );
}

export default EnchantmentSelect;
