import { Entities } from "@contrail/sdk";
import { Item } from "@contrail/entity-types";
import { ensureItemInAssortment } from "./ensureItemInAssortment";

export const upsertAssortmentItem = async <T>(assortmentItem: T, itemId: string, assortmentId: string): Promise<Item> => {
  const entity = await ensureItemInAssortment(itemId, assortmentId);
  return await new Entities().update({
    entityName: "assortment-item",
    id: entity.id,
    object: assortmentItem
  });
}
