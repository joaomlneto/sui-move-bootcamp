import {useCurrentAccount, useCurrentClient, useDAppKit} from "@mysten/dapp-kit-react";
import {Transaction} from "@mysten/sui/transactions";
import {useQueryClient} from "@tanstack/react-query";
import {CurrencyIcon} from "lucide-react";
import {Card, CardHeader, CardTitle} from "./card.tsx";

const MintNFTForm = () => {
    const client = useCurrentClient();
    const account = useCurrentAccount();
    const { signAndExecuteTransaction } = useDAppKit()
    const queryClient = useQueryClient();

    const mintNFT = async () => {
        console.log("going to mint NFT...");
        if (!client) return;
        if (!account) return;

        const tx = new Transaction();

        const hero = tx.moveCall({
            target: `0xc413c2e2c1ac0630f532941be972109eae5d6734e540f20109d75a59a1efea1e::hero::mint_hero`,
            arguments: [],
            typeArguments: [],
        })
        tx.transferObjects([hero], account.address)
        const result = await signAndExecuteTransaction({transaction: tx})
        await client.waitForTransaction({result});
        await queryClient.invalidateQueries({queryKey: ["ownedObjects", account.address]})
    }

    return (<div className="m-auto d-block w-50 p-5 text-center" onClick={mintNFT}>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CurrencyIcon className="h-5 w-5" />
                    Mint NFT
                </CardTitle>
            </CardHeader>
        </Card>
    </div>)
}

export default MintNFTForm
