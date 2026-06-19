import { FormEvent, useEffect, useMemo, useState } from 'react';
import EnchantmentSelect from '../components/EnchantmentSelect';
import NavigationBar from '../components/NavigationBar';
import materialData from '../data/dnd_5e_material_types.json';
import enchantmentData from '../data/common_enchantments_and_spells.json';
import refinedEnchantmentData from '../data/refined_enchantments_and_spells.json';
import craftedEquipmentData from '../data/crafted_equipment.json';
import armorData from '../data/dnd_5e_armor.json';
import weaponData from '../data/dnd_5e_weapons.json';

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
  spellEffect: string;
  spellAction: string;
  spellType: EquipmentType | 'Either';
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
  name: string;
  equipmentType: EquipmentType;
  baseItemName?: string;
  rarity: RarityTier;
  materialName: string;
  enchantmentNames?: string[];
  enchantmentName?: string;
  spellName?: string;
};

const rarityTiers: RarityTier[] = ['Common', 'Refined', 'Superior', 'Mythic'];
const materials = materialData.materialTypes as Material[];
const commonEnchantments = enchantmentData.commonEnchantments as Enchantment[];
const commonSpells = enchantmentData.commonSpells as Spell[];
const refinedEnchantments = refinedEnchantmentData.refinedEnchantments as Enchantment[];
const refinedSpells = refinedEnchantmentData.refinedSpells as Spell[];
const armorItems = armorData as ArmorItem[];
const weaponItems = weaponData as WeaponItem[];
const craftedEquipmentStorageKey = 'codex-crafted-equipment';
const initialCraftedEquipment = craftedEquipmentData as CraftedEquipment[];

