create table tenants(
tenant_id serial primary key,
tenant_name text,
default_timezone text,
status boolean,
default_currency int references country_currency_codes(cc_id),
created_at timestamp
);



create table country_currency_codes(
cc_id serial primary key,
currency_code varchar(3),
country_name text,
country_code text,
currency_rate float
);



create type user_type as enum ('admin','player','affiliate');



create table users(
user_id serial primary key,
tenant_id int references tenants(tenant_id),
email text unique,
phone text,
password text,
role user_type not null default 'player',
created_by int references users(user_id)
);



-- To make the created_by default



CREATE OR REPLACE FUNCTION set_created_by_self()
RETURNS TRIGGER AS $$
BEGIN
    -- If created_by is not provided, set it to self
    IF NEW.created_by IS NULL THEN
        NEW.created_by := NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER user_created_by_self_default
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION set_created_by_self();



create table tenant_regions(
region_id serial primary key,
tenant_id int references tenants(tenant_id),
time_zone timestamptz default current_timestamp,
tax_rate float
);



create type doc_type as enum('aadhar','pan');



create table user_kyc(
kyc_id serial primary key,
user_id int references users(user_id),
document_type doc_type default 'aadhar',
document_number varchar(16),
verified_status bool default false,
verified_at timestamptz default current_timestamp
);



create type wallet_type as enum('cash', 'bonus', 'points');



create table wallet(
wallet_id serial primary key,
user_id int references users(user_id),
balance float,
currency_id int references country_currency_codes(cc_id),
wallet_type wallet_type not null default 'cash'
);



create type txn_type as enum('upi', 'credit card', 'debit card', 'cash');



create table wallet_tranactions(
txn_id serial primary key,
wallet_id int references wallet(wallet_id),
txn_type txn_type not null default 'upi',
amount float,
reference_id varchar(40),
txn_done_at timestamptz
);



create table game_provider(
provider_id serial primary key,
provider_name text
);



create table game_category(
category_id serial primary key,
category_name text
);



create table game(
game_id serial primary key,
provider_id int references game_provider(provider_id),
category_id int references game_category(category_id),
game_name text,
rtp_percent float
);



create table game_session(
session_id serial primary key,
user_id int references users(user_id),
game_id int references game(game_id),
started_at timestamptz,
ended_at timestamptz
);



create table game_round(
round_id serial primary key,
session_id int references game_session(session_id),
round_number int
);



create type bet_type as enum('Single Bet', 'Multiple Bet', 'Full Cover Bet')



create table bet(
bet_id serial primary key,
round_id int references game_round(round_id),
wallet_id int references wallet(wallet_id),
bet_amount float,
payout_amount float,
bet_type bet_type not null default 'Single Bet'
);



create table jackpot(
jackpot_id serial primary key,
game_id int references game(game_id),
current_amount float
);



create table jackpot_win(
win_id serial primary key,
jackpot_id int references jackpot(jackpot_id),
user_id int references users(user_id),
win_amount float
);

