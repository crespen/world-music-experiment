# Contributor registration — Implementation blueprint (draft)

**Status:** Design prepared, not deployed. **Do not activate** `tools/EarthToEarContributorRegistration.gs` (superseded Google Forms/Google-account design).

## Outcome

A founder-selected invitee receives an email from the Earth to Ear system, accepts a single-use invitation, proves control of their email address, obtains a private participant ID, receives a confirmation, and may submit journals. The founder receives registration/withdrawal notifications. A participant can end registration without asking the founder to edit a spreadsheet. There must be no public self-signup route.

## Proposed architecture

- **Frontend:** GitHub Pages at earthtoear.com; public pages remain static, no credential or secret in public code.
- **Authentication/authorization:** Supabase Auth with invitations and verified email; public signup disabled; an admin-only server-side invitation action.
- **Mail:** Configure a production SMTP sender (e.g. Resend/Postmark/Brevo); Supabase default sender is not appropriate for invitations to arbitrary emails. Use an authenticated sender domain. Never expose mail API keys in site JavaScript or GitHub.
- **Database:** Supabase Postgres with row-level security (RLS); use immutable auth user UUID as canonical identity and a generated private `P-xxxx` ID in a restricted table.
- **Journal:** Retain all existing archive answers. Replace Google Forms submission for *new* contributors with an authenticated journal page or secure form endpoint. A Google Form collecting unverified user-entered email is **not** adequate authorization. The client passes recording ID; the server confirms it against the catalog and derives contributor ID from the authenticated session, never from a submitted email/ID.
- **Archive integration:** Server-side bridge to the existing private Google Sheet, or a carefully tested export/sync into it, using private credentials. New entries remain traceable to immutable authenticated contributor ID. Existing P-0001 entries must not change.
- **Notifications:** After an actual database transition to Active or Withdrawn, send participant and founder an email and record delivery result for retry. Avoid double notifications from repeat calls.

## Data model

`invitations`: id (UUID), recipient email (normalized), display name, status (pending/sent/accepted/expired/revoked), invited_by, expires_at, accepted_by, accepted_at, timestamps, unique acceptance token bound to authentication provider. No public table select.

`contributors`: auth_user_id (unique), participant_id (unique, private), email, display name, status (active/withdrawn/removed), consent version/time, registered_at, withdrawn_at. Only server-side/admin functions may assign or change participant IDs; enforce founder protection.

`journal_entries`: source_recording_id, contributor auth UUID and internal ID, timestamps, structured listening answers, submission source, consent/version as needed. Participant controls own entries; separate visibility and sharing permissions. Research archive remains private.

`notification_outbox`: event UUID, intended recipient, message type, attempt count, delivery status; protect from public access.

## Invitation and registration flow

1. Founder signs into a protected administration page; selects **Invite contributor**, enters name and email, and sends invitation.
2. Server records invitation, rate-limits sends and invokes the authentication provider's invitation API. Only invitation recipients receive acceptance links.
3. Invitation acceptance verifies the email/session and checks outstanding invitation, expiry, and status. No self-registration without a valid invitation.
4. Server creates/activates contributor profile, allocates next participant ID transactionally, records consent, and marks invitation accepted.
5. System sends registration confirmation to contributor and a separate founder notification. Deliverability failures retry without creating duplicate profiles.
6. Contributor uses authenticated journal interface; backend rejects missing/inactive sessions and mismatched recording IDs.
7. Contributor chooses **End participation**. Server requires fresh authenticated confirmation, changes status to withdrawn, revokes future journal writes, emails both parties, and provides a separate route for requests concerning previously submitted personal data.
8. Founder can revoke an invitation or deactivate a participant; keep an audit trail.

## Security/reliability release gate

- [ ] Public anonymous visitor can browse recordings but cannot query private participant records or post research journals.
- [ ] Only authorized founder can send invitations; direct public calls to the invite API are rejected.
- [ ] Expired, reused, revoked, and forwarded/mismatched invite links cannot activate unauthorized accounts.
- [ ] A participant cannot select or alter their `P-xxxx` ID or submit as a different contributor.
- [ ] Duplicate invitations and retries do not generate duplicate participant identities or emails.
- [ ] Explicit consent and an accessible explanation of research data retention are displayed.
- [ ] Contributor can withdraw and receives confirmation; new journal submissions are rejected after withdrawal; existing entries are not silently deleted.
- [ ] Founder receives notification of activation and withdrawal.
- [ ] All existing 26 recording IDs, prefilled journal identity, P-0001 and historical submissions remain intact.
- [ ] End-to-end tested with at least two non-Google email providers and a mobile browser (no extra registration messaging on the site).

## Decisions/dependencies before deployment

1. Create/connect a Supabase project and choose hosting region.
2. Configure a verified outbound email domain and SMTP provider; obtain sender configuration without committing secrets.
3. Decide the founder's secure administrator sign-in; do not rely solely on the request being sent from a hidden UI.
4. Agree on the wording for invitation, consent, retention and withdrawal.
5. Define secure bridge strategy into Google Sheets and validate before switching journal links.

**No need to move the public music library or existing Google Sheet at this phase.** This is an authentication and private-submission architecture change, not a full website rebuild.
