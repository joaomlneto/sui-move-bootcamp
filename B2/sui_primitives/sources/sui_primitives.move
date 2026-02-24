module sui_primitives::sui_primitives;
#[test_only]
use sui::dynamic_field;
#[test_only]
use sui::dynamic_object_field;
#[test_only]
use std::string::{String};
#[test_only]
use sui::test_scenario;

#[test]
fun test_numbers() {
    let a = 50;
    let b = 50;
    assert!(a == b, 601);

    let c = a + b;
    assert!(c == 100, 602);
}

#[test]
fun test_overflow() {
    let a : u16 = 500;
    let b : u16 = 500;
    let c : u16 = a + b;
    assert!(c == 1000, 603);
    assert!(1000 == 1000u16, 604);
}

#[test]
fun test_mutability() {
    let mut a = 100;
    a = a - 1;
    assert!(a == 99, 605);
}

#[test]
fun test_boolean() {
    let a = 500;
    let b = 501;
    let greater : bool = a < b;
    assert!(greater == true, 606);
}

#[test]
fun test_loop() {
    let fact = 5;
    let mut result = 1;
    let mut i = 2;

    while (i <= fact) {
        result = result * i;
        i = i + 1;
    };

    std::debug::print(&result);
    assert!(result == 120, 607);
}

#[test]
fun test_vector() {
    let mut myVec: vector<u8> = vector[10, 20, 30];

    assert!(myVec.length() == 3, 1);

    myVec.push_back(40);
    assert!(myVec.length() == 4, 2);

    let aValue = myVec.pop_back();
    assert!(aValue == 40, 3);
    assert!(myVec.length() == 3, 1);

    assert!(myVec.is_empty() == false);
    assert!(myVec.is_empty() != true);

    while(!myVec.is_empty()) {
        myVec.pop_back();
    };

    assert!(myVec.is_empty() == true);
}

#[test]
fun test_string() {
    let myStringArr: vector<u8> = b"Hello, World!";
    let myOtherString : String = b"My name is Joao".to_string();
    std::debug::print(&myStringArr); // prints garbage…?!
    std::debug::print(&myOtherString);
    assert!(myStringArr.length() == 13, 1);
    assert!(myOtherString.length() == 15, 1);
}

#[test]
fun test_string2() {
    let myStringArr = b"Hello, World!";

    let mut i : u64 = 0;
    let mut indexOfW : u64 = 0;
    while (i < myStringArr.length()) {
        indexOfW = if(myStringArr[i] == 87) { i } else { indexOfW } ;
        i = i + 1;
    };
    assert!(indexOfW == 7, 777)
}

public struct Container has key {
    id: UID,
}

public struct Item has key, store {
    id: UID,
    value: u64,
}

#[test]
fun test_dynamic_fields() {
    let mut test_scenario = test_scenario::begin(@0xCAFE);
    let mut container = Container {
        id: object::new(test_scenario.ctx()),
    };

    // PART 1: Dynamic Fields
    dynamic_field::add(&mut container.id, b"score", 100u64); // add a 'score' field to the container
    let score = dynamic_field::borrow(&container.id, b"score"); // read/borrow the value of the 'score' field
    assert!(score == 100, 123); // assert that the value is 100

    dynamic_field::remove<vector<u8>, u64>(&mut container.id, b"score"); // remove the 'score' field from the container
    assert!(!dynamic_field::exists_(&container.id, b"score"), 124); // assert that the field no longer exists

    // PART 2: Dynamic Object Fields
    let item = Item {
        id: object::new(test_scenario.ctx()),
        value: 500,
    };

    dynamic_object_field::add(&mut container.id, b"myItem", item);
    let item_ref = dynamic_object_field::borrow<vector<u8>, Item>(&container.id, b"myItem");
    assert!(item_ref.value == 500, 125);

    let item = dynamic_object_field::remove<vector<u8>, Item>(&mut container.id, b"myItem");
    assert!(!dynamic_object_field::exists_(&container.id, b"myItem"), 126);

    let Item { id, value: _ } = item;

    /**
     * Destruction Syntax:
     * let TypeofStruct {
     *     // one by one, all fields for the struct…
     *     id,
     *     fieldName: tempValueName or _
     * } = myObject;
     * object::delete(id);
     */

    object::delete(id);

    // Clean up
    let Container {
        id,
    } = container;
    object::delete(id);
    test_scenario.end();
}
