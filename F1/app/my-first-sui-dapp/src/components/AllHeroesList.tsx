import {useCurrentAccount, useCurrentClient} from "@mysten/dapp-kit-react";
import {useQuery} from "@tanstack/react-query";
import {Loader2, Package} from "lucide-react";
import {useHeroRegistryAddress} from "../hooks/useHeroRegistryAddress.ts";
import {HeroCard} from "./HeroCard.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "./ui/card";

export function AllHeroesList() {
  const account = useCurrentAccount();
  const client = useCurrentClient();
  const {data : heroRegistryAddress} = useHeroRegistryAddress();

  const { data : heroIds, isPending, error } = useQuery<{ids: string[]}>({
    queryKey: ["heroRegistry"],
    queryFn: async () => {
      if (!account) return null;

      const response = await client.getObject({
        objectId: heroRegistryAddress!,
        include: { json: true },
      });

      const json = response.object?.json as {
        ids: string[]
      }

      if (!json) return [];

      return json.ids ?? []
    },
    enabled: !!account && !!heroRegistryAddress,
  });

  if (!account) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          ALL Heroes
        </CardTitle>
        <CardDescription>Heroes owned by all accounts</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-destructive-foreground">
            Error: {(error as Error)?.message || "Unknown error"}
          </p>
        ) : isPending || !heroIds ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading heroes...
          </div>
        ) : heroIds.length === 0 ? (
          <p className="text-muted-foreground">No heroes found</p>
        ) : (
          <div className="space-y-2">
            {heroIds.map((object) => (
              <HeroCard
                key={object}
                heroId={object!}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
