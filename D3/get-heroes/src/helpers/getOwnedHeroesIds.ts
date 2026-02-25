import {ENV} from "@/env";
import {suiClient} from "../suiClient";

/**
 * Gets all of the Hero NFTs owned by the given address.
 * Returns an array of their Object Ids.
 */
export const getOwnedHeroesIds = async (owner: string) => {
  let response = await suiClient.listOwnedObjects({
    owner,
    type: `${ENV.PACKAGE_ID}::hero::Hero`,
  })

  let heroIds = response.objects.map(({objectId}) => objectId);

  while (response.hasNextPage) {
    response = await suiClient.listOwnedObjects({
      owner,
      type: `${ENV.PACKAGE_ID}::hero::Hero`,
      cursor: response.cursor,
    });
    heroIds = [...heroIds, ...response.objects.map(({objectId}) => objectId)];
  }

  return heroIds;
};
