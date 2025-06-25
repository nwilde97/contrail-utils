/*
 * ## Server-side Filtering with VibeIQ
 *
 * VibeIQ's primary value store is dynamodb.
 *
 * This means that by default the access patterns supported for each entity are generally
 * somewhat limited and rigid - we don't support ad-hoc queries against dynamodb because
 * because table scans would be too slow to be useful.
 *
 * The access patterns directly supported in dynamodb are not well-communicated through the SDK.
 * This file documents those access patterns for a subset of entities. It
 * reflects the state of access patterns as of 2025-06-25.
 *
 * If you need an access pattern that is not supported below, you generally have two options:
 *
 * - Filter client-side: Just fetch a lot of data and filter it within your app
 * - Make the property searchable through the Admin console
 *   - This only applies to Searchable types (e.g. Items but not AssortmentItems)
 *     - Expanding the set of searchable properties is not terribly difficult
 *   - We are somewhat hesitant to recommend putting search on the critical path of high-throughput transactions,
 *     simply because it is currently a provisioned resource, so it doesn't scale as readily as other parts of the system.
 *     - If we need to use search on a high-throughput transactions, please just sync with VibeIQ first to make sure we provide
 *       the right capacity.
 *
 * This file does not document other EntityCriteria capabilities, such as pagination and hydrating related entities.
 */

import { API_VERSION, Assortment, Item } from "@contrail/entity-types";
import { Entities, login } from "@contrail/sdk";

const ID_OF_PROJECT_WITH_PROJECT_ITEMS = "uuz_v3_l-z4A9akn";

// Pre-defined Dynamo-based Filtering Criteria
// Projects
export type GetProjectsCriteria = { id: string } | {};

// Assortments
export type GetAssortmentsCriteria = { id: string } | {};

// Items
export type GetItemsCriteria =
  | {}
  | { id: string }
  | { itemFamilyId: string; role: "option"; optionGroup: "color" | "size" }
  | { itemFamilyId: string; role: "variant" }
  | { itemFamilyId: string };

// Project Items
export type GetProjectItemsCriteria =
  | {}
  | { id: string }
  | { itemId: string }
  | { projectId: string; itemId: string }
  | { projectId: string };

// Assortment Items
export type GetAssortmentItemsCriteria =
  | { id: string }
  | { assortmentId: string; itemId: string }
  | { assortmentId: string }
  | { itemId: string };

