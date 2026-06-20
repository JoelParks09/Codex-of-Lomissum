import { MouseEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';

export type EnchantmentOption = {
  action: string;
  description: string;
  name: string;
};

type EnchantmentSelectProps = {
  actionColumnLabel?: string;
  emptyLabel?: string;
  hideLabel?: boolean;
  id: string;
  label: string;
  nameColumnLabel?: string;
  options: EnchantmentOption[];
  value: string;
  onChange: (nextValue: string) => void;
};

function EnchantmentSelect({
  actionColumnLabel = 'Action',
  emptyLabel = 'No enchantment',
  hideLabel = false,
  id,
  label,
  nameColumnLabel = 'Name',
  options,
  value,
  onChange,
}: EnchantmentSelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<EnchantmentOption | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  function handleRowHover(event: MouseEvent<HTMLTableRowElement>, option: EnchantmentOption) {
    setHoveredOption(option);
    setHoverPosition({
      x: event.clientX + 18,
      y: event.clientY + 18,
    });
  }

  return (
    <div className="enchantment-select-wrap">
      <span className={hideLabel ? 'sr-only' : 'enchantment-label'} id={`${id}-label`}>
        {label}
      </span>
      <button
        type="button"
        className="enchantment-select-trigger"
        aria-expanded={isModalOpen}
        aria-haspopup="dialog"
        aria-labelledby={`${id}-label ${id}-trigger`}
        id={`${id}-trigger`}
        onClick={() => setIsModalOpen(true)}
      >
        {value || emptyLabel}
      </button>
      {isModalOpen && (
        <div
          className="selection-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-modal-title`}
          onClick={() => setIsModalOpen(false)}
        >
          <button
            className="selection-modal-close"
            type="button"
            aria-label={`Close ${label} selection`}
            onClick={() => setIsModalOpen(false)}
          >
            <X size={22} strokeWidth={2.2} aria-hidden="true" />
          </button>

          <section
            className="selection-modal-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="selection-modal-header">
              <h2 id={`${id}-modal-title`}>{label}</h2>
              <button
                className="selection-clear"
                type="button"
                onClick={() => {
                  onChange('');
                  setHoveredOption(null);
                  setIsModalOpen(false);
                }}
              >
                {emptyLabel}
              </button>
            </header>

            <div className="selection-table-scroll">
              <table className="selection-table">
                <thead>
                  <tr>
                    <th scope="col">{nameColumnLabel}</th>
                    <th scope="col">{actionColumnLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {options.map((option) => (
                    <tr
                      className={value === option.name ? 'active' : ''}
                      key={option.name}
                      onClick={() => {
                        onChange(option.name);
                        setHoveredOption(null);
                        setIsModalOpen(false);
                      }}
                      onMouseEnter={(event) => handleRowHover(event, option)}
                      onMouseLeave={() => setHoveredOption(null)}
                      onMouseMove={(event) => handleRowHover(event, option)}
                    >
                      <th scope="row">{option.name}</th>
                      <td>{option.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {hoveredOption && (
            <aside
              className="selection-hover-card"
              style={{
                left: hoverPosition.x,
                top: hoverPosition.y,
              }}
            >
              {hoveredOption.description}
            </aside>
          )}
        </div>
      )}
    </div>
  );
}

export default EnchantmentSelect;
