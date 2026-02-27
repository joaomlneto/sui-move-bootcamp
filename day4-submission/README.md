# Day 4 Homework

**Modules covered:** E2 (Dapp Wallet Integration), H1 (Package Upgrades), H2 (Advanced Move Patterns)

---

## Part A — Sui dApp Kit & Wallet Integration (Module E2)

### 1. Bootstrap and Explore

Set up the dApp from the E2 exercise:

```bash
cd E2
npm create @mysten/dapp   # choose react-client-dapp template
cd <app-name>
pnpm i
pnpm run dev
```

Explore the generated code and answer:

- What does the `<ConnectButton />` component do?
  - It connects to a Sui wallet and provides information about the currently connected account. This information is then available to the app.

- What React hook gives you the currently connected wallet account?
  - `useCurrentAccount()` from `@mysten/dapp-kit`.

- What hook is used for read queries against the Sui RPC?
  - `useSuiClient()`


### 2. Implement the Mint Button

Add a `<MintNFTButton />` component that:

1. Uses the `useSignAndExecuteTransaction()` hook.
2. Builds a `Transaction` with a `moveCall` to `hero::mint_hero`.
3. On success, logs the transaction digest to the console.

<details>
<summary>**Deliverable:** Paste your `MintNFTButton` component code.</summary>

```ts
export const MintNFTButton = () => {
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
```
</details>

### 3. Filter Owned Objects

Modify the `<OwnedObjects />` component to display only `Hero` NFTs:

- Add the `filter: { StructType: "<PACKAGE_ID>::hero::Hero" }` option to the `getOwnedObjects` query.

<details open>
<summary>**Deliverable:** Paste the relevant query code showing the filter.</summary>

```ts
  const { response } = await client.stateService.listOwnedObjects({
    owner: account.address,
    objectType: `0xc413c2e2c1ac0630f532941be972109eae5d6734e540f20109d75a59a1efea1e::hero::Hero`
  });
```
</details>

### 4. Auto-Refresh After Mint

After a successful mint transaction:

- Use `suiClient.waitForTransaction({ digest })` to wait for finality.
- Use `queryClient.invalidateQueries()` to refresh the owned objects list.

<details open>
<summary>**Deliverable:** Paste the code that handles post-mint refresh.</summary>

```ts
const result = await signAndExecuteTransaction({transaction: tx})
await client.waitForTransaction({result});
await queryClient.invalidateQueries({queryKey: ["ownedObjects", account.address]})
```
</details>

### 5. Conceptual Questions

- Why do we need `waitForTransaction` before invalidating queries? What could happen if we skip it?
  - The effects of the transaction might not yet be visible at the time of query invalidation - the new object would still not be part of the response.

- What is the role of React Query (`@tanstack/react-query`) in a Sui dApp?
  - Data fetching and state management.