// Demonstrate Usage
async function demonstrateAllAccessPatterns() {
  await login({
    orgSlug: process.env.CONTRAIL_ORG_SLUG as string,
    email: process.env.CONTRAIL_EMAIL,
    password: process.env.CONTRAIL_PASSWORD,
  });

  // Fetch Projects
  const allProjects = await getProjects({});
  console.log(
    "Fetch all projects. Sample of projects:",
    allProjects.slice(0, 2),
  );

  const projectId = allProjects[0]?.id;
  if (!projectId) {
    console.error("No projects found to demonstrate specific project access.");
    return;
  }
  const specificProject = await getProjects({ id: projectId });
  console.log("Fetch specific project:", specificProject);

  // Fetch Assortments
  const allAssortments = await getAssortments({});
  console.log(
    "Fetch all assortments. Sample of assortments:",
    allAssortments.slice(0, 2),
  );

  const assortmentId = allAssortments[0]?.id;
  if (!assortmentId) {
    console.error(
      "No assortments found to demonstrate specific assortment access.",
    );
    return;
  }
  const specificAssortment = await getAssortments({ id: assortmentId });
  console.log("Fetch specific assortment:", specificAssortment);

  // Fetch Items
  const allItems = await getItems({});
  console.log("Fetch all items. Sample of items:", allItems.slice(0, 2));

  const itemId = allItems[0]?.id;
  if (!itemId) {
    console.error("No items found to demonstrate specific item access.");
    return;
  }
  const specificItem = await getItems({ id: itemId });
  console.log("Fetch specific item:", specificItem);

  const itemFamilyId = allItems[0]?.itemFamilyId;
  if (!itemFamilyId) {
    console.error("No item family found to demonstrate item family access.");
    return;
  }
  const itemFamilyItems = await getItems({ itemFamilyId });
  console.log("Fetch items for item family:", itemFamilyItems.slice(0, 2));

  /* Skipping because we don't have options in the POC data yet
  const exampleItemOption = allItems.find(
    (item: Item) => item.role === "option",
  );
  if (!exampleItemOption) {
    console.error("No item options found to demonstrate option access.");
    return;
  }
  const itemFamilyId = exampleItemOption.itemFamilyId;
  const itemOptionGroup = exampleItemOption.optionGroup;
  const itemOptions = await getItems({
    itemFamilyId,
    role: "option",
    optionGroup: itemOptionGroup,
  });
  console.log(
    "Fetch item options for family and group:",
    itemOptions.slice(0, 2),
  );
  */

  /* Skipping because we don't have options in the POC data yet
  const exampleItemVariant = allItems.find(
    (item: Item) => item.role === "variant",
  );
  if (!exampleItemVariant) {
    console.error("No item variants found to demonstrate variant access.");
    return;
  }
  const itemFamilyId = exampleItemVariant.itemFamilyId;
  const itemVariants = await getItems({ itemFamilyId, role: "variant" });
  console.log("Fetch item variants for family:", itemVariants.slice(0, 2));
  */

  // Fetch Project Items
  const allProjectItems = await getProjectItems({});
  console.log(
    "Fetch all project items. Sample of project items:",
    allProjectItems.slice(0, 2),
  );

  const idOfProjectWithItems = allProjectItems[0]?.projectId;
  const projectItemsForProject = await getProjectItems({
    projectId: idOfProjectWithItems,
  });
  console.log(
    "Fetch all project items for a specific project. Sample of project items:",
    projectItemsForProject.slice(0, 2),
  );

  const projectItemId = projectItemsForProject[0]?.id;
  if (!projectItemId) {
    console.error(
      "No project items found to demonstrate specific project item access.",
    );
    return;
  }
  const specificProjectItem = await getProjectItems({ id: projectItemId });
  console.log("Fetch specific project item:", specificProjectItem);

  const anotherSpecificProjectItem = await getProjectItems({
    projectId: projectItemsForProject[0]?.projectId,
    itemId: projectItemsForProject[0]?.itemId,
  });
  console.log(
    "Fetch project items for specific item in a project:",
    anotherSpecificProjectItem.slice(0, 1),
  );

  const projectItemForItem = await getProjectItems({
    itemId: projectItemsForProject[0]?.itemId,
  });
  console.log(
    "Fetch project items for specific item in a project:",
    projectItemForItem.slice(0, 1),
  );

  // Fetch Assortment Items
  // NOTE: At the time of writing (2025-06-25, AM), it looks like there are no assortments with items
  // so this part of the code will not return any results.
  let assortmentWithAssortmentItems: Assortment | undefined = undefined;
  for (const assortment of allAssortments) {
    const items = await getAssortmentItems({ assortmentId: assortment.id });
    console.log("Assortment:", assortment.id, "has items:", items.length);
    if (items.length > 0) {
      assortmentWithAssortmentItems = assortment;
      break;
    }
  }

  if (!assortmentWithAssortmentItems) {
    console.error(
      "No assortments found with assortment items to demonstrate assortment item access.",
    );
    return;
  }

  const assortmentItemsInRandomAssortment = await getAssortmentItems({
    assortmentId: assortmentWithAssortmentItems.id,
  });
  console.log(
    "Fetch assortment items for a specific assortment. Sample of assortment items:",
    assortmentItemsInRandomAssortment.slice(0, 2),
  );

  const assortmentItemId = assortmentItemsInRandomAssortment[0]?.id;
  if (!assortmentItemId) {
    console.error(
      "No assortment items found to demonstrate specific assortment item access.",
    );
    return;
  }

  const specificAssortmentItem = await getAssortmentItems({
    id: assortmentItemId,
  });
  console.log("Fetch specific assortment item:", specificAssortmentItem);

  const assortmentItemForItem = await getAssortmentItems({
    itemId: assortmentItemsInRandomAssortment[0]?.itemId,
  });
  console.log(
    "Fetch assortment items for specific item in an assortment:",
    assortmentItemForItem.slice(0, 1),
  );
}
demonstrateAllAccessPatterns();

