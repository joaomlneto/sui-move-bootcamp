# Day 3 Homework

**Modules covered:** D1 (Sui TS SDK Basics), D2 (Read Queries), D4 (Programmable Transactions), E1 (Advanced Programmable Transactions)

---

## Part A — Sui TypeScript SDK Basics (Module D1)

### 1. SuiClient Setup
- Create a new TypeScript file that initializes a `SuiGrpcClient` connected to **Testnet**.
- Use the faucet to request SUI for a test address.
- Query the balance before and after the faucet call.
- Assert the balance increased.

**Deliverable:** Paste your code and the Jest test output showing the balance difference.

**Code:** [`src/tests/suiClient.test.ts`](../D1/ts/src/tests/suiClient.test.ts)

```
❯ npm run test

> ts-scaffold@1.0.0 test
> vitest run


 RUN  v4.0.18 /Users/joaomlneto/git/sui-move-bootcamp/D1/ts

stdout | src/tests/suiClient.test.ts > SuiClient: getBalance + faucet (devnet)
Before: 39.947780616 SUI
After : 49.947780616 SUI

 ✓ src/tests/suiClient.test.ts (1 test) 3024ms
   ✓ SuiClient: getBalance + faucet (devnet)  3023ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  13:38:58
   Duration  3.25s (transform 23ms, setup 0ms, import 101ms, tests 3.02s, environment 0ms)
```

### 2. Network Exploration
Answer:
- What are the four network options available via `getJsonRpcFullnodeUrl()`?
    - `mainnet`, `testnet`, `devnet`, `localnet`
- Why would you use `localnet` during development instead of `devnet`?
    - Lower latency, high throughput
- What is the difference between `devnet` and `testnet` in terms of data persistence and reset cycles?
    - Data persistence cannot be guaranteed: they're periodically reset.
    - Devnet is wiped on a weekly basis. Testnet longer.

---

## Part B — Read Queries (Module D2)

Complete the `D2/` exercise so that all three tests pass.

### 3. Fetch an Object

- Implement `getHero.ts` so that it fetches the Hero object by its Object ID using `suiClient.getObject`.
- The `Hero Exists` test should pass.

**Deliverable:** Paste your `getHero.ts` implementation.

**Code:** [`src/tests/getHero.test.ts`](../D2/get-hero/src/tests/getHero.test.ts)

### 4. Parse Object Fields

- Extend `getHero.ts` to include `json`.
- Implement `parseHeroContent.ts` to map the raw response into the TypeScript `Hero` interface.
- The `Hero Content` test should pass.

**Deliverable:** Paste your `parseHeroContent.ts` implementation.

**Code:** [`src/helpers/parseHeroContent.ts`](../D2/get-hero/src/helpers/parseHeroContent.ts)

### 5. Dynamic Object Fields

- Implement `getHeroSwordIds.ts` to fetch the dynamic object fields of the Hero.
- Filter them by the Sword type to extract attached sword IDs.
- The `Hero Has Attached Swords` test should pass.

**Deliverable:** Paste your `getHeroSwordIds.ts` implementation.

**Code:** [`src/helpers/getHeroSwordIds.ts`](../D2/get-hero/src/helpers/getHeroSwordIds.ts)

### 6. Conceptual Questions
- What is the difference between `content` and `json` in `getObject` include(s)?
    - `content` is the raw bytes; `json` is the content but parsed into json format.
- What are Dynamic Object Fields and how do they differ from regular struct fields? When would you use one over the other?
    - regular struct fields are defined at build time.
        - Larger objects can lead to higher gas fees in transactions.
    - dynamic fields are defined at runtime. stored and accessed similar to a hash table.
        - These are added/removed on-the-fly, and only affect gas when they are accessed.
        - Can store heterogeneous values (multiple types), unlike the `vector` type.

---

## Part C — Programmable Transaction Blocks (Module D4)

Complete the `D4/` exercise so that both tests pass.

### 7. Build a Transfer Transaction

Implement the `transferSUI.ts` helper:

- Use `tx.splitCoins(tx.gas, [amount])` to create a coin from the gas object.
- Use `tx.transferObjects` to send it to the recipient.
- Include `effects` and `balanceChanges` in the transaction include(s).

**Deliverable:** Paste your `transferSUI.ts` implementation and the passing test output.

**Code:** [`src/tests/transferSUI.test.ts`](../D4/ptbs/src/tests/transferSUI.test.ts)

```
❯ npm run test

> ptbs@1.0.0 test
> vitest run


 RUN  v4.0.18 /Users/joaomlneto/git/sui-move-bootcamp/D4/ptbs

stdout | src/tests/transferSUI.test.ts > Transfer SUI amount
Executed transaction with txDigest: MEnum6vAARpVgBV4z2He5xWdaeiT56aJ9mnb3BtxkR6

 ✓ src/tests/transferSUI.test.ts (2 tests) 1167ms
   ✓ Transfer SUI amount (2)
     ✓ Transaction Status 1ms
     ✓ SUI Balance Changes 7ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  13:52:02
   Duration  1.45s (transform 33ms, setup 0ms, import 175ms, tests 1.17s, environment 0ms)
```

