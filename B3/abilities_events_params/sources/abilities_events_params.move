module abilities_events_params::abilities_events_params;
use std::string::String;
use sui::event;

// Test address (was previously in Move.toml [addresses])
#[test_only]
const USER: address = @0x1;

//Error Codes
const EMedalOfHonorNotAvailable: u64 = 111;

// Structs
// anything with a `key` is immediatelly a Sui object!!
public struct Hero has key {
    id: UID, // required
    name: String,
    medals: vector<Medal>,
}

public struct HeroRegistry has key, store {
    id: UID, // required
    heroes: vector<ID>,
}

public struct Medal has key, store {
    id: UID, // required
    name: String,
}

public struct MedalStorage has key, store {
    id: UID, // required
    medals: vector<Medal>,
}

// Events are emitted when a new object is created
// they are consumed by the Sui framework
// they can be captured using `event::events_by_type<HeroMinted>()`

// this one emits the hero ID and the owner address of the hero that was minted
public struct HeroMinted has copy, drop {
    hero: ID,
    owner: address,
}

// Module Initializer
// runs only once during the lifetime of the smart contract, during the publishing phase.
// It is used to set up any necessary state or configurations for the module.
fun init(ctx: &mut TxContext) {
    let registry = HeroRegistry {
        id: object::new(ctx),
        heroes: vector[],
    };
    transfer::share_object(registry);

    let mut medalStorage = MedalStorage {
        id: object::new(ctx),
        medals: vector[],
    };
    medalStorage.medals.push_back(Medal {
        id: object::new(ctx),
        name: b"Medal of Honor".to_string(),
    });
    medalStorage.medals.push_back(Medal {
        id: object::new(ctx),
        name: b"Medal of Courage".to_string(),
    });
    medalStorage.medals.push_back(Medal {
        id: object::new(ctx),
        name: b"Medal of Merit".to_string(),
    });

    transfer::share_object(medalStorage);
}

// the one who creates the hero keepts the ownership of the hero
public fun mint_hero(name: String, registry: &mut HeroRegistry, ctx: &mut TxContext): Hero {
    let freshHero = Hero {
        id: object::new(ctx), // creates a new UID
        name,
        medals: vector[],
    };
    registry.heroes.push_back(object::id(&freshHero));
    let heroMintedEvent = HeroMinted {
        hero: object::id(&freshHero),
        owner: ctx.sender(),
    };
    event::emit(heroMintedEvent);
    freshHero
}

public fun mint_and_keep_hero(name: String, registry: &mut HeroRegistry, ctx: &mut TxContext) {
    let hero = mint_hero(name, registry, ctx);
    transfer::transfer(hero, ctx.sender());
}

public fun award_medal_of_honor(hero: &mut Hero, medalStorage: &mut MedalStorage) {
    award_medal(hero, medalStorage, b"Medal of Honor".to_string());
}

fun award_medal(hero: &mut Hero, medalStorage: &mut MedalStorage, medalName: String) {
    let medal : Option<Medal> = get_medal(medalName, medalStorage);
    assert!(medal.is_some(), EMedalOfHonorNotAvailable);
    hero.medals.append(medal.to_vec());
}

fun get_medal(medalName: String, medalStorage: &mut MedalStorage) : Option<Medal> {
    let mut i = 0;
    let length = medalStorage.medals.length();
    while (i < length) {
        if (medalStorage.medals[i].name == medalName) {
            let extractedMedal = vector::remove(&mut medalStorage.medals, i);
            return option::some(extractedMedal)
        };
        i = i + 1;
    };
    option::none<Medal>()
}


/////// Tests ///////

///Importing test dependencies
#[test_only]
use sui::test_scenario as ts;
#[test_only]
use std::unit_test::{assert_eq, destroy};
#[test_only]
use sui::test_scenario::{take_shared, return_shared};

