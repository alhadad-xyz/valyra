title:	[Role: Backend] JIT Re-verification logic on deposit
state:	OPEN
author:	alhadad-xyz
labels:	Role: Backend, Week 3
comments:	0
assignees:	
projects:	
milestone:	
number:	89
--
## 📖 General Description
Implement just-in-time identity re-verification when users attempt to deposit funds, ensuring their verification status is current and flagging suspicious accounts for manual review.

**Category:** Verification Services

**Technical Context:** In the `process_deposit` function, call `KYCService.check_status(user_id)` before crediting the balance. If verification has expired or risk score is elevated, insert the deposit into a `pending_deposits` table instead of `balances` and emit an admin alert. Implement a review dashboard for admins to approve/reject flagged deposits.



## Definition of Done
- [ ] Deposit webhook triggers verification check
- [ ] If verification fails, funds are flagged/returned
- [ ] Verification timestamp updated in DB
- [ ] Unit tests cover both pass and fail scenarios
- [ ] Peer review completed

## 🛠️ How to Implement
1. **Trigger:** In the deposit processing function `process_deposit`.
2. **Check:** Call `KYCService.check_status(user_id)` before crediting balance.
3. **Logic:** If flagged/risky, insert into `holds` table instead of `balances`.
4. **Alert:** Emit an internal admin alert for manual review.

## 📚 References
- 📄 [Product Requirements (PRD)](docs/prd.md)
- 📐 [Technical Design Doc (TDD)](docs/tdd.md)
- 🎨 [Design Specifications](docs/design-spec.md)
