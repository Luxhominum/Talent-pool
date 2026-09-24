# Unified Candidate Profile & Cross-Job Application Awareness

## Problem Statement
How might we ensure recruiters immediately recognize when a candidate has applied to multiple PGE vacancies, unifying their shared profile assets (CV, portfolio, psychometric tests) while tracking independent evaluation stages per role without breaking existing workflows?

## Recommended Direction
Implement a **Unified Candidate Architecture with Multi-Role Tracking**:
1. **Anchor Identity**: Normalize phone numbers (`+628...`) and emails on blur/input.
2. **Drawer Warning & Auto-Link**: When adding or editing a candidate whose phone or email matches an existing talent, display a live alert:
   `⚡ [Candidate Name] is already in the talent pool for "[Role]" (Stage: [Stage]). Click to view or manage multiple applications.`
3. **Card Badging in Bento & Table**: Any candidate who has applied to more than 1 role displays a distinct badge (e.g., `🔗 2 Jobs`) next to their role name. Clicking or hovering displays all active positions and their respective stages.
4. **Cross-Application Dossier in Modal**: The Candidate Profile Showcase includes an "Applications & Roles" section showing each applied role, its current stage, and interviewer feedback.
5. **Zero-Breakage Backward Compatibility**: Existing candidate objects continue to work seamlessly with fallback to their primary `role` and `stage`. If a candidate has multiple applications, it gracefully reads from `applications` or matches with shared phone/email across records.

## Key Assumptions to Validate
- [x] Candidates use the same WhatsApp phone number or email when applying to multiple positions.
- [x] Recruiters want independent stages per role (e.g. Shortlisted for Job A, but Prospect for Job B).
- [x] Assessments (IPIP Big Five & DISC) and CV should be shared across all applications of the same person.

## MVP Scope
- [x] In-Drawer duplicate detection linking to existing profile.
- [x] Multi-job badge (`🔗 2 Jobs`) on Bento Cards and Table rows.
- [x] Applications breakdown table in Candidate Profile Showcase modal.
- [x] Backward-compatibility with all existing 65+ candidates in Appwrite and Firebase.

## Not Doing (and Why)
- **Cross-application auto-rejection**: We will NOT automatically archive a candidate in Job B just because they were rejected in Job A (skills might differ).
- **Complex NIK / ID card requirements**: We will NOT demand government IDs; phone + email normalization is frictionless and sufficient.

## Verification Checklist
- [ ] Existing single-role candidates continue to function with zero changes in UI behavior.
- [ ] Adding/editing candidates with same phone/email prompts clear multi-role guidance.
- [ ] Bento grid, Table view, and Profile modal render multi-job badges cleanly without visual jitter.
- [ ] JavaScript syntax checks pass with 0 errors.
- [ ] Deployed safely to Firebase Hosting.
