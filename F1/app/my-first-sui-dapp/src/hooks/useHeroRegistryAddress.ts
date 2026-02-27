import {useCurrentClient} from "@mysten/dapp-kit-react";
import {useQuery} from "@tanstack/react-query";

export function useHeroRegistryAddress() {
    const client = useCurrentClient();
    const packageId = import.meta.env.VITE_PACKAGE_ID;

    return useQuery({
        queryKey: ["heroRegistryAddress", packageId],
        queryFn: async () => {
            if (!packageId) {
                throw new Error("VITE_PACKAGE_ID is not set");
            }

            const pkg = await client.getObject({
                objectId: packageId,
                include: { previousTransaction: true },
            });
            const digest = pkg.object.previousTransaction ?? undefined;

            if (!digest) {
                throw new Error(`Publish transaction not found for package ${packageId}`);
            }

            const txResult = await client.getTransaction({
                digest,
                include: { effects: true, objectTypes: true },
            });
            const tx =
                txResult.$kind === "Transaction"
                    ? txResult.Transaction
                    : txResult.FailedTransaction;

            const effects = tx.effects;
            const objectTypes = tx.objectTypes ?? {};
            if (!effects) {
                throw new Error(`Missing effects for tx ${digest}`);
            }

            const registryType = `${packageId}::hero::HeroRegistry`;
            const registryChange = effects.changedObjects.find((change) => {
                if (change.idOperation !== "Created") return false;
                if (objectTypes[change.objectId] !== registryType) return false;
                const owner = change.outputOwner;
                return !!owner && owner.$kind === "Shared";
            });

            if (!registryChange) {
                throw new Error(`HeroRegistry not found in publish tx ${digest}`);
            }

            return registryChange.objectId;
        },
        enabled: Boolean(packageId),
        staleTime: Infinity,
    });
}
