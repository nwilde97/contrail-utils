import { Entities } from "@contrail/sdk";
import { Item } from "@contrail/entity-types";

export const ensureProjectForSeason = async (season: string): Promise<Item> => {
  const entities = new Entities();
  const projects = await entities.get({ entityName: 'workspace' });
  const existingPlan = projects.find((p) => p.name === season && p.rootWorkspaceType === 'PROJECT');
  if (!existingPlan) {
    return await entities.create({
      entityName: 'workspace',
      object: {
        name: season,
        rootWorkspaceType: 'PROJECT',
      }
    });
  }
  return existingPlan;
}
