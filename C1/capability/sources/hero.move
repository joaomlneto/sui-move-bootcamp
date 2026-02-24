module capability::hero;
use std::string::String;

public struct Hero has key {
    id: UID,
    name: String,
}

// only admins are allowed to create new Heroes
public struct AdminCap has key {
    id: UID,
}

fun init(ctx: &mut TxContext) {
    // create a new AdminCap
    let admin_cap = AdminCap { id: object::new(ctx) };

    // transfer the AdminCap to the publisher wallet
    // the sender in the init function is the publisher of the contract!
    transfer::transfer(admin_cap, ctx.sender());
}

// we make the AdminCap a mutable reference to prevent non-admins from invoking this function
public fun create_hero(_: &AdminCap, name: String, ctx: &mut TxContext): Hero {
    // create a new Hero resource
    Hero { id: object::new(ctx), name }
}

// we make the AdminCap a mutable reference to prevent non-admins from invoking this function
public fun transfer_hero(_: &AdminCap, hero: Hero, to: address) {
    transfer::transfer(hero, to);
}

// we make the AdminCap a mutable reference to prevent non-admins from invoking this function
public fun new_admin(_: &AdminCap, to: address, ctx: &mut TxContext) {
    transfer::transfer(AdminCap { id: object::new(ctx) }, to);
}

// ===== TEST ONLY =====

#[test_only]
use sui::{test_scenario as ts};
#[test_only]
use std::unit_test::{assert_eq, destroy};

#[test_only]
const ADMIN: address = @0xAA;
#[test_only]
const ADMIN2: address = @0xBB;
#[test_only]
const USER: address = @0xCC;

#[test]
fun test_publisher_address_gets_admin_cap() {
    let mut ts = ts::begin(ADMIN);

    assert_eq!(ts::has_most_recent_for_address<AdminCap>(ADMIN), false);

    init(ts.ctx());

    ts.next_tx(ADMIN);

    assert_eq!(ts::has_most_recent_for_address<AdminCap>(ADMIN), true);

    ts.end();
}

#[test]
fun test_admin_can_create_hero() {
    let mut ts = ts::begin(ADMIN);
    init(ts.ctx());
    ts.next_tx(ADMIN);
    let admin_cap = ts.take_from_sender<AdminCap>();
    let hero = create_hero(&admin_cap, b"Hero 1".to_string(), ts.ctx());
    assert_eq!(hero.name, b"Hero 1".to_string());
    ts.return_to_sender(admin_cap);
    destroy(hero);
    ts.end();
}

#[test]
fun test_admin_can_transfer_hero() {
    let mut ts = ts::begin(ADMIN);
    init(ts.ctx());
    ts.next_tx(ADMIN);
    assert_eq!(ts::has_most_recent_for_address<Hero>(USER), false);
    let admin_cap = ts.take_from_sender<AdminCap>();
    let hero = create_hero(&admin_cap, b"Hero 1".to_string(), ts.ctx());
    transfer_hero(&admin_cap, hero, USER);
    ts.next_tx(ADMIN);
    assert_eq!(ts::has_most_recent_for_address<Hero>(USER), true);
    ts.return_to_sender(admin_cap);
    ts.end();
}

#[test]
fun test_admin_can_create_more_admins() {
    let mut ts = ts::begin(ADMIN);
    init(ts.ctx());
    ts.next_tx(ADMIN);
    let admin_cap = ts.take_from_sender<AdminCap>();
    let result = new_admin(&admin_cap, ADMIN2, ts.ctx());
    // check it succeeded
    ts.next_tx(ADMIN);
    assert_eq!(ts::has_most_recent_for_address<Hero>(ADMIN), true);
    ts.return_to_sender(admin_cap);
    ts.end();
}

#[test]
fun test_non_admin_cannot_create_hero() {
    let mut ts = ts::begin(USER);
    init(ts.ctx());
    ts.next_tx(USER);
    let admin_cap = ts.take_from_sender<AdminCap>();
    new_admin(&admin_cap, USER, ts.ctx());
    // check it failed
    ts.next_tx(USER);
    assert_eq!(ts::has_most_recent_for_address<Hero>(USER), false);
    // clean up
    ts.return_to_sender(admin_cap);
    ts.end();
}
