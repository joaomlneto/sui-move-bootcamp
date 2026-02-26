import {SuiClientTypes} from "@mysten/sui/client";

export interface Hero {
  id: string;
  health: string;
  stamina: string;
}

interface HeroContent {
  fields: {
    id: { id: string };
    health: string;
    stamina: string;
  };
}

/**
 * Parses the content of a hero object in a SuiObjectResponse.
 * Maps it to a Hero object.
 */
export const parseHeroContent = (objectResponse: SuiClientTypes.GetObjectResponse<any>): Hero => {
  const fields = objectResponse.object.json;
  if (!fields) {
    throw new Error("No fields found in hero object");
  }
  return fields as unknown as Hero;
};
