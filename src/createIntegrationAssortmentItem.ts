import { Item } from "@contrail/entity-types";
import { upsertItem } from "./upsertItem";
import { upsertProjectItem } from "./upsertProjectItem";
import { ensureItemInAssortment } from "./ensureItemInAssortment";

export const createIntegrationAssortmentItem = async <T extends AssortmentItem>(assortmentItem: T, projectId: string, assortmentId: string): Promise<Item> => {
  const item = await upsertItem(assortmentItem);
  const color = await upsertItem(assortmentItem);
  await upsertProjectItem(assortmentItem, color.id, projectId);
  return await ensureItemInAssortment(color.id, assortmentId);
}

interface AssortmentItem {
  name: string;
  federatedId: string;
}
