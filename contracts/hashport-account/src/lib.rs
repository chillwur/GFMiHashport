//! hashport-account — the Soroban smart account behind each Hashport wallet.
//!
//! Every WhatsApp user gets one instance of this contract. The user's device
//! never holds keys: the `owner` address (a key custodied by the Hashport
//! backend, or the user's own wallet once they export) authorizes transfers
//! out of the account, while anyone can deposit to it.

#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env,
};

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Owner,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    NotInitialized = 1,
    InvalidAmount = 2,
}

#[contract]
pub struct HashportAccount;

#[contractimpl]
impl HashportAccount {
    /// Deployed once per user; `owner` is the only address that can move funds.
    pub fn __constructor(env: Env, owner: Address) {
        env.storage().instance().set(&DataKey::Owner, &owner);
    }

    /// The address authorized to move funds out of this account.
    pub fn owner(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Owner)
            .expect("not initialized")
    }

    /// Rotate control of the account (e.g. user exports to a self-custodied
    /// wallet). Requires authorization from the current owner.
    pub fn set_owner(env: Env, new_owner: Address) {
        Self::owner(env.clone()).require_auth();
        env.storage().instance().set(&DataKey::Owner, &new_owner);
    }

    /// Balance of `token` held by this account.
    pub fn balance(env: Env, token: Address) -> i128 {
        token::Client::new(&env, &token).balance(&env.current_contract_address())
    }

    /// Send `amount` of `token` from this account to `to`.
    /// Only the owner may authorize this.
    pub fn transfer(env: Env, token: Address, to: Address, amount: i128) {
        if amount <= 0 {
            panic_with_error(&env, Error::InvalidAmount);
        }
        Self::owner(env.clone()).require_auth();
        token::Client::new(&env, &token).transfer(
            &env.current_contract_address(),
            &to,
            &amount,
        );
    }
}

fn panic_with_error(env: &Env, error: Error) -> ! {
    soroban_sdk::panic_with_error!(env, error)
}

mod test;
