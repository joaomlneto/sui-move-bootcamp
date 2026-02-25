import {getAddress} from "@/helpers/getAddress";
import {getSigner} from "@/helpers/getSigner";
import {suiClient} from "@/suiClient";
import {SuiClientTypes} from "@mysten/sui/client";
import {Transaction} from "@mysten/sui/transactions";
import {ENV} from "../env";

/**
 * Builds, signs, and executes a transaction for:
 * * minting a Hero NFT
 * * minting a Sword NFT
 * * attaching the Sword to the Hero
 * * transferring the Hero to the signer
 */
export const mintHeroWithSword =
    async (): Promise<SuiClientTypes.TransactionResult<{ effects: true, objectTypes: true }>> => {
        const tx = new Transaction();

        let hero = tx.moveCall({
            target: `${ENV.PACKAGE_ID}::hero::mint_hero`,
            // could also be specified as below:
            // function: "mint_hero",
            // package: ENV.PACKAGE_ID,
            // module: "hero",
            arguments: [], // no arguments
        })

        let sword = tx.moveCall({
            target: `${ENV.PACKAGE_ID}::blacksmith::new_sword`,
            arguments: [tx.pure.u64(1000)],
        })

        tx.moveCall({
            target: `${ENV.PACKAGE_ID}::hero::equip_sword`,
            arguments: [hero, sword],
        })

        tx.transferObjects([hero], getAddress({secretKey: ENV.USER_SECRET_KEY}))

        return await suiClient.signAndExecuteTransaction({
            transaction: tx,
            signer: getSigner({ secretKey: ENV.USER_SECRET_KEY }),
            include: {
                effects: true,
                objectTypes: true,
            }
        });
    };
