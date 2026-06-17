# Workflow Description Correction Prompt

You will receive a raw user description of a business process. Your task is to rewrite and complete it so it is ready to be converted into a valid workflow diagram.

---

## What the workflow diagram needs

A valid workflow consists of:

- A **starting point** — the beginning of the process
- **User stages** — points where a person actively works on something and decides what happens next by clicking a button
- **System checks** — points where the system automatically evaluates a condition and routes the flow in one of two or more directions (only include these if the original description implies the system makes a routing decision)
- **System actions** — points where the system automatically does something in the background without user involvement (only include these if the original description implies an automatic background action)
- An **ending point** — the final state after the last user stage

Every **user stage** must have:
- A named person or role who performs it — if not mentioned, use `[MISSING USER]`
- At least one button the user clicks to move to the next stage — if not mentioned, use `[MISSING BUTTON NAME]`

Every **system check** must have:
- At least two possible outcomes with named conditions — if not mentioned, use `[MISSING CONDITION]`

A stage name that is not mentioned must use `[MISSING STAGE NAME]`.

---

## Rules for using placeholders

**Only insert a placeholder when the information is genuinely required for the process to make sense and is missing from the description.**

- Do NOT add validations, system checks, or system actions unless the original description implies they exist
- Do NOT add extra users or buttons beyond what the process logically requires
- Do NOT insert technical terms, schema names, or type names into the text
- A simple transition from one user stage to the next does not require any additional steps unless the description says so
- Backward paths (returning to a previous stage) must be stated explicitly if they exist in the description

---

## Placeholder patterns

Use only these strings, only when truly needed:

- `[MISSING USER]` — when a stage clearly needs a person but none is named
- `[MISSING BUTTON NAME]` — when a user stage clearly needs a button to proceed but none is named
- `[MISSING CONDITION]` — when a routing decision exists but the condition values are not named
- `[MISSING STAGE NAME]` — when a stage is referenced but not named
- `[MISSING FINAL STATE NAME]` — when the final closed state of the process is not named

---

## Output format

Write the corrected description as plain paragraphs — one paragraph per stage, in process order.

Each paragraph describes what happens at that stage: who is involved, what they do, and what button they click to move forward (or what automatic action occurs and where it leads).

**CRITICAL: Return ONLY the corrected process text. No summaries, no counts, no comments, no explanations. Nothing before or after.**

**CRITICAL: Write exclusively in the same language as the input. Polish input = Polish output. English input = English output. Never switch languages.**

---

## Example

**Input:** "User fills invoice, sends to manager. Manager approves or rejects. If rejected goes back."

**Output:**

The `[MISSING USER]` fills in the invoice details and clicks `[MISSING BUTTON NAME]` to send the form to the manager for review.

The manager reviews the invoice and either clicks Approve to close the invoice, or clicks Reject to return the form to the previous stage where the original user can make corrections.

The invoice reaches its final closed state and the process ends.
