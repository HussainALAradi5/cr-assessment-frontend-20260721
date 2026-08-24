# Implementation Notes

> Fill this in as part of your submission. 1–2 pages, bullet points are fine. Delete these
> instructions before submitting.

## 1. What I changed

<!-- Grouped by task: bugs fixed and features implemented (component + template). -->

- `diff.util.ts`: Updated the comparison logic in `computeDiff` to evaluate both `unitPrice` and `quantity` changes (`b.unitPrice !== p.unitPrice || b.quantity !== p.quantity`), fixing misclassified line-item changes.
- `cr-detail.component.ts`:
  - Implemented permission gating (`canApprove`, `canReject`) checking both status (`PENDING_APPROVAL`) and policy privileges (`cr_a_o`) via `SessionService`.
  - Added chronological audit timeline sorting (oldest first).
  - Implemented asynchronous `approve` and `reject` actions with loading flag protection and error handling.
  - Configured reactive form validation on `rejectControl` requiring a non-empty reason before submission.
- `cr-list.component.ts`: Implemented the status filter logic (`visibleRows`) to narrow change request summaries dynamically.
- `cr-detail.component.spec.ts`: Added unit tests covering rejection reason validation, chronological timeline sorting, and API error unhappy paths.

## 2. Component & state model

<!-- The screens, the view-state each component exposes, and how data flows from the mock API into the
template. -->

- **Explicit View-States:** Both list and detail components rely on a structured `ViewState<T>` union type (`idle`, `loading`, `loaded`, `error`) to represent asynchronous UI phases cleanly without hidden flags.
- **Data Flow:** Data flows asynchronously from the mock `CrApiService` into component states via Promises. Templates reactively bind to these states, ensuring proper loading spinners, error banners with retry capabilities, and fallback empty states.

## 3. Invariants I keep

<!-- Which properties the UI guarantees, and where in the component/template each is enforced. -->

| Invariant                              | How / where                                                                                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read-only users cannot perform actions | Enforced through `canApprove` and `canReject` getters checking user permissions, which directly bind to `[disabled]` attributes and `*ngIf` guards in the template. |
| Rejections require a valid reason      | Enforced using Angular Reactive Forms `Validators.required` on `rejectControl`, blocking execution and marking the control as touched if empty.                     |
| Prevent concurrent double-actions      | Guarded by the local `submitting` boolean flag inside button handlers to block duplicate API calls on slow networks.                                                |

## 4. Testing strategy

<!-- What you tested (component/DOM vs pure) and why; what you deliberately skipped given the budget. -->

- **Unit & DOM Testing:** Used Jest and Angular TestBed to test component rendering, user interactions, and DOM element states asynchronously.
- **Behavior-Driven Focus:** Focused on testing core business logic and edge cases—such as form validation triggers, chronological sorting invariants, and error resilience (`failNext`)—rather than blindly chasing code coverage percentages.

## 5. Assumptions

<!-- Where the requirements left room for interpretation, the calls you made and why. -->

- Utilized standard ISO strings (`new Date().toISOString()`) for action timestamps when dispatching approvals and rejections through the mock API service.
- Maintained the existing standalone component architecture and styling patterns without introducing external UI component libraries.

## 6. Where I used AI

- Used minimally, strictly for fixing minor syntax errors (`{` / `(`) and code optimization.

## 7. What I'd improve with more time

- Expand the Jest test suite with deeper component integration tests covering complex multi-step user workflows and edge cases.
