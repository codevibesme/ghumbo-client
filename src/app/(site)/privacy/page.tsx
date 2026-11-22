import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { GrievanceContact, LegalPage, type LegalSection } from "@/components/layout/legal-page";
import { business, operator } from "@/config/legal";
import { supportEmail } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What personal data Ghumbo collects when you sign in or book a trip, why, who we share it with, how long we keep it, and your rights under India’s DPDP Act.",
  alternates: { canonical: "/privacy" },
};

/*
 * Written from what the app actually does (22 Nov 2026): instant booking with
 * Razorpay checkout; no analytics or ad trackers; sign-in by email code or
 * Google; cookies only for sign-in, Google's sign-in check and the theme.
 * Update this page when that changes.
 */

const DATA: { what: ReactNode; why: string }[] = [
  {
    what: "Your name and email, and with Google sign-in your Google profile photo",
    why: "To create your account, sign you in and show you your trips.",
  },
  {
    what: "Saved travellers: each person’s name as on their ID, date of birth and gender",
    why: "To book seats in their names, pair room-mates (gender only) and pass names to hotels and permit checks.",
  },
  {
    what: "Bookings: the trip, date, travellers, amount and booking status, and your mobile number if you add one",
    why: "To hold and confirm your seats, send your confirmation and trip pack, and let your coordinator reach you.",
  },
  {
    what: "Payments: the amount, date, method (for example UPI) and the payment provider’s reference",
    why: "To confirm your booking, issue invoices and make refunds. Card numbers, bank logins and UPI PINs stay with Razorpay; we never see them.",
  },
  {
    what: "What you tell us by email or phone, like food needs",
    why: "To plan your trip. We note only what we need for it.",
  },
  {
    what: "Sign-in records: your IP address, browser and device, and when each session was used",
    why: "To keep your account secure, let you stay signed in, and spot misuse.",
  },
];

const BROWSER: { name: string; what: string; kept: string }[] = [
  { name: "ghumbo_at", what: "Cookie that proves you’re signed in", kept: "15 minutes, renewed while you use the site" },
  { name: "ghumbo_rt", what: "Cookie that keeps you signed in", kept: "7 days" },
  { name: "ghumbo_oauth_state", what: "Cookie that protects Google sign-in", kept: "10 minutes" },
  { name: "ghumbo-theme", what: "Cookie that remembers light or dark mode, if you pick one", kept: "1 year" },
  { name: "ghumbo_device, ghumbo_signed_in", what: "Browser storage: a random device ID for your sessions, and a sign-in hint", kept: "Until you sign out or clear it" },
  { name: "ghumbo_otp, ghumbo_next", what: "Browser storage for the sign-in step and the page to return to", kept: "Until you close the tab" },
];

