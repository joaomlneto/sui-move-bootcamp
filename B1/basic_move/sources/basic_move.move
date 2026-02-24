module basic_move::basic_move;
use std::string::String;
#[test_only]
use sui::test_scenario;
#[test_only]
use sui::test_utils::destroy;

public struct Hero has key, store {
    id: object::UID,
    name: String,
}

public struct InsignificantWeapon has drop, store {
    power: u8,
}

// Mint a Hero
public fun mint_hero(name: String, ctx: &mut TxContext): Hero {
    let hero = Hero { id: object::new(ctx), name };
    hero
}

public fun create_insignificant_weapon(power: u8): InsignificantWeapon {
    InsignificantWeapon { power }
}

#[test]
fun test_mint() {
    let mut test = test_scenario::begin(@0xCAFE);
    let hero = mint_hero(b"Bob".to_string(), test.ctx());
    assert!(hero.name == b"Bob".to_string());
    destroy(hero);
    test.end();
}

#[test]
fun test_drop_semantics() {}
