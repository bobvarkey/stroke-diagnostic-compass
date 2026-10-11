# End-to-end test: paid plan unlocks the app

## Goal
Prove that a real Stroke Monthly payment automatically unlocks the full app (including the Plan tab) for a brand-new account.

## What I can do automatically (no card needed)
1. **Create a second test account** in the backend (a throwaway email, not your developer account) so the test doesn't touch your access.
2. **Verify the paywall behaviour** for that account in the preview: signed out → sign-in screen; signed in without access → plans screen with the 3-day trial and both plans.
3. **Verify the webhook pipeline** by sending a test-signed webhook event (using the stored webhook secret) for the test account's subscription, then confirming the account's access flips to active and the Plan tab opens.
4. **Check the webhook event log** to confirm Razorpay's real events are arriving and being processed (deduplication, signature checks).

## What only you can do (needs a person)
1. **Add the webhook in your Razorpay dashboard** (if not done): URL `https://mudqzllcgiyivtlycrms.supabase.co/functions/v1/billing-webhook`, events `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `subscription.halted`, `subscription.completed`, secret = the webhook secret you saved.
2. **Make the real test payment**: in a private window, create a second account, choose Stroke Monthly, and pay in the Razorpay window (Razorpay test card details if keys are in test mode).

## After your payment
- Tell me "paid" and I'll check what Razorpay sent, confirm the test account's access is active, and verify the Plan tab unlocks on refresh.

## Technical details
- Webhook endpoint already verified live: unsigned probes return 400.
- Test-signed webhook uses HMAC-SHA256 of the raw body with the stored secret — same path as a real Razorpay event.
- No changes to billing code expected; this is a verification pass. Any bug found gets fixed and retested.
