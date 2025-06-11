import { Entities } from "@contrail/sdk";
import { Item } from "@contrail/entity-types";

export const ensureItemInAssortment = async (itemId: string, assortmentId: string): Promise<Item> => {
  const client = new Entities();
  const assortmentItems = await client.get({
    entityName: "assortment-item",
    criteria: { itemId, assortmentId }
  });
  if (assortmentItems.length > 0) {
    return assortmentItems[0];
  }
  return client.create({
    entityName: "assortment",
    id: assortmentId,
    relation: "items",
    object: { itemIds: [itemId] },
  });
}
