import {useCurrentAccount} from "@mysten/dapp-kit-react";
import {CheckCircle2, Wallet} from "lucide-react";
import {AllHeroesList} from "./components/AllHeroesList.tsx";
import {CreateHeroForm} from "./components/CreateHeroForm.tsx";
import {OwnedHeroesList} from "./components/OwnedHeroesList.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "./components/ui/card";

export function WalletStatus() {
  const account = useCurrentAccount();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Status
          </CardTitle>
            <CardDescription>
                {account
                    ? `Your wallet is connected to ${import.meta.env.VITE_SUI_NETWORK}`
                    : "Connect your wallet to get started"}
            </CardDescription>
        </CardHeader>
        <CardContent>
          {account ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="font-mono text-sm break-all">
                  <a href={`https://suiscan.xyz/testnet/account/${account.address}`} target="_blank">{account.address}</a>
              </span>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Click the connect button above to link your Sui wallet.
            </p>
          )}
        </CardContent>
      </Card>

      <CreateHeroForm/>
      <OwnedHeroesList />
      <AllHeroesList />
    </div>
  );
}
