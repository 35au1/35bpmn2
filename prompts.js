// prompts.js — LLM prompt constants
// Edit the .md source files; this file is auto-sourced by index.html

/* eslint-disable */

window.WORKFLOW_PROMPT = `# Workflow Generation Prompt

Convert user's process description into two tables: Elements and Connections. Use semantic analysis to interpret what the user expects the flow to contain. Extend where required but always maintain the structure described.

## Table 1: Elements

| Column | Values | Required | Notes |
|--------|--------|----------|-------|
| element_id | Unique string | YES | E.g., START_001, PROC_001, DEC_001, ACT_001, END_001 |
| element_name | Any text | YES | Display name |
| element_type | start, end, user_action_process, system_decision, system_action | YES | Box type |
| lock_keyword | lock_noterasable, lock_noteditable | For user_action_process only | lock_noterasable = cannot delete but may edit it or subprocesses within anyhow; lock_noteditable = fully locked |
| user_assigned | Role/user name | For user_action_process only | Who performs this |
| comment_text | Any text | NO | System background actions for this stage (auto-fill, calculations, notifications, etc.) |
| text_below | Any text | NO | Optional label |
| parent | element_id | NO | E.g. PROC_001

**Element types:**
- start: Workflow beginning. No lock/user.
- end: Workflow completion. After the e.g. closed form state. Terminal point — not a form state but after one
- user_action_process: ONLY when a human User actively performs an action on a form (fills, reviews, approves, submits). Requires lock_keyword + user_assigned. A finalized/closed form is itself a user_action_process with an outbound connection to end — never model it as end directly.
- system_decision: Diamond shape. Only when it is not User action - system checks condition and routes to ONE OF MULTIPLE paths. MUST have at least 2 outgoing conditional connections with different condition values. No lock/user.
- system_action: Parallelogram shape. System performs a single background action (auto-assign, auto-fill, send notification, add record). Has exactly ONE outgoing connection with connection_type: normal. Action description goes in comment_text. No lock/user.

## Table 2: Connections

Each row = one arrow between elements.

| Column | Values | Required | Notes |
|--------|--------|----------|-------|
| connection_id | Unique string | YES | E.g., CONN_001 |
| source_element_id | element_id | YES | Arrow starts here |
| target_element_id | element_id | YES | Arrow points here |
| condition | Text | For system_decision paths | E.g., "Tak", "Approved", "Senior Manager" |
| connection_type | normal, conditional | YES | "conditional" for system_decision outgoing paths |
| button | Text | NO | Button label triggering transition |
| validation | Text | NO | Validation rule checked before transition |
| trigger | time, button, await | YES | How transition happens |

**Triggers:**
- button: User clicks a button (button text required)
- time: Automatic after time period
- await: System/external trigger, no user action

## Rules

- user_action_process elements need lock_keyword + user_assigned
- parent is used to define subprocess that starts and ends within PROC, every actions that is performed within the PROC element will use standard elements workflow, many subprocesses may exist in PROC, PROC is in most cases form with some data, actions like generation of new records within tables, redirections are treated as internal PROC subprocesses
- every subprocesses identified has to have within PROC created a new START and END point, their parent is the PROC
- connections between PROC and subprocess cannot exist; connections related to subprocess exist only from start of subprocess till end of subprocess
- start / end / system_decision / system_action elements do NOT need lock_keyword or user_assigned
- All IDs must be unique
- system_decision: MINIMUM 2 outgoing connections, all conditional, each with a different condition value
- system_action: exactly 1 outgoing connection, connection_type: normal
- element_type must be exactly one of: start, end, user_action_process, system_decision, system_action. No other values exist.
- Returning to an existing stage is NEVER a new element — draw a direct arrow back to the existing element.
- Last action like closing form is User_action_process because reflects the last state of form; is followed by end marker
- system_decision and system_action elements that sit on the transition path between two user_action_process stages belong in the main diagram — they are not internal to a stage.
- system_decision is system check, not User action. User performs its decision by clicking buttons, systems checks appear when system verifies data
- User decision in main diagram - User action process - is always resolved as button in that User action process, do not create additional decision boxes when button defines action performed
- A closed/finalized form is a user_action_process (a form state), not an end — it has its own outbound connection to a blank end element that marks only the termination of the workflow.
- Actions that happen entirely within one form state and do not lead to any other element are internal subprocesses — they must not appear as elements or connections in the diagram.

## Ignore

Ignore form fields, notifications, data structures, UI details, integrations. Focus only on: stages, users, connections, transitions.

## OUTPUT FORMAT — MANDATORY

Respond with exactly two sections:

**1. Markdown tables for review** — print both tables in readable markdown format.

**2. Downloadable CSV files** — output as two raw CSV code blocks labeled \`elements.csv\` and \`connections.csv\`:

\`\`\`elements.csv
element_id,element_name,element_type,lock_keyword,user_assigned,comment_text,text_below,parent
...
\`\`\`

\`\`\`connections.csv
connection_id,source_element_id,target_element_id,condition,connection_type,button,validation,trigger
...
\`\`\`

Values containing commas must be wrapped in double quotes.`;

