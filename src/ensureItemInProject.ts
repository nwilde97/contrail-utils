import { Entities } from "@contrail/sdk";
import { Item } from "@contrail/entity-types";

export const ensureItemInProject = async (itemId: string, projectId: string): Promise<Item> => {
  const client = new Entities();
  const projectItems = await client.get({
    entityName: "project-item",
    criteria: { itemId, projectId }
  });
  if (projectItems.length > 0) {
    return projectItems[0];
  }
  return new Entities().create({
    entityName: "project-item",
    object: { itemId, projectId }
  });
}
