# NOAI Prep accounts backend

This folder holds the small server side behind accounts on the NOAI Prep website: Google and Apple sign-in, progress saved to your account, free access for invited people, and a one-time S$10 unlock paid through Stripe.

The website works without any of this. If the Firebase settings are not given to the website build, accounts are switched off and the site behaves exactly as before: everything is open and progress stays in the browser.

## How it works

- **Signing in** happens in the browser with Firebase Authentication (a Google or Apple pop-up window).
- **Progress** is saved in Cloud Firestore at `progress/{uid}`. The security rules in `firestore.rules` let each person read and write only their own document. Every copy of a person's progress (each open tab, the browser's own copy, the account copy) only ever grows: a lesson un-ticked or a Reset is recorded as a timestamped change rather than by removing anything, so combining two copies keeps the latest of everything and the same copies always combine the same way. Syncing is just that: the website combines the account copy with the browser's and saves the result. It is stored as text in a few parts (lessons, checkpoints, mock exams, and the answers split over `a0` to `a7`), plus the time of the latest Reset, so the save a page sends while it closes can carry just the parts that changed. Every save also carries a revision number one higher than the stored one, and the rules refuse any other: a save made from an out-of-date copy (say, one queued on a phone while the laptop saved) can't overwrite newer progress; the website reads the newer copy, combines it and saves again. "Delete my saved progress" is a Reset saved like any other change; the document itself is deleted only with the account.
- **Access** lives at `entitlements/{uid}`. The website can read its own one (so it unlocks the moment a payment lands) but only the Cloud Functions can write it.
- **Invited people** are listed in a secret called `ACCESS_WHITELIST`, which is never stored in this repository. Each time someone signs in, the website calls `syncAccess`, which gives free access if their verified email is on the list (and takes it away again if it has been removed).
- **Paying**: the Unlock button calls `createCheckoutSession`, which opens a Stripe Checkout page for S$10. When Stripe sends the person back to `#/account`, the page calls `confirmCheckout` (which asks Stripe whether the payment went through), and Stripe also sends a signed message to `stripeWebhook`. Either one unlocks the account; whichever arrives first does the work and the other finds it already done.
- **Refunds**: a full refund made in the Stripe Dashboard removes the paid access again (through the webhook). It never takes away an invited person's free access: if someone on the invite list paid and is refunded, the whitelist check gives their free access straight back. The refund is also noted in `refunds/{paymentIntent}`, so the payment can't unlock anything later (for example if Stripe delivers the payment event again after the refund).

| Path | What |
|---|---|
| `firebase.json` | Firebase settings: where the rules and functions are, and the local emulator ports. |
| `firestore.rules` | Who may read and write what in the database. |
| `functions/src/index.ts` | The four functions, their region (`asia-southeast1`, Singapore), secrets and settings. |
| `functions/src/access.ts` | `syncAccess`: the whitelist check. |
| `functions/src/checkout.ts` | `createCheckoutSession` and `confirmCheckout`. |
| `functions/src/webhook.ts`, `grant.ts` | `stripeWebhook`, and the shared unlock and refund logic. |
| `functions/src/whitelist.ts`, `entitlement.ts`, `urls.ts` | Small pure helpers (no Firebase), tested directly. |
| `functions/test/` | Unit tests with in-memory fakes, and `rules.test.ts` for the security rules. |

## What you need

