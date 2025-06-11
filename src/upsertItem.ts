import { Entities } from "@contrail/sdk";
import { Item } from "@contrail/entity-types";

export const upsertItem = async (item: Pick<Item, "name" | "federatedId">): Promise<Item> => {
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
