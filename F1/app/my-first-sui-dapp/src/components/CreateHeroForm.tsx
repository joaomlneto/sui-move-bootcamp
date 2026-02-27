import {useCurrentAccount, useCurrentClient, useDAppKit} from "@mysten/dapp-kit-react";
import {Transaction} from "@mysten/sui/transactions";
import {useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import {useHeroRegistryAddress} from "../hooks/useHeroRegistryAddress.ts";
import {Card} from "./ui/card.tsx";

export const CreateHeroForm = () => {
    const [formData, setFormData] = useState<{name: string, stamina: number}>({ name: '', stamina: 0 });
    const client = useCurrentClient();
    const account = useCurrentAccount();
    const { signAndExecuteTransaction } = useDAppKit()
    const queryClient = useQueryClient();
    const {data : heroRegistryAddress} = useHeroRegistryAddress();

    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!client || !account) {
            alert("No account connected!")
            return;
        }
        if (!heroRegistryAddress) {
            alert("Hero registry address not found!")
        }

        const tx = new Transaction();

        const hero = tx.moveCall({
            target: `${import.meta.env.VITE_PACKAGE_ID}::hero::new_hero`,
            arguments: [
                tx.pure.string(formData.name),
                tx.pure.u64(formData.stamina),
                tx.object(heroRegistryAddress)
            ],
            typeArguments: [],
        })
        tx.transferObjects([hero], account.address)
        const result = await signAndExecuteTransaction({transaction: tx})
        await client.waitForTransaction({result});
        await queryClient.invalidateQueries({queryKey: ["ownedObjects", account.address]})
    }

    return <Card className="m-auto d-block w-50 p-5 text-center">
        <form onSubmit={handleSubmit}>
            <div className="mb-4 w-full">
                <label htmlFor="name">Hero Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full block rounded-lg border dark:border-none dark:bg-neutral-600 py-[9px] px-3 pr-4 text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none" />
            </div>
            <div className="mb-4 w-full">
                <label htmlFor="stamina">Hero Stamina</label>
                <input type="text" id="stamina" name="stamina" value={formData.stamina} onChange={handleChange} className="w-full block rounded-lg border dark:border-none dark:bg-neutral-600 py-[9px] px-3 pr-4 text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none" />
            </div>
            <button type="submit" className="block mb-4 w-full rounded-full bg-blue-500 text-neutral-50 shadow-[0_4px_9px_-4px_rgba(51,45,45,0.7)] hover:bg-blue-600 hover:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] focus:bg-blue-800 focus:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] active:bg-blue-700 active:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal transition duration-150 ease-in-out focus:outline-none focus:ring-0">Submit</button>
        </form>
    </Card>
}