//--------------------------------------------------------------
//  Test 1: Hero Creation
//--------------------------------------------------------------
//  Objective: Verify the correct creation of a Hero object.
//  Tasks:
//      1. Complete the test by calling the `mint_hero` function with a hero name.
//      2. Assert that the created Hero's name matches the provided name.
//      3. Properly clean up the created Hero object using `destroy`.
//--------------------------------------------------------------
#[test]
fun test_hero_creation() {
    let mut test = ts::begin(USER);
    init(test.ctx());
    test.next_tx(USER);
    let mut heroRegistry = take_shared<HeroRegistry>(&test);
    let hero = mint_hero(b"Flash".to_string(), &mut heroRegistry, test.ctx());
    assert_eq!(hero.name, b"Flash".to_string());
    assert_eq!(heroRegistry.heroes.length(), 1);
    return_shared(heroRegistry);
    destroy(hero);
    test.end();
}

//--------------------------------------------------------------
//  Test 2: Event Emission
//--------------------------------------------------------------
//  Objective: Implement event emission during hero creation and verify its correctness.
//  Tasks:
//      1. Define a `HeroMinted` event struct with appropriate fields (e.g., hero ID, owner address).  Remember to add `copy, drop` abilities!
//      2. Emit the `HeroMinted` event within the `mint_hero` function after creating the Hero.
//      3. In this test, capture emitted events using `event::events_by_type<HeroMinted>()`.
//      4. Assert that the number of emitted `HeroMinted` events is 1.
//      5. Assert that the `owner` field of the emitted event matches the expected address (e.g., USER).
//--------------------------------------------------------------
#[test]
fun test_event_thrown() {
    let mut test = ts::begin(USER);
    init(test.ctx());
    test.next_tx(USER);

    let mut heroRegistry = take_shared<HeroRegistry>(&test);
    let hero = mint_hero(b"Alice".to_string(), &mut heroRegistry, test.ctx());
    let hero2 = mint_hero(b"Bob".to_string(), &mut heroRegistry, test.ctx());
    assert_eq!(heroRegistry.heroes.length(), 2);

    let events : vector<HeroMinted> = event::events_by_type<HeroMinted>();
    assert_eq!(events.length(), 2);

    let mut i = 0;
    while (i < events.length()) {
        assert_eq!(events[i].owner, USER);
        i = i + 1;
    };

    return_shared(heroRegistry);
    destroy(hero);
    destroy(hero2);
    test.end();
}

//--------------------------------------------------------------
//  Test 3: Medal Awarding
//--------------------------------------------------------------
//  Objective: Implement medal awarding functionality to heroes and verify its effects.
//  Tasks:
//      1. Define a `Medal` struct with appropriate fields (e.g., medal ID, medal name). Remember to add `key, store` abilities!
//      2. Add a `medals: vector<Medal>` field to the `Hero` struct to store the medals a hero has earned.
//      3. Create functions to award medals to heroes, e.g., `award_medal_of_honor(hero: &mut Hero)`.
//      4. In this test, mint a hero.
//      5. Award a specific medal (e.g., Medal of Honor) to the hero using your `award_medal_of_honor` function.
//      6. Assert that the hero's `medals` vector now contains the awarded medal.
//      7. Consider creating a shared `MedalStorage` object to manage the available medals.
//--------------------------------------------------------------
#[test]
fun test_medal_award() {
    let mut test = ts::begin(USER);
    init(test.ctx());
    test.next_tx(USER);
    let mut heroRegistry = take_shared<HeroRegistry>(&test);
    let mut medalStorage = take_shared<MedalStorage>(&test);
    let mut hero = mint_hero(b"Alice".to_string(), &mut heroRegistry, test.ctx());
    award_medal_of_honor(&mut hero, &mut medalStorage);
    assert_eq!(hero.medals.length(), 1);
    return_shared(heroRegistry);
    return_shared(medalStorage);
    destroy(hero);
    test.end();
}
