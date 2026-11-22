import type { Metadata } from "next";
import Link from "next/link";
import { GrievanceContact, LegalPage, type LegalSection } from "@/components/layout/legal-page";
import { business, operator } from "@/config/legal";
import { supportEmail, supportPhone } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "The terms for booking and travelling with Ghumbo: how booking and payment work, what’s included, conduct on the trip, our responsibilities and how disputes are handled.",
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <>
        <p>
          These terms are an agreement between you and {operator}, {business.address}
          {business.gstin && ` (GSTIN ${business.gstin})`}. They apply when you use ghumbo.com, book a trip, or travel with
          us. Our <Link href="/cancellation-policy">cancellation policy</Link> and{" "}
          <Link href="/privacy">privacy policy</Link> are part of them.
        </p>
        <p>
          You confirm you’ve read them, and the cancellation policy, when you tick the box at checkout. If something here
          conflicts with what we agree with you in writing for a particular trip, the written agreement wins.
        </p>
      </>
    ),
  },
  {
    id: "who-can-book",
    title: "Who can book",
    body: (
      <ul>
        <li>You must be 18 or older. A parent or guardian books for anyone under 18 and travels with them.</li>
        <li>
          If you book for others, you confirm they’ve agreed to these terms, and that the names and contact details you
          give are correct.
        </li>
        <li>You’re responsible for being fit enough for the trip you choose. Ask us if you’re unsure about a trek or a long drive.</li>
      </ul>
    ),
  },
  {
    id: "how-booking-works",
    title: "How booking works",
    body: (
      <>
        <ol className="m-0 flex list-decimal flex-col gap-1.5 pl-5">
          <li className="pl-1">
            <strong>Sign in and pick your travellers.</strong> Choose a departure, then tick everyone who’s coming. Names
            must match their government ID.
          </li>
          <li className="pl-1">
            <strong>We hold your seats for 10 minutes.</strong> Pressing Pay creates your booking and holds the seats while
            you pay. Nothing is charged at this point.
          </li>
          <li className="pl-1">
            <strong>You pay in full on Razorpay’s secure checkout</strong> by UPI, card or netbanking. Your booking is
            confirmed once the payment clears, and we email your confirmation and invoice.
          </li>
        </ol>
        <p>
          If the 10 minutes run out before the payment goes through, the booking expires and the seats go back on sale.
          You can start a new booking at any time. If money leaves your account after a booking has expired, we confirm
          the seats if they’re still free; if they aren’t, we refund the full amount automatically. You will never be
          charged twice for one booking.
        </p>
      </>
    ),
  },
  {
    id: "prices-and-payment",
    title: "Prices and payment",
    body: (
      <ul>
        <li>
          Prices are per person, twin sharing, and include all taxes. There’s no booking fee. Every traveller pays the same
          price for a seat, whatever their age. The total shown at checkout is the amount you pay.
        </li>
        <li>
          You pay {business.name} only, through Razorpay’s checkout on ghumbo.com. We never ask you to pay a personal
          account, and never ask for an OTP, card details or a UPI PIN over the phone or chat.
        </li>
        <li>We email a receipt and invoice from billing@mail.ghumbo.com for every payment.</li>
      </ul>
    ),
  },
  {
    id: "included",
    title: "What’s included",
    body: (
      <p>
        Each trip page lists what’s in the ticket: stays, transport from the start point, the meals and activities
        named, and a coordinator. Unless a trip page says otherwise, it doesn’t include your train or flight to the
        start point, meals not listed, optional add-ons, tips and travel insurance. Items marked “Pay direct” are paid to
        the venue on the trip.
      </p>
    ),
  },
  {
    id: "cancellations",
    title: "Cancellations, changes and refunds",
    body: (
      <p>
        If you cancel, the charges depend on how close to departure you cancel. If we cancel, you choose a full refund
        or a free move to another date. Seats can’t be transferred to someone else. The details, including weather and
        road closures, are in our <Link href="/cancellation-policy">cancellation policy</Link>.
      </p>
    ),
  },
  {
    id: "on-the-trip",
    title: "On the trip",
    body: (
      <ul>
        <li>
          Follow your coordinator’s instructions on safety, timings and meeting points. Early starts, like a sunrise
          drive, leave on time.
        </li>
        <li>Carry a government photo ID; hotels and permits need it.</li>
        <li>
          Respect other travellers, local people, places of worship, wildlife rules and the law. We may ask anyone
          who puts others at risk, harasses anyone or breaks the law to leave the trip, without a refund.
        </li>
        <li>
          Itineraries can change on the day because of weather, roads or local rules. Your coordinator will always pick
          the safe option.
        </li>
        <li>Look after your own belongings; we’re not responsible for items you lose or leave behind.</li>
      </ul>
    ),
  },
  {
    id: "our-responsibility",
    title: "What we’re responsible for",
    body: (
      <>
        <p>
          We plan and run the trip, and choose the hotels, transport and guides with care. Those suppliers are
          responsible for the services they provide, and we’ll help you with any problem with them, on the trip or
          after.
        </p>
        <p>
          We’re not responsible for delays, losses or costs caused by things outside our control, such as weather,
          landslides, road or ferry closures, strikes, illness or government orders. Where we are responsible, our
          liability is limited to the amount you paid for the trip. Nothing in these terms limits a right you have under
          Indian consumer law, or our responsibility for harm caused by our own negligence.
        </p>
        <p>We strongly recommend travel insurance that covers medical care and cancellation.</p>
      </>
    ),
  },
  {
    id: "account-and-site",
    title: "Your account and the site",
    body: (
      <ul>
        <li>
          You sign in with a one-time code sent to your email, or with Google. Keep access to that email safe; anyone
          with it can sign in as you.
        </li>
        <li>
          Don’t misuse the site: no automated scraping, no attempts to break in or overload it, no bookings in someone
          else’s name without their agreement. We may suspend accounts that do.
        </li>
        <li>
          The text, photos, design and the Ghumbo name and logo belong to us or to the people who licensed them to us.
          Please don’t copy them for commercial use.
        </li>
        <li>
          We take care to keep trip details and prices accurate, but mistakes can happen. If we find a clear error in a
          price after you’ve paid, we’ll contact you, and you can keep the booking at the right price or cancel for a full
          refund.
        </li>
      </ul>
    ),
  },
  {
    id: "law",
    title: "Governing law and disputes",
    body: (
      <p>
        These terms are governed by the laws of India. If we can’t settle a dispute with you through our Grievance
        Officer, the courts at Kolkata have jurisdiction. That doesn’t stop you from going to a consumer commission
        under the Consumer Protection Act, 2019, including the one where you live.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these terms and will change the date at the top when we do. The terms in force when you pay apply
        to that trip.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact and complaints",
    body: (
      <>
        <p>
          Questions about a trip: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          {supportPhone && (
            <>
              {" "}
              or <a href={supportPhone.href} className="whitespace-nowrap">{supportPhone.display}</a>
            </>
          )}
          . For complaints, write to our Grievance Officer.
        </p>
        <GrievanceContact />
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      current="terms"
      kicker="Policies · terms of use"
      title="Terms of use"
      lede="How booking, paying and travelling with Ghumbo works, what we’re responsible for, and what we ask of you. Plain English, no small print."
      sections={sections}
    />
  );
}