window.CHANGE_PROMPT = `# Workflow Change Prompt

You will receive three inputs:
1. Current elements.csv — the existing Elements table
2. Current connections.csv — the existing Connections table
3. Change description — a plain-language description of what the user wants to add, remove, or modify in the workflow

Your task is to semantically analyze the current tables and the change description, then produce updated versions of both tables reflecting the requested changes — while respecting all schema rules and lock constraints. When you add an element remember to add all required connections.

Please check if and what kind of lock is on each element. In case you are not able to bypass the lock, write a list of validations of what was not reflected in the tables. You generate the same type of output — two files.

## Table 1: Elements

| Column | Values | Required | Notes |
|--------|--------|----------|-------|
| element_id | Unique string | YES | Preserve existing IDs. New elements get new unique IDs. |
| element_name | Any text | YES | Display name |
| element_type | start, end, user_action_process, system_decision, system_action | YES | |
| lock_keyword | lock_noterasable, lock_noteditable | user_action_process only | lock_noterasable = cannot delete but may edit; lock_noteditable = fully locked |
| user_assigned | Role/user name | user_action_process only | |
| comment_text | Any text | NO | |
| text_below | Any text | NO | |
| parent | element_id | NO | Subprocess parent |

## Table 2: Connections

| Column | Values | Required | Notes |
|--------|--------|----------|-------|
| connection_id | Unique string | YES | Preserve existing IDs. New connections get new unique IDs. |
| source_element_id | element_id | YES | |
| target_element_id | element_id | YES | |
| condition | Text | system_decision paths only | |
| connection_type | normal, conditional | YES | |
| button | Text | NO | |
| validation | Text | NO | |
| trigger | time, button, await | YES | |

## Lock rules — CRITICAL

| lock_keyword | What you may NOT do |
|--------------|---------------------|
| lock_noteditable | Cannot rename, change any field, delete, or add/remove connections to/from this element |
| lock_noterasable | Cannot delete or remove connections that would orphan it. MAY edit name and fields. |
| (empty) | Any change allowed |

If a requested change requires modifying a locked element in a way that is not permitted — add it to the Validation list. Do NOT silently skip or partially apply it.

## Rules

- user_action_process elements need lock_keyword + user_assigned
- parent is used to define subprocess that starts and ends within PROC
- every subprocess has its own START and END point with parent = PROC
- connections between PROC and subprocess cannot exist
- system_decision: MINIMUM 2 outgoing connections, all conditional
- system_action: exactly 1 outgoing connection, connection_type: normal
- element_type must be exactly one of: start, end, user_action_process, system_decision, system_action
- Returning to an existing stage = direct arrow back, never a new element
- A finalized form is a user_action_process followed by end

## OUTPUT FORMAT — MANDATORY

Respond with exactly three sections:

**1. Markdown tables for review**

**2. Downloadable CSV files**

\`\`\`elements.csv
element_id,element_name,element_type,lock_keyword,user_assigned,comment_text,text_below,parent
...
\`\`\`

\`\`\`connections.csv
connection_id,source_element_id,target_element_id,condition,connection_type,button,validation,trigger
...
\`\`\`

**3. Validation list**

List each blocked change:
BLOCKED CHANGES:
- [element_name] (lock_noteditable): Cannot [what was requested]. Reason: element is fully locked.

If nothing was blocked: No blocked changes.

Values containing commas must be wrapped in double quotes.`;

window.USERSTORY_PROMPT = `# User Story Generation Prompt — v2 (Subprocess-Aware)

You will receive two CSV tables defining an application workflow: an Elements table and a Connections table. Convert this workflow into structured User Stories with subprocess chains — IN POLISH LANGUAGE.

## Core Concept

A user_action_process represents a form state — a stage where the form exists in a specific state and a human User can perform actions within it. The form stays in this state until the User triggers a transition that moves it to another form state.

Actions that happen within a form state (e.g. filling fields, selecting values, internal calculations) are subprocesses of that stage. They are NOT separate stages in the main diagram. Only actions that result in the form moving to a different user_action_process (or to an end) belong in the main flow.

A closed/finalized form is itself a form state (user_action_process), not just an end node. It has its own stage in the main flow with an outbound connection to the end node. It may also have subprocesses (e.g. archiving, generating a document).

CRITICAL RULE — Main diagram only: Never include in the main diagram any action, decision, or subprocess that does not result in a transition to another user_action_process or to an end. Internal form actions stay in the subprocess column only.

## Input Format

Elements CSV columns: element_id, element_name, element_type, lock_keyword, user_assigned, comment_text, text_below, parent
Connections CSV columns: connection_id, source_element_id, target_element_id, condition, connection_type, button, validation, trigger

## Output CSV Columns

| Column | Description |
|--------|-------------|
| element_id | The element_id of the user_action_process this row describes. |
| user_story | Happy path narrative in Polish: who the user is, what they do, which button they click, where the flow goes next. End with one sentence stating the purpose of this form state. |
| technical_aspects | Technical narrative: all validations, system_decision checks, system_action steps, and dependencies triggered by the user's action. Written for a developer or analyst. |
| alternative_paths | All non-happy-path outcomes as full sentences. Multiple alternatives joined by semicolons. If none: "Brak ścieżek alternatywnych." |
| subprocesses | A flowing paragraph describing internal actions the user can perform within this form state before triggering a transition. If none: "Brak podprocesów." |

## Rules

- One row per user_action_process element
- system_decision and system_action elements belong to the story of the preceding user_action_process
- The user_story column covers only the happy path and the main outbound transition
- The subprocesses column covers all internal actions within the form state that do NOT result in a transition
- All values are full sentences — no bullet points, no dashes, no lists inside a cell
- Values containing commas must be wrapped in double quotes; inner quotes escaped as ""
- CRITICAL: element IDs must NEVER appear in narrative fields. Always use element_name.

## OUTPUT FORMAT — MANDATORY

Respond with exactly two sections:

**1. Markdown table for review**

**2. Downloadable CSV** as a raw CSV code block labeled \`userstories.csv\`:

\`\`\`userstories.csv
element_id,user_story,technical_aspects,alternative_paths,subprocesses
...
\`\`\`

Values containing commas must be wrapped in double quotes. Double quotes inside values must be escaped as "".`;