const tableHead = "px-4 py-3 type-stub text-muted";
const cell = "px-4 py-3 align-top text-[15px] leading-[1.45]";

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          {operator} is based at {business.address}
          {business.gstin && ` (GSTIN ${business.gstin})`}. Under India’s Digital Personal Data Protection Act, 2023
          (DPDP Act), we are the data fiduciary for the personal data described here.
        </p>
        <p>
          This policy covers ghumbo.com, our emails, and any calls or messages with you. For questions, write to{" "}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect, and why",
    body: (
      <>
        <p>We collect only what we need to run your trip. Each item and its purpose:</p>
        <div className="overflow-x-auto rounded-ticket border-[1.5px] border-line bg-card">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-[1.5px] border-line">
                <th scope="col" className={tableHead}>
                  What
                </th>
                <th scope="col" className={tableHead}>
                  Why
                </th>
              </tr>
            </thead>
            <tbody>
              {DATA.map((d) => (
                <tr key={d.why} className="border-t-[1.5px] border-rule first:border-t-0">
                  <td className={`${cell} font-semibold`}>{d.what}</td>
                  <td className={cell}>{d.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          We don’t ask you to upload ID documents to book. Travellers show their ID at hotel check-in and for permits on
          the trip; if a trip needs a copy in advance, we ask then and say why. We don’t use analytics or advertising trackers, and we never sell or rent
          personal data.
        </p>
      </>
    ),
  },
  {
    id: "consent",
    title: "Your consent",
    body: (
      <p>
        We process your data with your consent, which you give when you sign in or book a trip, and for things
        the law requires, like keeping tax records. You can withdraw consent at any time by writing to{" "}
        <a href={`mailto:${supportEmail}`}>{supportEmail}</a>, as easily as you gave it. We then stop, except for what
        the law still requires us to keep. Withdrawing doesn’t undo what we did before, and we may not be able to run a
        booked trip without your contact details.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and browser storage",
    body: (
      <>
        <p>We use a few cookies and browser storage keys, all needed for the site to work. None track you across sites.</p>
        <div className="overflow-x-auto rounded-ticket border-[1.5px] border-line bg-card">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-[1.5px] border-line">
                <th scope="col" className={tableHead}>
                  Name
                </th>
                <th scope="col" className={tableHead}>
                  What it does
                </th>
                <th scope="col" className={tableHead}>
                  How long
                </th>
              </tr>
            </thead>
            <tbody>
              {BROWSER.map((b) => (
                <tr key={b.name} className="border-t-[1.5px] border-rule first:border-t-0">
                  <td className={`${cell} font-mono text-[13px]`}>{b.name}</td>
                  <td className={cell}>{b.what}</td>
                  <td className={cell}>{b.kept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>We share data only with the services that help us run Ghumbo, and only what each one needs:</p>
        <ul>
          <li>
            <strong>Google</strong>, if you sign in with Google.
          </li>
          <li>
            <strong>Resend</strong>, which delivers our emails, including your sign-in codes.
          </li>
          <li>
            <strong>Amazon Web Services</strong> and our other hosting providers, which run our servers and database.
          </li>
          <li>
            <strong>Razorpay</strong>, our payment provider, which takes your payment on its secure checkout and
            handles refunds.
          </li>
          <li>
            <strong>Hotels, transport operators and your trip coordinator</strong>: travellers’ names and a mobile
            number, so they can host you and reach you on the trip.
          </li>
          <li>
            <strong>Government authorities</strong>, only when the law requires it, for example for permits, tax or a
            lawful request.
          </li>
        </ul>
        <p>
          Some of these services may process data outside India. That’s allowed under the DPDP Act, except to countries
          the Government of India restricts, and they’re bound to protect it.
        </p>
      </>
    ),
  },
  {
    id: "how-long",
    title: "How long we keep it",
    body: (
      <ul>
        <li>Your account: until you ask us to delete it.</li>
        <li>Bookings and saved travellers: 3 years after the trip date, in case of questions or disputes. Saved travellers you remove, and who aren’t on a booking, are deleted straight away.</li>
        <li>Payment and invoice records: 8 years, as Indian tax and company law requires.</li>
        <li>Sign-in records: 1 year.</li>
        <li>Sign-in codes: stored in a scrambled (hashed) form and deleted within 5 minutes.</li>
      </ul>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>Under the DPDP Act you can:</p>
        <ul>
          <li>get a summary of the personal data we hold about you and who we’ve shared it with;</li>
          <li>have it corrected, completed or updated;</li>
          <li>have it erased, unless the law needs us to keep it;</li>
          <li>withdraw your consent;</li>
          <li>have a complaint handled by our Grievance Officer (below);</li>
          <li>nominate someone to use these rights for you if you die or can’t act for yourself.</li>
        </ul>
        <p>
          Write to <a href={`mailto:${supportEmail}`}>{supportEmail}</a> from the email on your account. We confirm it’s
          you before acting, and reply within 30 days. If you’re not satisfied with our answer, you can complain to the
          Data Protection Board of India.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        Our trips are for adults. You must be 18 or older to sign in or book. A parent or guardian must book for anyone
        under 18 who travels with them, and gives consent for that child’s data.
      </p>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    body: (
      <p>
        The site runs over HTTPS only. Sign-in cookies can’t be read by scripts, sign-in codes and session tokens are
        stored hashed, and only the people who need your details to run your trip can see them. If a breach ever
        affects your data, we tell you and the Data Protection Board as soon as we can, with what happened and what to
        do.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We update this page when what we collect or how we use it changes, and change the date at the top. For
        important changes, we also email people with an account. Our{" "}
        <Link href="/terms">terms of use</Link> explain the rest of how Ghumbo works.
      </p>
    ),
  },
  {
    id: "grievance",
    title: "Grievance Officer",
    body: <GrievanceContact />,
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      current="privacy"
      kicker="Policies · your data"
      title="Privacy policy"
      lede="What we collect when you sign in or book a trip, why, who sees it, and how to have it corrected or deleted. No analytics, no ad trackers, never sold."
      sections={sections}
    />
  );
}
