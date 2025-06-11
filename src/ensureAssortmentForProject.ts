import { Entities } from "@contrail/sdk";
import { Item } from "@contrail/entity-types";

export const ensureAssortmentForProject = async (projectId: string, cfop: string, division: string): Promise<Item> => {
  const entities = new Entities();
  const assortments = await entities.get({ entityName: 'assortment', criteria: { rootWorkspaceId: projectId } });
  const assortmentName = `${cfop} ${division}`;
  let assortment = assortments.find((a) => a.name === assortmentName && a.workspaceId === projectId);
  if (assortment) {
    return assortment;
  }
  assortment = await entities.create({
    entityName: 'assortment',
    object: {
      name: assortmentName,
      workspaceId: projectId,
      assortmentType: 'INTEGRATION'
    }
  });
  console.log(`Created new assortment: ${assortment.name}`);
  return assortment;
}
