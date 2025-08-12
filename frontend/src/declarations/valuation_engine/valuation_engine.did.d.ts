import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type BusinessStructure = { 'LLC' : null } |
  { 'SoleProp' : null } |
  { 'Corp' : null };
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
export interface HttpHeader { 'value' : string, 'name' : string }
export interface HttpResponse {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<HttpHeader>,
}
export type ListingStatus = { 'Sold' : null } |
  { 'Active' : null } |
  { 'Matched' : null } |
  { 'Withdrawn' : null };
export type Result = { 'Ok' : ValuationResult } |
  { 'Err' : string };
export interface TransformArgs {
  'context' : Uint8Array | number[],
  'response' : HttpResponse,
}
export interface ValuationResult {
  'valuation_range_high' : bigint,
  'market_comparable' : [] | [bigint],
  'valuation_range_low' : bigint,
  'risk_factors' : Array<string>,
  'timestamp' : bigint,
  'dcf_valuation' : bigint,
  'deal_id' : string,
  'arr_multiple' : number,
  'confidence_score' : number,
}
export interface _SERVICE {
  'calculate_valuation' : ActorMethod<[string], Result>,
  'calculate_valuation_from_deal' : ActorMethod<[DealNFT], Result>,
  'get_valuation' : ActorMethod<[string], [] | [ValuationResult]>,
  'list_valuations' : ActorMethod<[], Array<[string, ValuationResult]>>,
  'transform' : ActorMethod<[TransformArgs], HttpResponse>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