function FoundryPage() {
  const [activeTab, setActiveTab] = useState<FoundryTab>('equipment');
  const [equipmentType, setEquipmentType] = useState<EquipmentType | ''>('');
  const [baseItemName, setBaseItemName] = useState('');
  const [rarity, setRarity] = useState<RarityTier>('Common');
  const [materialName, setMaterialName] = useState('');
  const [enchantmentNames, setEnchantmentNames] = useState<string[]>([]);
  const [spellName, setSpellName] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  const [craftedEquipment, setCraftedEquipment] = useState<CraftedEquipment[]>(() => {
    const storedEquipment = window.localStorage.getItem(craftedEquipmentStorageKey);

    if (!storedEquipment) {
      return initialCraftedEquipment;
    }

    try {
      return JSON.parse(storedEquipment) as CraftedEquipment[];
    } catch {
      return initialCraftedEquipment;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(
      craftedEquipmentStorageKey,
      JSON.stringify(craftedEquipment),
    );
  }, [craftedEquipment]);

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
  const selectedMaterialEffect =
    equipmentType === 'Weapon'
      ? selectedMaterial?.weaponEffect
      : selectedMaterial?.armorEffect;
  const canAddEnchantment = Boolean(
    selectedMaterial &&
      (selectedMaterial.baseEnchantmentSlots > 0 || selectedMaterial.addsEnchantmentSlot),
  );
  const enchantmentSlotCount = canAddEnchantment
    ? Math.max(
        selectedMaterial?.baseEnchantmentSlots ?? 0,
        selectedMaterial?.maximumEnchantmentSlots ?? 0,
        selectedMaterial?.addsEnchantmentSlot ? 1 : 0,
      )
    : 0;
  const canAttachSpell = Boolean(
    selectedMaterialEffect?.toLowerCase().includes('spell'),
  );
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
  const availableSpells = equipmentType
    ? spellOptions.filter(
        (spell) => spell.spellType === equipmentType || spell.spellType === 'Either',
      )
    : [];

  function handleEquipmentTypeChange(nextType: EquipmentType) {
    setEquipmentType(nextType);
    setBaseItemName('');
    setMaterialName('');
    setEnchantmentNames([]);
    setSpellName('');
  }

  function handleRarityChange(nextRarity: RarityTier) {
    setRarity(nextRarity);
    setMaterialName('');
    setEnchantmentNames([]);
    setSpellName('');
  }

  function handleEnchantmentChange(index: number, nextEnchantmentName: string) {
    setEnchantmentNames((currentEnchantments) => {
      const nextEnchantments = [...currentEnchantments];

      nextEnchantments[index] = nextEnchantmentName;

      return nextEnchantments;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!equipmentType || !baseItemName || !selectedMaterial || !equipmentName.trim()) {
      return;
    }

    setCraftedEquipment((currentEquipment) => [
      {
        name: equipmentName.trim(),
        equipmentType,
        baseItemName,
        rarity,
        materialName: selectedMaterial.materialName,
        enchantmentNames: enchantmentNames.filter(Boolean),
        spellName: spellName || undefined,
      },
      ...currentEquipment,
    ]);
    setEquipmentName('');
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
                      <th scope="col">Base Item</th>
                      <th scope="col">Material</th>
                      <th scope="col">Enchantments/Spells</th>
                    </tr>
                  </thead>
                  <tbody>
                    {craftedEquipment.map((item) => {
                      const magicalProperties = [
                        ...(item.enchantmentNames ?? [item.enchantmentName]),
                        item.spellName,
                      ].filter(Boolean);

                      return (
                        <tr key={`${item.name}-${item.materialName}`}>
                          <th scope="row">{item.name}</th>
                          <td>{item.equipmentType}</td>
                          <td>{item.baseItemName ?? 'Unknown'}</td>
                          <td>{item.materialName}</td>
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
            <form className="crafting-form" onSubmit={handleSubmit}>
              <fieldset>
                <legend>Equipment Type</legend>
                <div className="segmented-control">
                  <button
                    type="button"
                    className={equipmentType === 'Armor' ? 'active' : ''}
                    onClick={() => handleEquipmentTypeChange('Armor')}
                  >
                    Armor
                  </button>
                  <button
                    type="button"
                    className={equipmentType === 'Weapon' ? 'active' : ''}
                    onClick={() => handleEquipmentTypeChange('Weapon')}
                  >
                    Weapon
                  </button>
                </div>
              </fieldset>

              <label>
                {equipmentType === 'Armor' ? 'Armor Type' : 'Weapon Type'}
                <select
                  value={baseItemName}
                  disabled={!equipmentType}
                  onChange={(event) => setBaseItemName(event.target.value)}
                >
                  <option value="">
                    {equipmentType
                      ? `Select ${equipmentType.toLowerCase()} type`
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
                  onChange={(event) => handleRarityChange(event.target.value as RarityTier)}
                >
                  {rarityTiers.map((tier) => (
                    <option value={tier} key={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Material
                <select
                  value={materialName}
                  disabled={!equipmentType}
                  onChange={(event) => {
                    setMaterialName(event.target.value);
                    setEnchantmentNames([]);
                    setSpellName('');
                  }}
                >
                  <option value="">
                    {equipmentType ? 'Select a material' : 'Choose armor or weapon first'}
                  </option>
                  {availableMaterials.map((material) => (
                    <option value={material.materialName} key={material.materialName}>
                      {material.materialName} - {material.materialCategory}
                    </option>
                  ))}
                </select>
              </label>

              {selectedMaterial && (
                <section className="material-summary" aria-label="Selected material details">
                  <h2>{selectedMaterial.materialName}</h2>
                  <p>{selectedMaterial.description}</p>
                  <dl>
                    <div>
                      <dt>Crafting Time</dt>
                      <dd>{selectedMaterial.craftingTime}</dd>
                    </div>
                    <div>
                      <dt>Required Crafter</dt>
                      <dd>{selectedMaterial.requiredCrafter}</dd>
                    </div>
                    <div>
                      <dt>Bonus</dt>
                      <dd>
                        {equipmentType === 'Weapon'
                          ? selectedMaterial.weaponEffect
                          : selectedMaterial.armorEffect}
                      </dd>
                    </div>
                    <div>
                      <dt>Magic Slots</dt>
                      <dd>{selectedMaterial.maximumEnchantmentSlots}</dd>
                    </div>
                  </dl>
                </section>
              )}

              {(canAddEnchantment || canAttachSpell) && (
                <div className="magic-fields">
                  {canAddEnchantment && (
                    Array.from({ length: enchantmentSlotCount }, (_, index) => (
                      <EnchantmentSelect
                        enchantments={availableEnchantments}
                        id={`enchantment-${index}`}
                        key={`enchantment-${index}`}
                        label={`Enchantment ${index + 1}`}
                        value={enchantmentNames[index] ?? ''}
                        onChange={(nextEnchantmentName) =>
                          handleEnchantmentChange(index, nextEnchantmentName)
                        }
                      />
                    ))
                  )}

                  {canAttachSpell && (
                    <label>
                      Spell
                      <select
                        value={spellName}
                        onChange={(event) => setSpellName(event.target.value)}
                      >
                        <option value="">No spell</option>
                        {availableSpells.map((spell) => (
                          <option value={spell.spellName} key={spell.spellName}>
                            {spell.spellName}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              )}

              <label>
                Equipment Name
                <input
                  type="text"
                  value={equipmentName}
                  placeholder="Name your creation"
                  onChange={(event) => setEquipmentName(event.target.value)}
                />
              </label>

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
                Craft Equipment
              </button>
            </form>
          </section>
        )}
      </section>
    </main>
  );
}

export default FoundryPage;
