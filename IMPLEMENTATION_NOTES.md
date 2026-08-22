# Implementation Notes

> Fill this in as part of your submission. 1–2 pages, bullet points are fine. Delete these
> instructions before submitting.

## 1. What I changed
<!-- Grouped by task: bugs fixed and features implemented (component + template). -->

- `diff.util.ts`: Updated the comparison logic in `computeDiff` to evaluate both `unitPrice` and `quantity` differences (`b.unitPrice !== p.unitPrice || b.quantity !== p.quantity`), fixing misclassified line-item changes
- `cr-detail.component.ts`: Updated `canApprove` and `canReject` getters to check for the user's `'cr_a_o'` policy string via `SessionService` in addition to checking `PENDING_APPROVAL` status.

## 2. Component & state model
<!-- The screens, the view-state each component exposes, and how data flows from the mock API into the
template. -->

-

## 3. Invariants I keep
<!-- Which properties the UI guarantees, and where in the component/template each is enforced. -->

| Invariant | How / where |
|---|---|

## 4. Testing strategy
<!-- What you tested (component/DOM vs pure) and why; what you deliberately skipped given the budget. -->

-

## 5. Assumptions
<!-- Where the requirements left room for interpretation, the calls you made and why. -->

-

## 6. Where I used AI
-

## 7. What I'd improve with more time
-
