import { Entities } from "@contrail/sdk";
import { Item } from "@contrail/entity-types";

export const upsertItem = async (item: Item): Promise<Item> => {
  if(!item.federatedId) {
    throw new Error("Item must have a federatedId to be upserted.");
  }
  const client = new Entities();
  const existingItem = await client.get({
    entityName: "item",
    federatedId: item.federatedId
  });
  if (existingItem) {
    return await client.update({
      id: existingItem.id,
      entityName: "item",
      object: item
    });
  }
  return await client.create({
    entityName: "item",
    object: item
  });
}
