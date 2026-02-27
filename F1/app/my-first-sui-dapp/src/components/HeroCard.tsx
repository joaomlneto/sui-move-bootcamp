import {useCurrentClient} from "@mysten/dapp-kit-react";
import {SuiClientTypes} from "@mysten/sui/client";
import {useQuery} from "@tanstack/react-query";

export type HeroCardProps = {
    heroId: string;
};

export const HeroCard = ({heroId} : HeroCardProps) => {
    const client = useCurrentClient();

    const {data, isPending, error} = useQuery<SuiClientTypes.GetObjectResponse<{json: true}>>({
        queryKey: ["hero", heroId],
        queryFn: async () => {
            const hero = await client.getObject({
                objectId: heroId,
                include: {
                    json: true
                }
            });
            return hero
        },
    })

    const hero = (data?.object.json) as {
        name: string,
        stamina: number,
    } | undefined;

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (isPending) {
        return <div>Loading...</div>;
    }

    if (!hero) {
        return <div>No hero data found</div>;
    }

    return (
        <div className="flex items-center gap-2">
            <div className="shrink-0">
                <img className="w-8 h-8 rounded-full" src={`https://i.pravatar.cc/150?u=${data.object?.objectId}`} alt="Neil image"/>
            </div>
            <div className="flex-1 min-w-0 ms-2">
                <p className="font-medium text-heading truncate">
                    {hero.name}
                </p>
                <p className="text-xs text-body truncate">
                    <a href={`https://suiscan.xyz/${import.meta.env.VITE_SUI_NETWORK}/account/${data.object?.objectId}`} target="_blank">{data.object?.objectId}</a>
                </p>
            </div>
            <div className="inline-flex items-center font-medium text-heading">
                {hero.stamina}
            </div>
        </div>
    );
};