- What is the difference between `useSignAndExecuteTransaction` and `useSignTransaction`? When would you use each?
  - useSignTransaction only signs the transaction and does not submit it to the network. This is useful if we need to do extra validation… or is part of a multi-step process…?
  - [Sponsored transactions](https://docs.sui.io/guides/developer/transactions/sponsor-txn)?
  - For most use-cases we can immediately execute the transaction…!


---

## Part B — Package Upgrades (Module H1)

### 6. Versioned Shared Objects

Read the `H1/` exercise code and answer:

- Why are published packages **immutable** on Sui? What problem does this create for developers who need to iterate?
  - Security (auditable) and performance (fast-path, stability).

- What is the role of the `Version` shared object in the upgrade pattern?
  - It's a central gatekeeper that enforces the usage of latest contract version methods.

- How does the contract enforce that only the **latest version** of the package can call certain functions?
  - Via a manual check inside every protected function: `assert!(self.version == VERSION, EInvalidPackageVersion);`. Outdated code will fail the check.


### 7. Implement the Upgrade Tasks

Complete the first two tasks from the H1 exercise:

**Task 1 — Bump the version:**
- In `version.move`, update the `VERSION` constant to `2`.
- Update the `Version` shared object's `version` field to `2`.

**Task 2 — Hero purchase system:**
- In `hero.move`, create a `mint_hero_v2` function that:
    - Accepts a `Coin<SUI>` as payment.
    - Requires the payment to be exactly 5 SUI.
    - Mints and returns the Hero.

<details>
<summary>**Deliverable:** Paste your modified `version.move` and the `mint_hero_v2` function.</summary>

```ts
module package_upgrade::version;

use sui::package::Publisher;

/// Shared object with `version` which updates on every upgrade.
/// Used as input to force the end-user to use the latest contract version.
public struct Version has key {
    id: UID,
    version: u64
}

const EInvalidPackageVersion: u64 = 0;
const EInvalidPublisher: u64 = 1;

// Task: Update version to 2
const VERSION: u64 = 2;

fun init(ctx: &mut TxContext) {
    transfer::share_object(Version { id: object::new(ctx), version: VERSION })
}

/// Function checking that the package-version matches the `Version` object.
public fun check_is_valid(self: &Version) {
    assert!(self.version == VERSION, EInvalidPackageVersion);
}

public fun migrate(pub: &Publisher, version: &mut Version) {
    assert!(pub.from_package<Version>(), EInvalidPublisher);
    version.version = VERSION;
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
```

```ts
/// @deprecated: `mint_hero` is deprecated. Use `mint_hero_v2` instead.
public fun mint_hero(_version: &Version, _ctx: &mut TxContext): Hero {
    abort(EUseMintHeroV2Instead)
}

/// Anyone can mint a hero, as long as they pay `HERO_PRICE` SUI.
/// New hero will have 100 health and 10 stamina.
public fun mint_hero_v2(version: &Version, payment: Coin<SUI>, ctx: &mut TxContext): Hero {
    version.check_is_valid();
    let hero = Hero {
        id: object::new(ctx),
        health: 100,
        stamina: 10
    };

    assert!(payment.value() == HERO_PRICE, EInvalidPrice);
    transfer::public_transfer(payment, PAYMENT_RECEIVER);

    hero
}
```
</details>

### 8. Upgrade Policies

Answer:
- What are the three upgrade policies available in Sui (`compatible`, `additive`, `depOnly`)? Briefly describe each.
  - `compatible` (default): allows any upgrade satisfying the compatibility rules.
  - `additive`: only add new functionality. cannot change existing function bodies.
  - `depOnly`: only change dependencies. cannot modify any module code.

- Under the `compatible` policy, can you remove a public function from an existing module? Why or why not?
  - no. you can never remove it - you still need to maintain **link compatibility**. you can, however, change the body of the function: just make it fail and have no side-effects to be equivalent to a deprecation.

- What happens to existing objects on-chain when you upgrade a package?
  - nothing. they remain unchanged and fully accessible. They retain their original ObjectID and TypeName.
  - Existing object via an upgraded package, they're processed by the new function logic. This allows for bugfixing or change logic for all existing objects instantly.
  - If we need to fundamentally change an object's structure, we must define a new type and provide a migration function for users to manually wrap or exchange their old objects for new ones.


---

## Part C — Advanced Move Patterns (Module H2)

### 9. Capability with Properties

Read the H2 exercise code and answer:

- How does a **Capability with Properties** differ from the simple `AdminCap` pattern from C1?
  - Granularity of control: the C1 AdminCap pattern is for global authority; this one allows for scoped authority - allows access to a specific store, not all of them.

- Give an example of a property you might put on a capability object (e.g., `can_mint: bool`, `max_supply: u64`).
  - `expiration_time`: for temporary capabilities
  - `budget`: how many "actions" this capability is valid for (or how many coins the capability allows to spend from a store)

- Why is this pattern useful for fine-grained access control?
  - Moves permission logic from the code into the data of the object itself.
  - Dynamic permissions: can change permissions without redeploying code or updating a central "allowlist".


### 10. Witness Pattern

- What problem does the **Witness pattern** solve?

  - proves **type** ownership/authority to other modules. Only the module that defines a certain type can create an instance of that type.
  - By requiring a Witness structure as an argument, the generic module can be certain it was called by the module that actually owns that type.
  - Allows to create 'protected' functions. They're technically public, but since only your module can produce the required witness object, no other module can successfully call those functions.
  - One-Time Witness (OTW) is a special version that ensures setup logic happens exactly once during module deployment.

- How does Move's type system guarantee that a witness struct can only be created in its declaring module?

  - Move's type system guarantees this by restricting the ability to instantiate a structured exclusively to the module where it is declared.

- Write pseudocode showing how module A can call a function in module B using a witness to prove its identity.

  - ```ts
    module project::module_a;
    public struct Witness has drop {}
    public entry fun call_module_b() {
    	let witness = Witness {};
    	project::module_b::protected_function(witness);
    }
    ```

  - ```ts
    module project::module_b;
    use project::module::Witness;
    public fun protected_function(_: Witness) {
    	do_something();
    }
    ```

  - or use `protected_function<W: drop>(_: W)` if *any* witness is OK. This allows to e.g. create a 'registry' where each issued object is tagged by which module issued it…


### 11. Display Pattern

- What is the **Display** standard in Sui? What problem does it solve for wallets and explorers?
  - On-chain template engine to define off-chain representation of a specific object type.
  - Standard visualization: any client can fetch formatted metadata from the full node.
  - Developers can change how an object looks by simply updating the Display object without having to migrate or rewrite underlying on-chain assets.
  - Reduced storage: store a template once in the Display object, instead of repetitive strings in every object instance.

- How do you create a `Display` object for a struct? What role does the `Publisher` play?
  1. Claim a OTW to claim package and get a Publisher object.
  2. Create display with the publisher object to prove identity
  3. Call `display.update_version()`to make the metadata live.
- If your Hero NFT has fields `name`, `stamina`, and an `image_url`, write the Display template entries that would render them.

### ~~12. Pattern Comparison (Stretch Goal)~~

~~Design a small system (pseudocode or real Move code) that uses **at least two** of the patterns from this module. For example:~~

- ~~A marketplace where only certain sellers (Capability with Properties) can list items.~~
- ~~Items use the Display pattern to render in wallets.~~
- ~~A Witness guards cross-module calls between the marketplace and a separate token module.~~

~~Describe your design in 5-10 sentences and include the key struct definitions and function signatures.~~
