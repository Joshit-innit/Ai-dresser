export type GearSlot = 'shirt' | 'trousers' | 'shoes';

export interface InventoryItem {
  id: string;
  file: File;
  preview: string;
  name: string;
}
