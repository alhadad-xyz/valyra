export const idlFactory = ({ IDL }) => {
  const ValuationResult = IDL.Record({
    'valuation_range_high' : IDL.Nat64,
    'market_comparable' : IDL.Opt(IDL.Nat64),
    'valuation_range_low' : IDL.Nat64,
    'risk_factors' : IDL.Vec(IDL.Text),
    'timestamp' : IDL.Nat64,
    'dcf_valuation' : IDL.Nat64,
    'deal_id' : IDL.Text,
    'arr_multiple' : IDL.Float64,
    'confidence_score' : IDL.Float64,
  });
  const Result = IDL.Variant({ 'Ok' : ValuationResult, 'Err' : IDL.Text });
  const ListingStatus = IDL.Variant({
    'Sold' : IDL.Null,
    'Active' : IDL.Null,
    'Matched' : IDL.Null,
    'Withdrawn' : IDL.Null,
  });
  const BusinessStructure = IDL.Variant({
    'LLC' : IDL.Null,
    'SoleProp' : IDL.Null,
    'Corp' : IDL.Null,
  });
  const DealNFT = IDL.Record({
    'id' : IDL.Nat64,
    'status' : ListingStatus,
    'website_url' : IDL.Text,
    'title' : IDL.Text,
    'updated_at' : IDL.Nat64,
    'ltv_usd' : IDL.Nat32,
    'cac_usd' : IDL.Nat32,
    'gross_margin_pct' : IDL.Float32,
    'mrr_usd' : IDL.Nat64,
    'arr_usd' : IDL.Nat64,
    'attachments_cid' : IDL.Opt(IDL.Text),
    'net_profit_usd' : IDL.Nat64,
    'description' : IDL.Text,
    'gdpr_compliant' : IDL.Bool,
    'created_at' : IDL.Nat64,
    'num_employees' : IDL.Nat16,
    'logo_url' : IDL.Text,
    'tax_id' : IDL.Text,
    'seller_principal' : IDL.Principal,
    'registered_address' : IDL.Text,
    'business_structure' : BusinessStructure,
    'customer_base' : IDL.Text,
    'annual_operating_expenses_usd' : IDL.Nat64,
    'tech_stack' : IDL.Text,
    'churn_pct' : IDL.Float32,
  });
  const HttpHeader = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const HttpResponse = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HttpHeader),
  });
  const TransformArgs = IDL.Record({
    'context' : IDL.Vec(IDL.Nat8),
    'response' : HttpResponse,
  });
  return IDL.Service({
    'calculate_valuation' : IDL.Func([IDL.Text], [Result], []),
    'calculate_valuation_from_deal' : IDL.Func([DealNFT], [Result], []),
    'get_valuation' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(ValuationResult)],
        ['query'],
      ),
    'list_valuations' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, ValuationResult))],
        ['query'],
      ),
    'transform' : IDL.Func([TransformArgs], [HttpResponse], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
