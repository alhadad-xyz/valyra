# ADR-001: Rust-Only Canisters

## Status
Accepted

## Context
We need to choose a programming language for implementing Internet Computer canisters. Options include Rust, JavaScript/TypeScript (Azle), Python (Kybra), or Motoko.

## Decision
We will use Rust exclusively for all canister implementations.

## Rationale

### Performance
- Rust compiles to efficient WebAssembly with minimal runtime overhead
- Direct memory management without garbage collection pauses
- Zero-cost abstractions for high-performance financial operations

### Ecosystem
- `ic-cdk` is the most mature and feature-complete SDK
- Extensive crates ecosystem for cryptography, serialization, HTTP clients
- Better support for HTTPS outcalls and threshold ECDSA

### Type Safety
- Compile-time guarantees prevent common bugs in financial applications
- Strong type system catches errors before deployment
- Excellent Candid integration for type-safe inter-canister calls

### Team Expertise
- Team has strong Rust experience
- Reduces context switching between languages
- Consistent development patterns across all canisters

### Production Readiness
- Most battle-tested option for IC canisters
- Lower risk for MVP deployment
- Better debugging and profiling tools

## Consequences

### Positive
- Consistent codebase with shared types and utilities
- High performance for financial calculations and data processing
- Strong type safety reduces runtime errors
- Excellent tooling and IDE support

### Negative
- Steeper learning curve for new team members unfamiliar with Rust
- Longer compile times compared to interpreted languages
- More verbose than higher-level alternatives

### Mitigation
- Comprehensive code documentation and examples
- Shared types crate to ensure consistency
- Development tooling setup guide for team onboarding

## Alternatives Considered

### Azle (TypeScript)
- **Pros**: Familiar syntax, rapid prototyping
- **Cons**: Performance overhead, less mature ecosystem, runtime type errors

### Motoko
- **Pros**: Designed specifically for IC, actor model
- **Cons**: Smaller ecosystem, team unfamiliarity, limited libraries

### Kybra (Python)
- **Pros**: Very readable, excellent for rapid prototyping
- **Cons**: Performance limitations, less mature IC integration

## Implementation Notes
- Use workspace structure for code sharing
- Implement shared types crate first
- Standardize error handling patterns
- Use ic-stable-structures for persistent storage