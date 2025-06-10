import { Entities } from "@contrail/sdk";
import { Item } from "@contrail/entity-types";

export const upsertAssortmentItem = async <T>(assortmentItem: T, itemId: string, assortmentId: string): Promise<Item> => {
  const client = new Entities();
  const assortmentItems = await client.get({
    entityName: "assortment-item",
    criteria: { itemId, assortmentId }
  });
  const entity = assortmentItems.length > 0 ? assortmentItems[0] : await client.create({
    entityName: "assortment",
    id: assortmentId,
    relation: "items",
    object: { itemIds: [itemId] },
  });
  return await client.update({
    entityName: "assortment-item",
    id: entity.id,
    object: assortmentItem
  });
}
