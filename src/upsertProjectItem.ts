import { Entities } from "@contrail/sdk";
import { ensureItemInProject } from "./ensureItemInProject";

export const upsertProjectItem = async <T>(projectItem: T, itemId: string, projectId: string): Promise<any> => {
  const entity = await ensureItemInProject(itemId, projectId);
  await new Entities().update({
    entityName: "project-item",
    id: entity.id,
    object: projectItem
  });
}
