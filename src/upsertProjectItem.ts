import { Entities } from "@contrail/sdk";

export const upsertProjectItem = async <T>(projectItem: T, itemId: string, projectId: string): Promise<any> => {
  const client = new Entities();
  const projectItems = await client.get({
    entityName: "project-item",
    criteria: { itemId, projectId }
  });
  const entity = projectItems.length > 0 ? projectItems[0] : await client.create({
    entityName: "project-item",
    object: { itemId, projectId }
  });
  await client.update({
    entityName: "project-item",
    id: entity.id,
    object: projectItem
  });
}