- A Google account for Firebase, and a payment card for the Blaze plan (see [Costs](#costs)).
- A Stripe account registered in Singapore.
- For Apple sign-in: a paid Apple Developer Program membership. Google sign-in works without it.
- On your computer: [Node.js 22](https://nodejs.org/) and the Firebase command-line tool:

  ```bash
  npm install -g firebase-tools
  firebase login
  ```

Do the steps below in order. Copy each value somewhere safe as you go; you will need them later. Secret values (anything starting `sk_`, `rk_` or `whsec_`, the Apple `.p8` key and the whitelist) must never be put in this repository.

## Part 1: Firebase

1. **Create a project.** Go to the [Firebase console](https://console.firebase.google.com/), click **Create a project** and give it a name. Google Analytics is not needed. Write down the **project ID** shown under the name (for example `noai-prep-12345`); it appears in several addresses below as `<project-id>`.
2. **Switch to the Blaze plan.** In the console, click **Upgrade** at the bottom of the left menu and choose **Blaze (pay as you go)**. Cloud Functions and secrets need it. At this size it normally stays within the free allowance. It is still worth setting a budget alert: in the [Google Cloud console](https://console.cloud.google.com/billing), open **Billing → Budgets & alerts** and create a small budget (for example S$5) with email alerts.
3. **Create the database.** Open **Build → Firestore Database → Create database**. If asked for an edition, choose **Standard**. Choose the location **asia-southeast1 (Singapore)**; this can't be changed later. Choose **production mode**; the real rules are uploaded in Part 4.
4. **Turn on Google sign-in.** Open **Build → Authentication → Get started → Sign-in method**, choose **Google**, switch it on, pick a support email and click **Save**.
5. **Turn on Apple sign-in** (needs the Apple Developer membership; skip it for now if you don't have one, and the Apple button will show an error until you do). In [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list):
   1. **App ID**: click **+** next to Identifiers, choose **App IDs → App**, enter a description and a bundle ID such as `com.yourname.noaiprep`, tick **Sign in with Apple**, then **Continue → Register**.
   2. **Services ID**: click **+** again and choose **Services IDs**. Enter a description and an identifier such as `com.yourname.noaiprep.web` (this is your **Services ID**), then **Register**. Open it again, tick **Sign in with Apple**, click **Configure**, choose the App ID from the previous step as the primary App ID, and add:
      - Domain: `<project-id>.firebaseapp.com`
      - Return URL: `https://<project-id>.firebaseapp.com/__/auth/handler`

      Click **Next → Done → Continue → Save**.
   3. **Key**: open **Keys**, click **+**, give it a name, tick **Sign in with Apple**, click **Configure** and choose the same App ID, then **Save → Continue → Register**. Write down the **Key ID** and **download the `.p8` file**. Apple only lets you download it once.
   4. **Team ID**: shown at the top right of the developer site, and under **Membership details**.
   5. Back in Firebase: **Authentication → Sign-in method → Add new provider → Apple**. Switch it on and fill in the **Services ID**. Under the OAuth code flow section, fill in the **Team ID**, the **Key ID**, and the **private key** (open the `.p8` file in a text editor and paste all of it). Click **Save**.
6. **Allow the website's address.** Open **Authentication → Settings → Authorized domains → Add domain** and add `ainunnajib.github.io` (use your own domain if the site moves). `localhost` is already there for local testing.
7. **Register the website.** Open **Project settings** (the gear icon) **→ General → Your apps**, click the web icon `</>`, give it a nickname, leave Firebase Hosting unticked and click **Register app**. Copy these four values from the `firebaseConfig` shown: `apiKey`, `authDomain`, `projectId` and `appId`. They are public identifiers that end up in the website anyway, so they are not secrets.

## Part 2: Stripe

Stripe has a **test mode** (fake cards, no real money, keys start `sk_test_`) and a **live mode** (real payments, keys start `sk_live_`). Each mode has its own keys and its own webhook. Set everything up in test mode first (toggle at the top of the Stripe Dashboard), then repeat Part 2 in live mode when you are ready to take real payments (see Part 6).

1. **Secret key.** In the [Stripe Dashboard](https://dashboard.stripe.com/), open **Developers → API keys** and copy the **Secret key**.
2. **Payment methods.** Open **Settings → Payments → Payment methods** and switch on **PayNow** (and any others you want; cards are on already, and Apple Pay and Google Pay usually are too). The functions never pick payment methods themselves, so whatever is switched on here appears on the payment page automatically.
3. **Webhook.** Open **Developers → Webhooks** and add an endpoint (Stripe may call it an *event destination*; choose *Webhook endpoint* and events from *Your account*):
   - Endpoint URL: `https://asia-southeast1-<project-id>.cloudfunctions.net/stripeWebhook`
   - Events:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
     - `checkout.session.expired`
     - `charge.refunded`

   Save it, open the endpoint and reveal its **Signing secret** (it starts `whsec_`). You can create the endpoint before the function exists; Stripe only calls it when a payment happens.

## Part 3: Secrets

In a terminal, go to the `backend` folder of this repository, connect it to your project, and store the three secrets in Google Secret Manager (each `secrets:set` command asks you to type or paste the value):

```bash
cd backend
cp .firebaserc.example .firebaserc     # then replace YOUR_PROJECT_ID with your project ID
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set ACCESS_WHITELIST
```

`ACCESS_WHITELIST` is the list of email addresses that get full access free. Separate them with commas (spaces and new lines also work); capital letters don't matter. For example:

```
alice@example.com, bob@example.com, carol@example.com
```

Only Google or Apple accounts whose email address is verified can match. The list is never sent to the website or written to the logs.

## Part 4: Deploy

Still in the `backend` folder:

```bash
cd functions
npm ci
cd ..
firebase deploy --only firestore,functions
```

This uploads the security rules and the four functions (`syncAccess`, `createCheckoutSession`, `confirmCheckout`, `stripeWebhook`) to Singapore. The first deploy takes a few minutes while Google turns on the services it needs; if it stops with an error about an API being enabled, wait a minute and run it again.

The deploy may ask a couple of questions:

- **`SITE_URL`** (where Stripe sends people back; default `https://ainunnajib.github.io/noai-prep/`) and **`PRICE_SGD_CENTS`** (default `1000`, which is S$10.00). Press Enter to accept the defaults. Your answers are saved in `functions/.env.<project-id>` on your computer.
- How long to keep old container images: accepting the suggestion is fine.

## Part 5: Switch accounts on in the website

1. On GitHub, open the repository's **Settings → Secrets and variables → Actions** and pick the **Variables** tab (not Secrets).
2. Add these repository variables with the values from Part 1, step 7:

   | Variable | Value |
   |---|---|
   | `VITE_FIREBASE_API_KEY` | `apiKey` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` (for example `<project-id>.firebaseapp.com`) |
   | `VITE_FIREBASE_PROJECT_ID` | `projectId` |
   | `VITE_FIREBASE_APP_ID` | `appId` |
   | `VITE_FIREBASE_FUNCTIONS_REGION` | optional; only if you changed the region (default `asia-southeast1`) |

3. Rebuild the site: open the **Actions** tab, choose the **Website** workflow and click **Run workflow** on `main` (or push any change to `web/`).

Then try the whole journey in test mode: open the site, sign in, open a locked lesson, click **Unlock for S$10** and pay with the test card `4242 4242 4242 4242` (any future expiry date and any CVC). You should come back to the Account page with everything unlocked. In the Firebase console you can see the new documents under `entitlements` and `payments`. To test refunds, refund the payment in the Stripe Dashboard (**Payments**, open the payment, **Refund**) and the access is removed within a few seconds.

## Part 6: Going live

1. Finish activating your Stripe account (business details and bank account for payouts).
2. Switch the Dashboard to **live mode** and repeat Part 2: copy the live secret key, switch on PayNow in live mode, and add the same webhook endpoint in live mode (it gets a new signing secret).
3. Store the live values, then redeploy so the functions use them:

   ```bash
   firebase functions:secrets:set STRIPE_SECRET_KEY        # sk_live_...
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET    # the live endpoint's whsec_...
   firebase deploy --only functions
   ```

4. Test payments also unlock accounts. If you tested with real accounts, delete their test documents in `entitlements` and `payments` (Firebase console → Firestore) so they don't keep free access. (A refunded live payment never falls back on a test-mode one, but there is no reason to keep them.)

## Looking after it

- **Changing the invite list**: run `firebase functions:secrets:set ACCESS_WHITELIST` with the full new list, then `firebase deploy --only functions` so the functions pick up the new version. The change applies the next time each person signs in or reopens the site. Old secret versions can be cleaned up with `firebase functions:secrets:prune`.
- **Apple "Hide My Email"**: people who choose this get a relay address like `abc123@privaterelay.appleid.com`, which won't match the whitelist. Invited people should sign in with Google, or share their real email when Apple asks. Apple also only forwards email from senders you have registered with it, so Stripe receipts to a relay address may not arrive (the unlock still works).
- **Refunds**: refund the full amount in the Stripe Dashboard and paid access is removed automatically. Partial refunds leave access as it is.
- **Changing the price**: set `PRICE_SGD_CENTS` in `functions/.env.<project-id>` (for example `PRICE_SGD_CENTS=1500`) and redeploy the functions. Also update `PRICE_LABEL` in `web/src/lib/accounts/config.ts` so the website shows the new price. Payment pages already open at the old price (Stripe keeps them open for up to 24 hours) still unlock when paid.
- **Logs**: `firebase functions:log`, or **Functions → Logs** in the Firebase console. They show user ids and Stripe ids, never the whitelist.
- **Paid but not unlocked?** The Account page checks the payment with Stripe as soon as the person comes back, so this is rare. Check the endpoint in Stripe (**Developers → Webhooks**, open the endpoint, look for failed deliveries) and the function logs. A `400` from the webhook usually means `STRIPE_WEBHOOK_SECRET` doesn't match the endpoint (test and live endpoints have different secrets).
- **`auth/unauthorized-domain`** when signing in: add the site's domain in Part 1, step 6.

## Checks and local testing

From the repository's root folder:

```bash
cd backend/functions
npm ci
npm run build        # TypeScript to lib/
npm test             # unit tests with in-memory fakes; no network or emulator needed
npm run typecheck    # also type-checks the tests
```

The security-rules tests need the Firestore emulator (Java 21 or newer must be installed; the first run downloads the emulator). From `backend/`:

```bash
firebase emulators:exec --only firestore --project demo-noai "cd functions && npm run test:rules"
```

Without the emulator, `npm run test:rules` skips them.

To run the functions locally against the Auth, Firestore and Functions emulators (ports 9099, 8080 and 5001), give the emulator its own secrets in `functions/.secret.local`. This file is ignored by git; use test-mode keys and `@example.com` addresses only:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ACCESS_WHITELIST=you@example.com, friend@example.com
```

To send Stripe back to a local copy of the site, also create `functions/.env.local` containing `SITE_URL=http://localhost:5173/`. Then, from `backend/`:

```bash
cd functions && npm run build && cd ..
firebase emulators:start --only auth,firestore,functions --project demo-noai
```

The functions are then served at `http://127.0.0.1:5001/demo-noai/asia-southeast1/<name>`. To deliver test-mode Stripe events to the local webhook, install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and run:

```bash
stripe login
stripe listen --forward-to http://127.0.0.1:5001/demo-noai/asia-southeast1/stripeWebhook
```

`stripe listen` prints its own `whsec_...` signing secret: put that in `.secret.local` as `STRIPE_WEBHOOK_SECRET` and restart the emulators. (Events made with `stripe trigger` don't belong to any of your users, so the webhook answers 200 and ignores them.)

To use the website with these emulators, copy `web/.env.example` to `web/.env.development.local` and fill in the four `VITE_FIREBASE_*` values. Any non-empty values work, but set `VITE_FIREBASE_PROJECT_ID=demo-noai` to match the emulators. Also set `VITE_FIREBASE_EMULATORS=1`, then run `npm run dev` in `web/` (it opens on http://localhost:5173). Without `VITE_FIREBASE_EMULATORS=1`, the site would use the real Firebase project.

To try the website's sign-in, gating and checkout screens without any backend, run the website with `VITE_ACCOUNTS_MOCK=1` (see `web/.env.example`).

## Costs

Prices change, so check the official pricing pages; the figures here are rough guides.

- **Firebase** ([pricing](https://firebase.google.com/pricing)): the Blaze plan is pay as you go, but includes a free monthly allowance for Cloud Functions, Firestore reads, writes and storage, and Secret Manager. A study site with a few hundred students uses a small fraction of it, so expect a bill of a few cents or nothing. Small extra charges can come from storing the functions' container images. The budget alert from Part 1 tells you if anything changes.
- **Firebase Authentication**: Google and Apple sign-in are free at this scale.
- **Stripe** ([Singapore pricing](https://stripe.com/en-sg/pricing)): no monthly fee; Stripe takes a fee from each successful payment. For cards issued in Singapore this is around 3.4% + S$0.50, so roughly S$0.84 of each S$10 payment; cards from abroad cost more, and PayNow costs less. Check Stripe's pricing page for the current rates.
- **Apple Developer Program**: a yearly membership fee, needed only for Apple sign-in (see [Apple's site](https://developer.apple.com/programs/) for the current price).
