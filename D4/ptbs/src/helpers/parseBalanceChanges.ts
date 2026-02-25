import {SuiClientTypes} from "@mysten/sui/client";
import {normalizeSuiAddress, SUI_TYPE_ARG} from "@mysten/sui/utils";

interface Args {
  balanceChanges: SuiClientTypes.BalanceChange[];
  senderAddress: string;
  recipientAddress: string;
}

interface Response {
  recipientSUIBalanceChange: number;
  senderSUIBalanceChange: number;
}

/**
 * Parses the balance changes as they are returned by the SDK.
 * Filters out and formats the ones that correspond to SUI tokens and to the defined sender and recipient addresses.
 */
export const parseBalanceChanges = ({
  balanceChanges,
  senderAddress,
  recipientAddress,
}: Args): Response => {
  const normalizedSenderAddress = normalizeSuiAddress(senderAddress);
  const normalizedRecipientAddress = normalizeSuiAddress(recipientAddress);

  const recipientAmount = balanceChanges.find(balance => {
    const owner = balance.address;
    return owner === normalizedRecipientAddress && balance.coinType === SUI_TYPE_ARG;
  })?.amount;

  const senderAmount = balanceChanges.find(balance => {
    const owner = balance.address;
    return owner === normalizedSenderAddress && balance.coinType === SUI_TYPE_ARG;
  })?.amount;

  return {
    recipientSUIBalanceChange: Number(recipientAmount ?? 0),
    senderSUIBalanceChange: Number(senderAmount ?? 0)
  }
};