### 8. Parse Balance Changes

Implement `parseBalanceChanges.ts`:

- Filter `balanceChanges` by `owner` matching the recipient.
- Filter by `coinType`: `SUI_TYPE_ARG` from `@mysten/sui/utils`.
- Return the balance change amount.

**Deliverable:** Paste your `parseBalanceChanges.ts` implementation.

**Code:** [`src/tests/parseBalanceChanges.ts`](../D4/ptbs/src/helpers/parseBalanceChanges.ts)

### 9. Gas Information

After running your transfer transaction, inspect the full JSON response and answer:
- How much gas was consumed (in MIST)?
    - [`92nWwJwVCKPchFVaNmyuC8PNNxutPiCviNs4mYW1WmkX` on testnet](https://testnet.suivision.xyz/txblock/92nWwJwVCKPchFVaNmyuC8PNNxutPiCviNs4mYW1WmkX):
        - Total Gas Fee: 0.00199788(1,997,880 MIST)
        - Computation Fee: 0.001(1,000,000 MIST)
        - Storage Fee: 0.001976(1,976,000 MIST)
        - Storage Rebate: 0.00097812(978,120 MIST)
- Why does the sender's balance decrease by more than just the transferred amount?
    - The gas cost is [mapped into a few buckets](https://testnet.suivision.xyz/txblock/92nWwJwVCKPchFVaNmyuC8PNNxutPiCviNs4mYW1WmkX).

---

## Part D — Advanced PTBs: Minting NFTs (Module E1)

Complete the `E1/` exercise so that all three tests pass.

### 10. Mint a Hero with a Sword

Implement `mintHeroWithSword.ts`:

- Use `tx.moveCall` to call `hero::mint_hero` and `blacksmith::new_sword`.
- Use `tx.moveCall` to call `hero::equip_sword`, passing the hero and sword results.
- Transfer the hero to the sender's address.
- Include `effects` and `objectTypes` in the output options.

**Deliverable:** Paste your `mintHeroWithSword.ts` implementation.

**Code:** [`src/tests/mintHeroWithSword.test.ts`](../E1/mint-hero/src/tests/mintHeroWithSword.test.ts)

### 11. Parse Created Objects

Implement `parseCreatedObjectsIds.ts`:

- Filter `objectChanges` where `idOperation === "Created"`.
- Use the `objectType` to separate the Hero ID from the Sword ID.

**Deliverable:** Paste your implementation.

**Code:** [`src/helpers/parseCreatedObjectsIds.ts`](../E1/mint-hero/src/helpers/parseCreatedObjectsIds.ts)

### 12. Verify Equipment via Dynamic Fields

Implement `getHeroSwordIds.ts`:

- Use `suiClient.listDynamicFields` to get the Hero's dynamic fields.
- Filter by the Sword type.
- Use `suiClient.getDynamicObjectField` to get each Sword's object ID.

**Deliverable:** Paste your implementation and the full passing test output.

**Code:** [`src/helpers/getHeroSwordIds.ts`](../E1/mint-hero/src/helpers/getHeroSwordIds.ts)

```
❯ npm run test

> mint-hero@1.0.0 test
> vitest run


 RUN  v4.0.18 /Users/joaomlneto/git/sui-move-bootcamp/E1/mint-hero

stdout | src/tests/mintHeroWithSword.test.ts > Mint a Hero NFT and equip a Sword
Executed transaction with txDigest: ANxwsXV9bKDEsviaWvaMmUM2fK5xUiBvba5bzHRUtzhZ

 ✓ src/tests/mintHeroWithSword.test.ts (3 tests) 1168ms
   ✓ Mint a Hero NFT and equip a Sword (3)
     ✓ Transaction Status 2ms
     ✓ Created Hero and Sword 1ms
     ✓ Hero is equiped with a Sword 108ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  13:33:58
   Duration  1.49s (transform 38ms, setup 0ms, import 210ms, tests 1.17s, environment 0ms)
```

### 13. PTB Composition (Conceptual)

Answer:
- Why are Programmable Transaction Blocks powerful compared to single-instruction transactions?
    - Allows to execute multiple Move functions, manage their objects/coins in a single *transaction*.
    - PTB commands are executed in order.
    - Effects of each transaction command in the block are applied atomically at the end of the transaction. If one command fails, the entire block fails and no effects are applied.
    - Cheaper gas fees than individual executions to achieve the same result.
- In your `mintHeroWithSword` implementation, how many Move calls does the single PTB contain? Could you add even more operations to the same PTB?
    - 3 move calls.
    - Supports up to 1024 move operations in the same PTB (1021 more!)
- What happens if one command in a PTB fails — do the previous commands still take effect?
    - Previous commands have no effect if any command fails.

---

## Submission Guidelines

- Create a folder called `day3-submission/` in your personal repo.
- Include your implemented `.ts` files for each exercise (D2, D4, E1).
- Include a markdown file with your written answers for the conceptual questions.
- Include screenshots or terminal output showing all tests passing.
- Push your submission before the start of Day 4.
