import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type BusinessStructure = { 'LLC' : null } |
  { 'SoleProp' : null } |
  { 'Corp' : null };
export interface CreateDealRequest {
  'website_url' : string,
  'title' : string,
  'ltv_usd' : number,
  'cac_usd' : number,
  'gross_margin_pct' : number,
  'mrr_usd' : bigint,
  'arr_usd' : bigint,
  'attachments_cid' : [] | [string],
  'net_profit_usd' : bigint,
  'description' : string,
  'gdpr_compliant' : boolean,
  'num_employees' : number,
  'logo_url' : string,
  'tax_id' : string,
  'registered_address' : string,
  'business_structure' : BusinessStructure,
  'customer_base' : string,
  'annual_operating_expenses_usd' : bigint,
  'tech_stack' : string,
  'churn_pct' : number,
}
export interface DealNFT {
  'id' : bigint,
  'status' : ListingStatus,
  'website_url' : string,
  'title' : string,
  'updated_at' : bigint,
  'ltv_usd' : number,
  'cac_usd' : number,
  'gross_margin_pct' : number,
  'mrr_usd' : bigint,
  'arr_usd' : bigint,
  'attachments_cid' : [] | [string],
  'net_profit_usd' : bigint,
  'description' : string,
  'gdpr_compliant' : boolean,
  'created_at' : bigint,
  'num_employees' : number,
  'logo_url' : string,
  'tax_id' : string,
  'seller_principal' : Principal,
  'registered_address' : string,
  'business_structure' : BusinessStructure,
  'customer_base' : string,
  'annual_operating_expenses_usd' : bigint,
  'tech_stack' : string,
  'churn_pct' : number,
}
export type ListingStatus = { 'Sold' : null } |
  { 'Active' : null } |
  { 'Matched' : null } |
  { 'Withdrawn' : null };
export type Result = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : null } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : DealNFT } |
  { 'Err' : string };
export interface UpdateDealRequest {
  'status' : [] | [ListingStatus],
  'website_url' : [] | [string],
  'title' : [] | [string],
  'ltv_usd' : [] | [number],
  'cac_usd' : [] | [number],
  'gross_margin_pct' : [] | [number],
  'mrr_usd' : [] | [bigint],
  'arr_usd' : [] | [bigint],
  'attachments_cid' : [] | [[] | [string]],
  'net_profit_usd' : [] | [bigint],
  'description' : [] | [string],
  'gdpr_compliant' : [] | [boolean],
  'num_employees' : [] | [number],
  'logo_url' : [] | [string],
  'tax_id' : [] | [string],
  'registered_address' : [] | [string],
  'business_structure' : [] | [BusinessStructure],
  'customer_base' : [] | [string],
  'annual_operating_expenses_usd' : [] | [bigint],
  'tech_stack' : [] | [string],
  'churn_pct' : [] | [number],
}
export interface _SERVICE {
  'create_deal' : ActorMethod<[CreateDealRequest], Result>,
  'delete_deal' : ActorMethod<[bigint], Result_1>,
  'get_deal' : ActorMethod<[bigint], Result_2>,
  'get_deals_by_seller' : ActorMethod<[Principal], DealNFT[]>,
  'list_ids' : ActorMethod<[], BigUint64Array | bigint[]>,
  'update_deal' : ActorMethod<[bigint, UpdateDealRequest], Result_1>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
