import {SuiJsonRpcClient} from "@mysten/sui/jsonRpc";
import {ENV} from "../env";

/**
 * Gets the dynamic object fields attached to a hero object by the object's id.
 * To get the names dynamic fields and dynamic object fields, we use the listDynamicFields method.
 * To get the Object IDs of the dynamic object fields, we use the getDynamicObjectField method.
 * For the scope of this exercise, we ignore pagination, and just fetch the first page.
 * Filters the objects and returns the object ids of the swords.
 */
export const getHeroSwordIds = async (id: string): Promise<string[]> => {
  const suiJsonRpcClient = new SuiJsonRpcClient({
    url: `https://fullnode.${ENV.SUI_NETWORK}.sui.io:443`,
    network: ENV.SUI_NETWORK,
  });

  const data = await suiJsonRpcClient.getDynamicFields({parentId: id})
  const swords: string[] = [];

  for (const dfield of data.data) {
    // filter by object type, keeping only swords
    if (dfield.objectType === `${ENV.PACKAGE_ID}::blacksmith::Sword`) {
      swords.push(dfield.objectId);
    }
  }

  return swords;
};
