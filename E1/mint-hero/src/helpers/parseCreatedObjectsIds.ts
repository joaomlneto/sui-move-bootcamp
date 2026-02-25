import {SuiClientTypes} from "@mysten/sui/client";
import {ENV} from "../env";

interface Args {
  objectChanges: SuiClientTypes.TransactionEffects["changedObjects"];
  objectTypes: Record<string, string>;
  // example output of objectTypes:
  // {
  // 'objectId': 'package::module::StructName'
  // 'objectId2': 'package::module::StructName2'
  // ...
  // }
}

interface Response {
  swordsIds: string[];
  heroesIds: string[];
}

/**
 * Parses the provided SuiObjectChange[].
 * Extracts the IDs of the created Heroes and Swords NFTs, filtering by objectType.
 * Optimized to keep O(n) complexity.
 */
export const parseCreatedObjectsIds = ({ objectChanges, objectTypes }: Args): Response => {
  const SWORD_TYPE = `${ENV.PACKAGE_ID}::blacksmith::Sword`;
  const HERO_TYPE = `${ENV.PACKAGE_ID}::hero::Hero`;

  const swordsIds : string[] = [];
  const heroesIds : string[] = [];

  for (const objectChange of objectChanges) {
    if (objectChange.idOperation != "Created") {
      continue;
    }
    const objectId = objectChange.objectId;
    const objectType = objectTypes?.[objectId];

    if (objectType === SWORD_TYPE) {
      swordsIds.push(objectId);
    } else if (objectType === HERO_TYPE) {
      heroesIds.push(objectId);
    }
  }

  return {swordsIds, heroesIds};
};
