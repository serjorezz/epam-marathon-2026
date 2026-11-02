---
name: create-user-story
description: 'Guidance and template for creating high-quality, Scrum-compliant User Stories in Markdown format according to EPAM Business Analysis standards. Covers the standard US metadata table, pre-conditions, testable Acceptance Criteria (AC), INVEST review, and edge case handling while explicitly omitting draft markers like "[Draft]".'
---

# Create User Story Skill

This skill defines the methodology, structure, and standards for authoring professional **User Stories** in Markdown format. It synthesizes Agile/Scrum best practices and EPAM Business Analysis guidelines (*"Software requirements in Scrum: How to turn 'I want' into clear teamwork"*).

---

## 1. Document Format & Structure

Every User Story markdown document must follow this exact layout:

```markdown
# US{ID}_{Story Name}

| Field | Value |
| --- | --- |
| **Epic** | <Epic Name> |
| **US name** | <Story Name> |
| **Role** | <User Persona / Role> |
| **Description** | As a <Role>, I want <Goal/Feature>, so that <Benefit/Value>. |

### Pre-conditions:
- <Pre-condition 1: User authentication status>
- <Pre-condition 2: Relevant screen / context>
- <Pre-condition 3: Entity or data readiness>

### Acceptance Criteria (AC):
1. <Criterion 1: UI placement and visibility>
2. <Criterion 2: Functional behavior / options>
3. <Criterion 3: Default state / selection>
4. <Criterion 4: Immediate interaction response (no page reloads)>
5. <Criterion 5: Edge cases / empty state / restrictions>
6. <Criterion 6: Accessibility and responsiveness>

### Assumptions & Open Questions (Optional):
- **Assumptions**: <High-level business / product assumptions only>
- **Open Questions**: <Unresolved UX or product questions for stakeholders>
```

> [!IMPORTANT]
> **Strict Content Rules:**
> 1. **No Technical Implementation Details**: Never include code, framework mechanics (signals, stores, lifecycle hooks), database models, or internal API calls in the user story. Keep the focus entirely on user-observable behavior and business value.
> 2. **No INVEST Checklist in the Document**: INVEST is an internal quality principle for drafting, NOT a section to paste into user story files.
> 3. **No Technical State/Dependency Sections**: Do not include "Transitional & State Requirements" or "Dependencies & Technical Notes" tables.
> 4. **No Draft Markers**: Never include `[Draft]` in the story title.
> 5. **Numbering**: Start new user stories counting from US1 (e.g., `# US1_...`).

> [!IMPORTANT]
> **Strict Formatting Rule:**
> **NEVER include `[Draft]` or draft markers** in the story title or document header. Always format the top header strictly as `# US{ID}_{Story Name}` (for example, `# US11_Guest Viewing Reservation Menu`, NOT `[Draft] US11...`).

---

## 2. Step-by-Step Story Formulation

Follow the 7-step process to transform raw stakeholder requests into team-ready backlog items:

```mermaid
flowchart LR
    A["1. User Persona"] --> B["2. Value Focus"]
    B --> C["3. Concise Story"]
    C --> D["4. Testability"]
    D --> E["5. Split Epics"]
    E --> F["6. Formulate AC"]
    F --> G["7. INVEST Review"]
```

### 1. Identify User Personas
Identify who the user actually is. Avoid generic "As a user". Use specific roles:
- `Guest (Visitor, unregistered)`
- `Customer (Reservation Owner)`
- `Waiter / Staff`
- `Restaurant Administrator`

### 2. Focus on Value, Not Features
Emphasize the business or user benefit in the **"so that"** clause:
- ❌ *Bad*: "As a user, I want search functionality."
- ❌ *Bad*: "As a user, I want notifications."
- ✅ *Good*: "As a frequent traveler using the banking app, I want to receive instant push notifications for transactions over $100, so that I can quickly detect potential fraud while abroad."

### 3. Keep the Main Story Concise
The story statement itself should be one crisp sentence:
`As a [who], I want to [what], so that [why].`
All specifics, UI details, and constraints belong in **Pre-conditions** and **Acceptance Criteria**.

### 4. Make It Testable
Ensure QA and developers can objectively evaluate whether the requirement has been satisfied. There must be no subjective terms like "user-friendly", "fast", or "appropriate" without measurable thresholds.

### 5. Split Large Stories (MVP Focus)
An MVP includes only 100% essential features to validate assumptions early, lower risk, and deliver faster.
- Break large epics into small, self-contained stories.
- Prioritize using the ratio: **Result = Value ÷ Cost**. Higher scores rank first:
  - **Do first**: High Value, Low/Medium Cost (Quick Wins)
  - **Fits well**: High Value, Medium Cost
  - **Postpone / Later**: Medium Value, High Cost

### 6. Write Verifiable Acceptance Criteria (AC)
Acceptance criteria define when a story is "Done". Use one of two formats:

#### A. Numbered Declarative Criteria (Standard)
Numbered list of specific rules, UI behaviors, and validation conditions:
1. The Guest can view the full restaurant menu structured logically by category (e.g., Appetizers, Main Course, Desserts).
2. Each menu item must clearly display name, price, serving size in grams, image, and current availability status.
3. Items currently marked "On Stop" are clearly indicated as unavailable and cannot be selected or added to the cart.

#### B. Gherkin Format (Given-When-Then)
For behavioral scenarios and automated test specifications:
```gherkin
Given location services detect the user is outside their home country
When a transaction > $100 occurs
Then a push notification is sent within 10 seconds with transaction details and "Mark as Fraud" button
```

### 7. Review with INVEST Checklist

Validate the drafted story against the 6 INVEST principles:

| Principle | Meaning & Validation Question |
| --- | --- |
| **I - Independent** | Can the story be developed, tested, and delivered on its own without waiting for in-progress work? |
| **N - Negotiable** | Does it leave room for technical design and scope trade-offs during sprint planning? |
| **V - Valuable** | Does it provide tangible value to the user or business (clear "so that" benefit)? |
| **E - Estimable** | Is the story clear enough for developers and QA to estimate effort accurately? |
| **S - Small** | Can the team comfortably complete, test, and deploy the story within one sprint? |
| **T - Testable** | Can QA execute clear verification steps to confirm completion? |

---

## 3. Assumptions & Open Questions Guidelines

When needed for refinement, include business-level assumptions and questions:
- **Assumptions**: Functional or scope assumptions made during drafting that require confirmation from the Product Owner or UX Designer. Do NOT include technical/code implementation assumptions.
- **Open Questions**: Purely product, feature scope, or user experience questions for stakeholders (e.g., "Should sort preferences persist across visits?").

---

## 4. Reusable Resources

- **Template**:
  [user-story-template.md](file:///home/serjorez/Projects/epam-marathon-2026/.ai/skills/create-user-story/templates/user-story-template.md)
- **Reference Examples**:
  - [US11: Guest Viewing Reservation Menu](file:///home/serjorez/Projects/epam-marathon-2026/.ai/skills/create-user-story/examples/US11-guest-reservation-and-menu-view.md)
  - [US01: Initiation of Group Pre-order Session](file:///home/serjorez/Projects/epam-marathon-2026/.ai/skills/create-user-story/examples/US01-initiation-of-group-pre-order-session.md)
  - [US12: Group Owner Consolidated Pre-order View](file:///home/serjorez/Projects/epam-marathon-2026/.ai/skills/create-user-story/examples/US12-group-owner-consolidated-pre-order-view.md)
