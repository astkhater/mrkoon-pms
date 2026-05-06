# User Stories — Mrkoon OKR/KPI/Appraisal Web App
Version: 1
Date: 2026-05-02

Format: As a [role], I want [action] so that [outcome]. Priority: P1 (must), P2 (should), P3 (nice).

## Authentication & navigation

| ID | Story | P |
|---|---|---|
| US-001 | As any user, I want to log in via email magic link so I don't manage passwords. | P1 |
| US-002 | As any user, I want to toggle EN/AR with one click so I work in my preferred language. | P1 |
| US-003 | As any user, I want my dashboard to load in the role-appropriate view automatically so I don't navigate manually. | P1 |
| US-004 | As any user, I want to see my profile (role, department, manager) so I confirm my access. | P2 |
| US-005 | As any user, I want session timeout with warning so I'm not logged out mid-form. | P2 |

## Employee

| ID | Story | P |
|---|---|---|
| US-100 | As an employee, I want to view my current KPIs and traffic-light status so I know how I'm performing. | P1 |
| US-101 | As an employee, I want to enter my KPI actuals each frequency (monthly/quarterly) so my score reflects reality. | P1 |
| US-102 | As an employee, I want to set my individual OKRs linked to department KRs so my work cascades up. | P1 |
| US-103 | As an employee, I want my manager to approve my OKRs before they lock so we agree before the period starts. | P1 |
| US-104 | As an employee, I want to complete my monthly check-in so I track progress between quarters. | P1 |
| US-105 | As an employee, I want to do quarterly self-assessment per KPI before my manager reviews so I anchor the rating. | P1 |
| US-106 | As an employee, I want to view my annual appraisal once approved so I have a record. | P1 |
| US-107 | As an employee, I want to view my bonus/commission calculation breakdown step-by-step so I understand exactly how my number was reached. | P1 |
| US-108 | As an employee, I want to see the SOP linked to each KPI so I know the procedure I'm being measured against. | P1 |
| US-109 | As an employee, I want my data viewable on mobile during check-ins so I can submit on the road. | P2 |
| US-110 | As an employee, I want a history of past appraisals visible to me so I see trend over time. | P2 |

## Manager (functional team lead)

| ID | Story | P |
|---|---|---|
| US-200 | As a manager, I want to see my direct reports' OKR progress so I support them. | P1 |
| US-201 | As a manager, I want to approve my reports' individual OKRs at period start so we lock targets. | P1 |
| US-202 | As a manager, I want to acknowledge my reports' monthly check-ins so we close the loop. | P1 |
| US-203 | As a manager, I want to rate my reports per KPI in quarterly review so the score is mine, not auto-generated. | P1 |
| US-204 | As a manager, I want to comment on each KPI rating so feedback is documented. | P1 |
| US-205 | As a manager, I want to see pending appraisals for my reports so I don't miss deadlines. | P1 |
| US-206 | As a manager, I want to view team KPI traffic lights so I spot issues fast. | P1 |
| US-207 | As a manager, I want notification when a report submits an appraisal so I act quickly. | P2 |

## Department Head

| ID | Story | P |
|---|---|---|
| US-300 | As a department head, I want to set department OKRs linked to company OKRs so cascade is enforced. | P1 |
| US-301 | As a department head, I want to see my entire department's KPI status so I see the full picture. | P1 |
| US-302 | As a department head, I want a calibration view of all team ratings so I detect inflation/compression. | P1 |
| US-303 | As a department head, I want to approve quarterly and annual appraisals for my department so I sign off as accountable. | P1 |
| US-304 | As a department head, I want to see appraisal completion rate within my department so I chase open ones. | P2 |
| US-305 | As a department head, I want department-level OKR progress charts so I report up. | P2 |

## HR

| ID | Story | P |
|---|---|---|
| US-400 | As HR, I want to create and open appraisal cycles (monthly/quarterly/annual) so the calendar runs. | P1 |
| US-401 | As HR, I want to view company-wide appraisal completion rate so I report to leadership. | P1 |
| US-402 | As HR, I want to add new users and assign role/department/manager so onboarding is smooth. | P1 |
| US-403 | As HR, I want to edit cycle deadlines so I can extend if needed. | P1 |
| US-404 | As HR, I want to see all employees' final ratings (read-only) so I record outcomes. | P1 |
| US-405 | As HR, I want overdue appraisal alerts so I follow up. | P2 |
| US-406 | As HR, I want to manage rating bands and competency catalogs so the framework can evolve. | P2 |
| US-407 | As HR, I want to see audit trail filtered by employee so I respond to disputes. | P2 |
| US-408 | As HR, I cannot see individual salaries or edit bonus payouts so confidentiality is preserved. | P1 |

## Finance

| ID | Story | P |
|---|---|---|
| US-500 | As finance, I want to view all calculated commission/bonus runs per period so I verify before payout. | P1 |
| US-501 | As finance, I want a step-by-step breakdown per employee so I can audit any line. | P1 |
| US-502 | As finance, I want to approve a payout run so it locks and exports to ERP/payroll. | P1 |
| US-503 | As finance, I want to edit compensation rates in `config.compensation_rates` so policy updates don't need code. | P1 |
| US-504 | As finance, I cannot edit appraisal scores so role separation is preserved. | P1 |
| US-505 | As finance, I want to view payout summary by department/scheme so I report cost. | P2 |
| US-506 | As finance, I want CRM commission events to sync once credentials are provided so I don't double-enter. | P2 |

## C-Level / CCO

| ID | Story | P |
|---|---|---|
| US-600 | As C-Level, I want a company-wide OKR progress dashboard so I see strategy execution. | P1 |
| US-601 | As C-Level, I want KPI health across all departments at a glance so I spot trouble. | P1 |
| US-602 | As C-Level, I want appraisal cycle completion summary so I know HR is on schedule. | P1 |
| US-603 | As C-Level, I want bonus cost summary per quarter so I forecast OpEx. | P1 |
| US-604 | As C-Level, I cannot edit any data so my role is governance, not operations. | P1 |
| US-605 | As C-Level, I want concentration risk alerts on the dashboard (independent of KPI scoring) so I act on signals. | P2 |

## Admin

| ID | Story | P |
|---|---|---|
| US-700 | As admin, I want full edit access to all config tables so I configure the system. | P1 |
| US-701 | As admin, I want to add new KPIs with formula, role weights, SOP refs, scheme refs so the catalog stays current. | P1 |
| US-702 | As admin, I want to manage user roles and re-org without code so structure changes don't block. | P1 |
| US-703 | As admin, I want full audit log access so I investigate incidents. | P1 |
| US-704 | As admin, I want to activate CRM and ERP integrations by setting env vars so dormant flips to live. | P1 |
| US-705 | As admin, I want to add a new language by adding a lang file so we can localize beyond EN/AR. | P3 |

## Cross-cutting

| ID | Story | P |
|---|---|---|
| US-800 | As any role, I want every action audited so I can trust the record. | P1 |
| US-801 | As any role, I want clear empty states explaining "why empty + what next" so I'm never stuck. | P1 |
| US-802 | As any role, I want destructive actions to require confirmation + provide undo where possible. | P1 |
| US-803 | As any role, I want the app to show a banner when CRM/ERP is dormant so I know what's not live. | P2 |
