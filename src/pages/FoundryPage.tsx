import { FormEvent, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import EnchantmentSelect from '../components/EnchantmentSelect';
import NavigationBar from '../components/NavigationBar';
import materialData from '../data/dnd_5e_material_types.json';
import enchantmentData from '../data/common_enchantments_and_spells.json';
import refinedEnchantmentData from '../data/refined_enchantments_and_spells.json';
import craftedEquipmentData from '../data/crafted_equipment.json';
import armorData from '../data/dnd_5e_armor.json';
import weaponData from '../data/dnd_5e_weapons.json';
import spellData from '../data/spells.json';

type FoundryTab = 'equipment' | 'crafting';
type EquipmentType = 'Weapon' | 'Armor';
type RarityTier = 'Common' | 'Refined' | 'Superior' | 'Mythic';

type Material = {
  materialName: string;
  materialCategory: string;
  materialTier: RarityTier;
  baseWeaponBonus: number | null;
  baseArmorBonus: number | null;
  baseEnchantmentSlots: number;
  maximumEnchantmentSlots: number;
  craftingTime: string;
  requiredCrafter: string;
  validItemTypes: EquipmentType[];
  description: string;
  weaponEffect: string | null;
  armorEffect: string | null;
  addsEnchantmentSlot: boolean;
};

type Enchantment = {
  enchantmentName: string;
  enchantmentEffect: string;
  enchantmentEffectBrief: string;
  enchantmentAction: string;
  enchantmentType: EquipmentType | 'Either';
};

type Spell = {
  spellName: string;
};

type SpellRecord = {
  casting_time: string;
  description: string;
  name: string;
};

type ArmorItem = {
  armor: string;
  'armor class': string;
  strength: string;
  stealth: string;
  weight: string;
};

type WeaponItem = {
  weapon: string;
  damage: string;
  properties: string;
};

type CraftedEquipment = {
  armor_class?: string;
  armor_class_bonus?: number | null;
  base_item: string;
  crafting_material: string;
  enchantments: CraftedEnchantment[];
  equipment_name: string;
  equipment_type: EquipmentType;
  material_effect?: string | null;
  rarity: RarityTier;
  required_strength?: string;
  spells?: CraftedSpell[];
  stealth?: string;
  weapon_bonus?: number | null;
  weapon_damage?: string;
  weapon_properties?: string;
};

type CraftedEnchantment = {
  enchantment_action: string;
  enchantment_description: string;
  enchantment_name: string;
};

type CraftedSpell = {
  spell_action: string;
  spell_description: string;
  spell_name: string;
};

const innateSpellSlotKey = -1;
const rarityTiers: RarityTier[] = ['Common', 'Refined', 'Superior', 'Mythic'];
const materials = materialData.materialTypes as Material[];
const commonEnchantments = enchantmentData.commonEnchantments as Enchantment[];
const commonSpells = enchantmentData.commonSpells as Spell[];
const refinedEnchantments = refinedEnchantmentData.refinedEnchantments as Enchantment[];
const refinedSpells = refinedEnchantmentData.refinedSpells as Spell[];
const armorItems = armorData as ArmorItem[];
const weaponItems = weaponData as WeaponItem[];
const spellRecords = spellData as SpellRecord[];
const initialCraftedEquipment = craftedEquipmentData as CraftedEquipment[];

function normalizeSpellName(spellName: string) {
  return spellName.toLowerCase();
}

function getArmorClassWithMaterialBonus(armorClass: string | undefined, armorBonus: number | null) {
  const baseArmorClass = armorClass ?? 'Unknown';

  if (!armorBonus) {
    return baseArmorClass;
  }

  const armorClassMatch = baseArmorClass.match(/^([+-]?\d+)(.*)$/);

  if (!armorClassMatch) {
    return `${baseArmorClass} + ${armorBonus}`;
  }

  return `${Number(armorClassMatch[1]) + armorBonus}${armorClassMatch[2]}`;
}

function FoundryPage() {
  const [activeTab, setActiveTab] = useState<FoundryTab>('equipment');
  const [equipmentType, setEquipmentType] = useState<EquipmentType | ''>('');
  const [baseItemName, setBaseItemName] = useState('');
  const [rarity, setRarity] = useState<RarityTier>('Common');
  const [materialName, setMaterialName] = useState('');
  const [enchantmentNames, setEnchantmentNames] = useState<string[]>([]);
  const [spellNames, setSpellNames] = useState<Record<number, string>>({});
  const [spellSlotIndexes, setSpellSlotIndexes] = useState<number[]>([]);
  const [equipmentName, setEquipmentName] = useState('');
  const [showMaximumEnchantmentSlots, setShowMaximumEnchantmentSlots] = useState(false);
  const [selectedCraftedItem, setSelectedCraftedItem] =
    useState<CraftedEquipment | null>(null);
  const [craftedEquipment, setCraftedEquipment] =
    useState<CraftedEquipment[]>(initialCraftedEquipment);

  const availableMaterials = useMemo(() => {
    if (!equipmentType) {
      return [];
    }

    return materials.filter(
      (material) =>
        material.materialTier === rarity &&
        material.validItemTypes.includes(equipmentType),
    );
  }, [equipmentType, rarity]);

  const availableBaseItems =
    equipmentType === 'Armor'
      ? armorItems.map((item) => item.armor)
      : weaponItems.map((item) => item.weapon);

  const selectedMaterial = availableMaterials.find(
    (material) => material.materialName === materialName,
  );
  const selectedWeapon = weaponItems.find((weapon) => weapon.weapon === baseItemName);
  const selectedArmor = armorItems.find((armor) => armor.armor === baseItemName);
  const selectedMaterialEffect =
    equipmentType === 'Weapon'
      ? selectedMaterial?.weaponEffect
      : selectedMaterial?.armorEffect;
  const enchantmentSlotCount = showMaximumEnchantmentSlots
    ? (selectedMaterial?.maximumEnchantmentSlots ?? 0)
    : (selectedMaterial?.baseEnchantmentSlots ?? 0);
  const canAddEnchantment = enchantmentSlotCount > 0;
  const canAttachSpell = Boolean(
    selectedMaterial?.weaponEffect?.toLowerCase().includes('spell'),
  );
  const magicSlotKeys = [
    ...Array.from({ length: enchantmentSlotCount }, (_, index) => index),
    ...(canAttachSpell ? [innateSpellSlotKey] : []),
  ];
  const includesRefinedMagicOptions = selectedMaterial
    ? selectedMaterial.materialTier !== 'Common'
    : rarity !== 'Common';
  const enchantmentOptions = includesRefinedMagicOptions
    ? [...commonEnchantments, ...refinedEnchantments]
    : commonEnchantments;
  const spellOptions = includesRefinedMagicOptions
    ? [...commonSpells, ...refinedSpells]
    : commonSpells;
  const availableEnchantments = equipmentType
    ? enchantmentOptions.filter(
        (enchantment) =>
          enchantment.enchantmentType === equipmentType ||
          enchantment.enchantmentType === 'Either',
      )
    : [];
  const availableSpells = equipmentType ? spellOptions : [];
  const enchantmentSelectOptions = availableEnchantments.map((enchantment) => ({
    action: enchantment.enchantmentAction,
    description: enchantment.enchantmentEffectBrief,
    name: enchantment.enchantmentName,
  }));
  const spellSelectOptions = availableSpells.map((spell) => ({
    action:
      spellRecords.find(
        (spellRecord) =>
          normalizeSpellName(spellRecord.name) === normalizeSpellName(spell.spellName),
      )?.casting_time ?? 'Unknown',
    description:
      spellRecords.find(
        (spellRecord) =>
          normalizeSpellName(spellRecord.name) === normalizeSpellName(spell.spellName),
      )?.description ?? 'No spell description found in spells.json.',
    name: spell.spellName,
  }));
  const summaryName = equipmentName.trim() || '-';
  const summaryType = equipmentType || '-';
  const summaryBaseItem = baseItemName || '-';
  const summaryRarity = selectedMaterial ? rarity : '-';
  const summaryMaterial = selectedMaterial?.materialName ?? '-';
  const summaryBaseProperties =
    equipmentType === 'Weapon'
      ? (selectedWeapon?.damage ?? '-')
      : selectedMaterial
        ? `${selectedArmor?.['armor class'] ?? '-'} armor class`
        : '-';
  const summaryMaterialProperties = selectedMaterialEffect ?? '-';
  const summaryEnchantments =
    enchantmentNames.filter(Boolean).length > 0
      ? enchantmentNames.filter(Boolean).join(' / ')
      : '-';
  const selectedSpellNames = Object.values(spellNames).filter(Boolean);
  const summarySpells =
    selectedSpellNames.length > 0 ? selectedSpellNames.join(' / ') : '-';
  const summaryFinalBonusText =
    selectedMaterial && equipmentType === 'Weapon'
      ? `${selectedMaterial.baseWeaponBonus ?? 0} to hit/damage`
      : `${selectedMaterial?.baseArmorBonus ?? 0} to armor class`;

  function handleEquipmentTypeChange(nextType: EquipmentType) {
    setEquipmentType(nextType);
    setBaseItemName('');
    setMaterialName('');
    setEnchantmentNames([]);
    setSpellNames({});
    setSpellSlotIndexes([]);
  }

  function handleRarityChange(nextRarity: RarityTier) {
    setRarity(nextRarity);
    setMaterialName('');
    setEnchantmentNames([]);
    setSpellNames({});
    setSpellSlotIndexes([]);
  }

  function handleEnchantmentChange(index: number, nextEnchantmentName: string) {
    setEnchantmentNames((currentEnchantments) => {
      const nextEnchantments = [...currentEnchantments];

      nextEnchantments[index] = nextEnchantmentName;

      return nextEnchantments;
    });
  }

  function handleSpellChange(index: number, nextSpellName: string) {
    setSpellNames((currentSpells) => {
      const nextSpells = { ...currentSpells };

      nextSpells[index] = nextSpellName;

      return nextSpells;
    });
  }

  function handleSpellSlotToggle(index: number, checked: boolean) {
    setSpellSlotIndexes((currentIndexes) =>
      checked
        ? [...new Set([...currentIndexes, index])]
        : currentIndexes.filter((currentIndex) => currentIndex !== index),
    );

    if (checked) {
      handleEnchantmentChange(index, '');
    } else {
      handleSpellChange(index, '');
    }
  }

  function handleMaximumEnchantmentSlotToggle(checked: boolean) {
    setShowMaximumEnchantmentSlots(checked);

    if (!checked) {
      setEnchantmentNames((currentEnchantments) =>
        currentEnchantments.slice(0, selectedMaterial?.baseEnchantmentSlots ?? 0),
      );
      setSpellNames((currentSpells) =>
        Object.fromEntries(
          Object.entries(currentSpells).filter(
            ([slotKey]) =>
              Number(slotKey) === innateSpellSlotKey ||
              Number(slotKey) < (selectedMaterial?.baseEnchantmentSlots ?? 0),
          ),
        ),
      );
      setSpellSlotIndexes((currentIndexes) =>
        currentIndexes.filter(
          (currentIndex) => currentIndex < (selectedMaterial?.baseEnchantmentSlots ?? 0),
        ),
      );
    }
  }

  function getSpellRecord(spellNameToFind: string) {
    return spellRecords.find(
      (spellRecord) =>
        normalizeSpellName(spellRecord.name) === normalizeSpellName(spellNameToFind),
    );
  }

  function getCraftedEnchantments() {
    return enchantmentNames.filter(Boolean).map((selectedEnchantmentName) => {
      const enchantment = availableEnchantments.find(
        (availableEnchantment) =>
          availableEnchantment.enchantmentName === selectedEnchantmentName,
      );

      return {
        enchantment_name: selectedEnchantmentName,
        enchantment_description:
          enchantment?.enchantmentEffect ?? 'No enchantment description found.',
        enchantment_action: enchantment?.enchantmentAction ?? 'Unknown',
      };
    });
  }

  function getCraftedSpells() {
    return selectedSpellNames.map((selectedSpellName) => ({
      spell_name: selectedSpellName,
      spell_description:
        getSpellRecord(selectedSpellName)?.description ??
        'No spell description found in spells.json.',
      spell_action: getSpellRecord(selectedSpellName)?.casting_time ?? 'Unknown',
      }));
  }

  function buildCraftedEquipment(): CraftedEquipment | null {
    if (!equipmentType || !baseItemName || !selectedMaterial || !equipmentName.trim()) {
      return null;
    }

    const baseCraftedEquipment = {
      equipment_name: equipmentName.trim(),
      equipment_type: equipmentType,
      base_item: baseItemName,
      rarity,
      crafting_material: selectedMaterial.materialName,
      material_effect: selectedMaterialEffect,
      enchantments: getCraftedEnchantments(),
    };

    if (equipmentType === 'Weapon') {
      return {
        ...baseCraftedEquipment,
        weapon_damage: selectedWeapon?.damage ?? 'Unknown',
        weapon_bonus: selectedMaterial.baseWeaponBonus,
        weapon_properties: selectedWeapon?.properties ?? 'Unknown',
        spells: getCraftedSpells(),
      };
    }

    return {
      ...baseCraftedEquipment,
      armor_class: selectedArmor?.['armor class'] ?? 'Unknown',
      armor_class_bonus: selectedMaterial.baseArmorBonus,
      required_strength: selectedArmor?.strength ?? 'Unknown',
      stealth: selectedArmor?.stealth ?? 'Unknown',
    };
  }

  async function saveCraftedEquipment(craftedItem: CraftedEquipment) {
    const response = await fetch('/api/crafted-equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(craftedItem),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const craftedItem = buildCraftedEquipment();

    if (!craftedItem) {
      return;
    }

    await saveCraftedEquipment(craftedItem);
    setCraftedEquipment((currentEquipment) => [craftedItem, ...currentEquipment]);
    setEquipmentName('');
  }

  function getCraftedItemType(item: CraftedEquipment) {
    return item.base_item;
  }

  function getCraftedItemMaterial(item: CraftedEquipment) {
    return item.crafting_material;
  }

  function getCraftedItemMagicNames(item: CraftedEquipment) {
    return [
      ...item.enchantments.map((enchantment) => enchantment.enchantment_name),
      ...(item.spells?.map((spell) => spell.spell_name) ?? []),
    ].filter(Boolean);
  }

  function getCraftedItemBaseProperties(item: CraftedEquipment) {
    return item.equipment_type === 'Weapon'
      ? (item.weapon_damage ?? '-')
      : `${item.armor_class ?? '-'} armor class`;
  }

  function getCraftedItemFinalBonus(item: CraftedEquipment) {
    return item.equipment_type === 'Weapon'
      ? `${item.weapon_bonus ?? 0} to hit/damage`
      : `${item.armor_class_bonus ?? 0} to armor class`;
  }

  return (
    <main className="app-shell foundry-shell">
      <NavigationBar />

      <section className="foundry-panel" aria-labelledby="foundry-title">
        <header className="foundry-header">
          <h1 id="foundry-title">Foundry</h1>
        </header>

        <div className="foundry-tabs" role="tablist" aria-label="Foundry views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'equipment'}
            className={activeTab === 'equipment' ? 'active' : ''}
            onClick={() => setActiveTab('equipment')}
          >
            Equipment
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'crafting'}
            className={activeTab === 'crafting' ? 'active' : ''}
            onClick={() => setActiveTab('crafting')}
          >
            Crafting
          </button>
        </div>

        {activeTab === 'equipment' ? (
          <section className="foundry-tab-panel" role="tabpanel">
            {craftedEquipment.length > 0 ? (
              <div className="crafted-table-scroll">
                <table className="crafted-equipment-table">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Equipment Type</th>
                      <th scope="col">Material</th>
                      <th scope="col">Enchantments/Spells</th>
                    </tr>
                  </thead>
                  <tbody>
                    {craftedEquipment.map((item) => {
                      const magicalProperties = getCraftedItemMagicNames(item);

                      return (
                        <tr
                          className="crafted-equipment-row"
                          key={`${item.equipment_name}-${item.crafting_material}-${item.base_item}`}
                          tabIndex={0}
                          onClick={() => setSelectedCraftedItem(item)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setSelectedCraftedItem(item);
                            }
                          }}
                        >
                          <th scope="row">{item.equipment_name}</th>
                          <td>{getCraftedItemType(item)}</td>
                          <td>{getCraftedItemMaterial(item)}</td>
                          <td>
                            {magicalProperties.length > 0
                              ? magicalProperties.join(' / ')
                              : 'None'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-foundry-state">
                <h2>No Equipment Crafted</h2>
                <p>Use the Crafting tab to forge armor and weapons.</p>
              </div>
            )}
          </section>
        ) : (
          <section className="foundry-tab-panel" role="tabpanel">
            <div className="crafting-workspace">
              <form className="crafting-form" onSubmit={handleSubmit}>
                <header className="crafting-title">
                  <h2>Create Equipment</h2>
                  <p>Build a custom weapon or armor from rare materials and magical effects.</p>
                </header>

                <section className="crafting-section" aria-labelledby="basic-info-title">
                  <h3 id="basic-info-title">1. Basic Information</h3>

                  <div className="basic-info-grid">
                    <fieldset className="item-type-field">
                      <legend>Item Type</legend>
                      <div className="segmented-control">
                        <button
                          type="button"
                          className={equipmentType === 'Weapon' ? 'active' : ''}
                          onClick={() => handleEquipmentTypeChange('Weapon')}
                        >
                          Weapon
                        </button>
                        <button
                          type="button"
                          className={equipmentType === 'Armor' ? 'active' : ''}
                          onClick={() => handleEquipmentTypeChange('Armor')}
                        >
                          Armor
                        </button>
                      </div>
                    </fieldset>

                    <label>
                      Equipment Name
                      <input
                        type="text"
                        value={equipmentName}
                        placeholder="Enter equipment name..."
                        onChange={(event) => setEquipmentName(event.target.value)}
                      />
                    </label>

                    <label>
                      {equipmentType === 'Armor' ? 'Armor Type' : 'Weapon Type'}
                      <select
                        value={baseItemName}
                        disabled={!equipmentType}
                        onChange={(event) => setBaseItemName(event.target.value)}
                      >
                        <option value="">
                          {equipmentType
                            ? `Select ${equipmentType.toLowerCase()} type...`
                            : 'Choose armor or weapon first'}
                        </option>
                        {availableBaseItems.map((itemName) => (
                          <option value={itemName} key={itemName}>
                            {itemName}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Rarity
                      <select
                        value={rarity}
                        onChange={(event) =>
                          handleRarityChange(event.target.value as RarityTier)
                        }
                      >
                        {rarityTiers.map((tier) => (
                          <option value={tier} key={tier}>
                            {tier}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field-full">
                      Material
                      <select
                        value={materialName}
                        disabled={!equipmentType}
                        onChange={(event) => {
                          setMaterialName(event.target.value);
                          setEnchantmentNames([]);
                    setSpellNames({});
                    setSpellSlotIndexes([]);
                  }}
                      >
                        <option value="">
                          {equipmentType
                            ? 'Select material...'
                            : 'Choose armor or weapon first'}
                        </option>
                        {availableMaterials.map((material) => (
                          <option value={material.materialName} key={material.materialName}>
                            {material.materialName} - {material.materialCategory}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </section>

                {(canAddEnchantment || canAttachSpell) && (
                  <section className="crafting-section" aria-labelledby="enchantments-title">
                    <h3 id="enchantments-title">2. Enchantments and Spells</h3>

                    <div className="enchantment-slot-list">
                      {magicSlotKeys.map((slotKey) => {
                        const isInnateSpellSlot = slotKey === innateSpellSlotKey;
                        const isSpellSlot =
                          isInnateSpellSlot || spellSlotIndexes.includes(slotKey);

                        return (
                          <section className="enchantment-slot-card" key={`slot-${slotKey}`}>
                            <h4>{isSpellSlot ? 'Spell Slot' : 'Enchantment Slot'}</h4>
                            {isSpellSlot ? (
                              <EnchantmentSelect
                                actionColumnLabel="Spell Action"
                                emptyLabel="No spell"
                                hideLabel
                                id={`spell-${slotKey}`}
                                label="Spell"
                                nameColumnLabel="Spell Name"
                                options={spellSelectOptions}
                                value={spellNames[slotKey] ?? ''}
                                onChange={(nextSpellName) =>
                                  handleSpellChange(slotKey, nextSpellName)
                                }
                              />
                            ) : (
                              <EnchantmentSelect
                                actionColumnLabel="Enchantment Action"
                                hideLabel
                                id={`enchantment-${slotKey}`}
                                label="Enchantment"
                                nameColumnLabel="Enchantment Name"
                                options={enchantmentSelectOptions}
                                value={enchantmentNames[slotKey] ?? ''}
                                onChange={(nextEnchantmentName) =>
                                  handleEnchantmentChange(slotKey, nextEnchantmentName)
                                }
                              />
                            )}
                            {canAttachSpell && !isInnateSpellSlot && (
                              <label className="slot-toggle">
                                <input
                                  type="checkbox"
                                  checked={isSpellSlot}
                                  onChange={(event) =>
                                    handleSpellSlotToggle(slotKey, event.target.checked)
                                  }
                                />
                                Use spell instead
                              </label>
                            )}
                          </section>
                        );
                      })}

                      {selectedMaterial && (
                        <label className="slot-toggle">
                          <input
                            type="checkbox"
                            checked={showMaximumEnchantmentSlots}
                            onChange={(event) =>
                              handleMaximumEnchantmentSlotToggle(event.target.checked)
                            }
                          />
                          Add an additional enchantment
                        </label>
                      )}
                    </div>
                  </section>
                )}

                <button
                  className="craft-submit"
                  type="submit"
                  disabled={
                    !equipmentType ||
                    !baseItemName ||
                    !selectedMaterial ||
                    !equipmentName.trim()
                  }
                >
                  Create Item
                </button>
              </form>

              <aside className="item-summary-panel" aria-label="Item summary">
                <h2>Item Summary</h2>
                <dl className="item-summary-list">
                  <div>
                    <dt>Name</dt>
                    <dd>{summaryName}</dd>
                  </div>
                  <div>
                    <dt>Type</dt>
                    <dd>{summaryType}</dd>
                  </div>
                  <div>
                    <dt>Base Item</dt>
                    <dd>{summaryBaseItem}</dd>
                  </div>
                  <div>
                    <dt>Rarity</dt>
                    <dd>{summaryRarity}</dd>
                  </div>
                  <div>
                    <dt>Material</dt>
                    <dd>{summaryMaterial}</dd>
                  </div>
                </dl>

                <section className="summary-group">
                  <h3>Base Properties</h3>
                  <p>{summaryBaseProperties}</p>
                </section>

                <section className="summary-group">
                  <h3>Material Properties</h3>
                  <p>{summaryMaterialProperties}</p>
                </section>

                <section className="summary-group">
                  <h3>Enchantments</h3>
                  <p>{summaryEnchantments}</p>
                </section>

                <section className="summary-group">
                  <h3>Spells</h3>
                  <p>{summarySpells}</p>
                </section>

                <section className="summary-group">
                  <h3>Final Bonuses</h3>
                  <p>{selectedMaterial ? (summaryFinalBonusText ?? 'None') : '-'}</p>
                </section>

              </aside>
            </div>
          </section>
        )}
      </section>

      {selectedCraftedItem && (
        <div
          className="crafted-detail-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedCraftedItem.equipment_name} details`}
          onClick={() => setSelectedCraftedItem(null)}
        >
          <section
            className="crafted-detail-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="crafted-detail-close"
              type="button"
              aria-label="Close equipment details"
              onClick={() => setSelectedCraftedItem(null)}
            >
              <X size={22} strokeWidth={2.2} aria-hidden="true" />
            </button>

            <header className="crafted-detail-header">
              <h2>{selectedCraftedItem.equipment_name}</h2>
              <p>
                {getCraftedItemMaterial(selectedCraftedItem)}{' '}
                {getCraftedItemType(selectedCraftedItem)}
              </p>
            </header>

            <div className="crafted-detail-columns">
              <div className="crafted-detail-column">
                <dl className="item-summary-list">
                  <div>
                    <dt>Name</dt>
                    <dd>{selectedCraftedItem.equipment_name}</dd>
                  </div>
                  <div>
                    <dt>Type</dt>
                    <dd>{selectedCraftedItem.equipment_type}</dd>
                  </div>
                  <div>
                    <dt>Base Item</dt>
                    <dd>{selectedCraftedItem.base_item}</dd>
                  </div>
                  <div>
                    <dt>Rarity</dt>
                    <dd>{selectedCraftedItem.rarity}</dd>
                  </div>
                  <div>
                    <dt>Material</dt>
                    <dd>{getCraftedItemMaterial(selectedCraftedItem)}</dd>
                  </div>
                  {selectedCraftedItem.equipment_type === 'Armor' && (
                    <>
                      <div>
                        <dt>Required Strength</dt>
                        <dd>{selectedCraftedItem.required_strength ?? 'Unknown'}</dd>
                      </div>
                      <div>
                        <dt>Stealth</dt>
                        <dd>{selectedCraftedItem.stealth ?? 'Unknown'}</dd>
                      </div>
                    </>
                  )}
                  {selectedCraftedItem.equipment_type === 'Weapon' && (
                    <div>
                      <dt>Properties</dt>
                      <dd>{selectedCraftedItem.weapon_properties ?? 'Unknown'}</dd>
                    </div>
                  )}
                </dl>

                <section className="summary-group">
                  <h3>Base Properties</h3>
                  <p>{getCraftedItemBaseProperties(selectedCraftedItem)}</p>
                </section>

                <section className="summary-group">
                  <h3>Material Properties</h3>
                  <p>{selectedCraftedItem.material_effect ?? 'None'}</p>
                </section>

                <section className="summary-group">
                  <h3>Final Bonuses</h3>
                  <p>{getCraftedItemFinalBonus(selectedCraftedItem)}</p>
                </section>
              </div>

              <div className="crafted-detail-column">
                <section className="summary-group crafted-detail-magic">
                  <h3>Enchantments</h3>
                  {selectedCraftedItem.enchantments.length > 0 ? (
                    selectedCraftedItem.enchantments.map((enchantment) => (
                      <article key={enchantment.enchantment_name}>
                        <h4>{enchantment.enchantment_name}</h4>
                        <p className="crafted-detail-action">
                          {enchantment.enchantment_action}
                        </p>
                        <p>{enchantment.enchantment_description}</p>
                      </article>
                    ))
                  ) : (
                    <p>-</p>
                  )}
                </section>

                <section className="summary-group crafted-detail-magic">
                  <h3>Spells</h3>
                  {(selectedCraftedItem.spells?.length ?? 0) > 0 ? (
                    selectedCraftedItem.spells?.map((spell) => (
                      <article key={spell.spell_name}>
                        <h4>{spell.spell_name}</h4>
                        <p className="crafted-detail-action">{spell.spell_action}</p>
                        <p>{spell.spell_description}</p>
                      </article>
                    ))
                  ) : (
                    <p>-</p>
                  )}
                </section>
              </div>
            </div>

            {selectedCraftedItem.equipment_type === 'Armor' && (
              <section className="summary-group">
                <h3>Final Armor Class</h3>
                <p>
                  {getArmorClassWithMaterialBonus(
                    selectedCraftedItem.armor_class,
                    selectedCraftedItem.armor_class_bonus ?? null,
                  )}
                </p>
              </section>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default FoundryPage;