// Access Pattern Implementations
export async function getProjects(criteria: GetProjectsCriteria) {
  const client = new Entities();

  if ("id" in criteria && criteria.id) {
    return client.get({
      entityName: "project",
      id: criteria.id,
    });
  }

  return client.get({
    entityName: "project",
  });
}

export async function getAssortments(criteria: GetAssortmentsCriteria) {
  const client = new Entities();

  if ("id" in criteria && criteria.id) {
    return client.get({
      entityName: "assortment",
      id: criteria.id,
    });
  }

  // paginate to get all assortments
  // Note: This will only return the first 100 assortments by default.
  const assortments: Assortment[] = [];
  let nextPageKey: string | undefined = undefined;
  while (true) {
    const response = await client.get({
      entityName: "assortment",
      apiVersion: API_VERSION.V2,
      nextPageKey,
    });
    nextPageKey = response.nextPageKey;

    if (response.results.length === 0) {
      break; // No more assortments to fetch
    }

    assortments.push(...(response.results as Assortment[]));
  }

  return client.get({
    entityName: "assortment",
  });
}

export async function getItems(criteria: GetItemsCriteria) {
  const client = new Entities();

  if ("id" in criteria && criteria.id) {
    return client.get({
      entityName: "item",
      id: criteria.id,
    });
  }

  if (!("itemFamilyId" in criteria) || !criteria.itemFamilyId) {
    return client.get({
      entityName: "item",
    });
  }

  if ("role" in criteria && criteria.role === "option") {
    return client.get({
      entityName: "item",
      criteria: {
        itemFamilyId: criteria.itemFamilyId,
        role: "option",
        optionGroup: criteria.optionGroup,
      },
    });
  }

  if ("role" in criteria && criteria.role === "variant") {
    return client.get({
      entityName: "item",
      criteria: {
        itemFamilyId: criteria.itemFamilyId,
        role: "variant",
      },
    });
  }

  return client.get({
    entityName: "item",
    criteria: { itemFamilyId: criteria.itemFamilyId },
  });
}

export async function getProjectItems(criteria: GetProjectItemsCriteria) {
  const client = new Entities();

  if ("id" in criteria && criteria.id) {
    return client.get({
      entityName: "project-item",
      id: criteria.id,
    });
  }

  if (
    "projectId" in criteria &&
    criteria.projectId &&
    "itemId" in criteria &&
    criteria.itemId
  ) {
    return client.get({
      entityName: "project-item",
      criteria: {
        projectId: criteria.projectId,
        itemId: criteria.itemId,
      },
    });
  }

  if ("projectId" in criteria && criteria.projectId) {
    return client.get({
      entityName: "project-item",
      criteria: { projectId: criteria.projectId },
    });
  }

  if ("itemId" in criteria && criteria.itemId) {
    return client.get({
      entityName: "project-item",
      criteria: { itemId: criteria.itemId },
    });
  }

  return client.get({
    entityName: "project-item",
    criteria: { projectId: ID_OF_PROJECT_WITH_PROJECT_ITEMS },
  });
}

export async function getAssortmentItems(criteria: GetAssortmentItemsCriteria) {
  const client = new Entities();
  if ("id" in criteria && criteria.id) {
    return client.get({
      entityName: "assortment-item",
      id: criteria.id,
    });
  }

  if ("itemId" in criteria && criteria.itemId) {
    return client.get({
      entityName: "assortment-item",
      criteria: { itemId: criteria.itemId },
    });
  }

  if (!("assortmentId" in criteria) || !criteria.assortmentId) {
    throw new Error("Unsupported criteria for assortment items");
  }

  if ("itemId" in criteria && criteria.itemId) {
    return client.get({
      entityName: "assortment-item",
      criteria: {
        assortmentId: criteria.assortmentId,
        itemId: criteria.itemId,
      },
    });
  } else {
    return client.get({
      entityName: "assortment-item",
      criteria: { assortmentId: criteria.assortmentId },
    });
  }
}
