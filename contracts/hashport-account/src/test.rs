#![cfg(test)]

use crate::{HashportAccount, HashportAccountClient};
use soroban_sdk::{testutils::Address as _, token, Address, Env};

fn setup(env: &Env) -> (HashportAccountClient<'_>, Address) {
    let owner = Address::generate(env);
    let contract_id = env.register(HashportAccount, (owner.clone(),));
    (HashportAccountClient::new(env, &contract_id), owner)
}

#[test]
fn constructor_sets_owner() {
    let env = Env::default();
    let (client, owner) = setup(&env);
    assert_eq!(client.owner(), owner);
}

#[test]
fn owner_can_transfer_tokens_out() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _owner) = setup(&env);

    let token_admin = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_id = sac.address();
    token::StellarAssetClient::new(&env, &token_id).mint(&client.address, &1_000);

    assert_eq!(client.balance(&token_id), 1_000);

    let recipient = Address::generate(&env);
    client.transfer(&token_id, &recipient, &400);

    assert_eq!(client.balance(&token_id), 600);
    assert_eq!(token::Client::new(&env, &token_id).balance(&recipient), 400);
}

#[test]
#[should_panic]
fn transfer_rejects_non_positive_amounts() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _owner) = setup(&env);

    let token_admin = Address::generate(&env);
    let token_id = env
        .register_stellar_asset_contract_v2(token_admin)
        .address();

    client.transfer(&token_id, &Address::generate(&env), &0);
}

#[test]
#[should_panic]
fn transfer_requires_owner_auth() {
    let env = Env::default();
    // No mock_all_auths: require_auth must fail.
    let (client, _owner) = setup(&env);

    let token_admin = Address::generate(&env);
    let token_id = env
        .register_stellar_asset_contract_v2(token_admin)
        .address();

    client.transfer(&token_id, &Address::generate(&env), &10);
}

#[test]
fn owner_rotation() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _owner) = setup(&env);

    let new_owner = Address::generate(&env);
    client.set_owner(&new_owner);
    assert_eq!(client.owner(), new_owner);
}
