import {useCurrentAccount, useCurrentClient} from "@mysten/dapp-kit-react";
import {useQuery} from "@tanstack/react-query";
import {Loader2, Package} from "lucide-react";
import {HeroCard} from "./HeroCard.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "./ui/card";

export function OwnedHeroesList() {
  const account = useCurrentAccount();
  const client = useCurrentClient();

  const { data, isPending, error } = useQuery({
    queryKey: ["ownedObjects", account?.address],
    queryFn: async () => {
      if (!account) return null;
      const { response } = await client.stateService.listOwnedObjects({
        owner: account.address,
        objectType: `${import.meta.env.VITE_PACKAGE_ID}::hero::Hero`,
      });
      return response.objects ?? [];
    },
    enabled: !!account,
  });

  if (!account) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Owned Heroes
        </CardTitle>
        <CardDescription>Heroes owned by the connected wallet</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-destructive-foreground">
            Error: {(error as Error)?.message || "Unknown error"}
          </p>
        ) : isPending || !data ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading heroes...
          </div>
        ) : data.length === 0 ? (
          <p className="text-muted-foreground">No heroes found</p>
        ) : (
          <div className="space-y-2">
            {data.map((object) => (
                <HeroCard
                    key={object.objectId}
                    heroId={object.objectId!}
                />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
