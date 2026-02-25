import {SuiClientTypes} from "@mysten/sui/client";
import {coinWithBalance, Transaction} from "@mysten/sui/transactions";
import {SUI_TYPE_ARG} from "@mysten/sui/utils";
import {suiClient} from "../suiClient";
import {getSigner} from "./getSigner";

interface Args {
  amount: number;
  senderSecretKey: string;
  recipientAddress: string;
}

/**
 * Transfers the specified amount of SUI from the sender secret key to the recipient address.
 * Returns the transaction response, as it is returned by the SDK.
 */
export const transferSUI = async ({
  amount,
  senderSecretKey,
  recipientAddress,
}: Args): Promise<SuiClientTypes.TransactionResult> => {
  const tx = new Transaction();

  tx.transferObjects([
      coinWithBalance({
        type: SUI_TYPE_ARG,
        balance: amount,
        useGasCoin: true,
      })
  ], recipientAddress);

  return suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: getSigner({ secretKey: senderSecretKey }),
    include: {
      effects: true,
      balanceChanges: true,
    }
  });
};
