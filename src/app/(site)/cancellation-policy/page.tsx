import type { Metadata } from "next";
import Link from "next/link";
import { GrievanceContact, LegalPage, type LegalSection } from "@/components/layout/legal-page";
import { CANCELLATION_CHARGES, REFUND_WORKING_DAYS } from "@/config/legal";
import { supportEmail, supportPhone } from "@/config/site";

export const metadata: Metadata = {
  title: "Cancellation and refund policy",
  description:
    "What happens if you cancel a Ghumbo trip, or if we do: the charges by days before departure, how refunds are paid, and what happens when weather or roads stop a trip.",
  alternates: { canonical: "/cancellation-policy" },
};

const contact = (
  <>
    <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
    {supportPhone && (
      <>
        {" "}
        or <a href={supportPhone.href} className="whitespace-nowrap">{supportPhone.display}</a>
      </>
    )}
  </>
);

const sections: LegalSection[] = [
  {
    id: "short-version",
    title: "The short version",
    body: (
      <ul>
        <li>Requesting a seat is free. You pay the full trip cost by secure link after our call, and your seat is confirmed once it’s paid.</li>
        <li>Until you pay, you can withdraw at no cost.</li>
        <li>After you pay, what we keep depends on how close to departure you cancel: from 10% (30 or more days before) to 100% (under 7 days).</li>
        <li>Seats can’t be handed to someone else.</li>
        <li>If we cancel, you choose: a full refund, or a free move to another date.</li>
        <li>Refunds go back to the way you paid, within {REFUND_WORKING_DAYS} working days.</li>
      </ul>
    ),
  },
  {
    id: "before-you-pay",
    title: "Before you pay",
    body: (
      <p>
        A seat request is not a booking and costs nothing. You can withdraw it from{" "}
        <Link href="/my-trips">My trips</Link>, or tell us on the call or at {contact}. If you don’t pay the link we send
        after the call, the request lapses and the seat goes back on sale.
      </p>
    ),
  },
  {
    id: "if-you-cancel",
    title: "If you cancel after paying",
    body: (
      <>
        <p>We keep part of the trip cost, depending on how many days are left before the first day of the trip:</p>
        <div className="overflow-x-auto rounded-ticket border-[1.5px] border-line bg-card">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-[1.5px] border-line">
                <th scope="col" className="px-4 py-3 type-stub text-muted">
                  When you cancel
                </th>
                <th scope="col" className="px-4 py-3 text-right type-stub text-muted">
                  We keep
                </th>
                <th scope="col" className="px-4 py-3 text-right type-stub text-muted">
                  You get back
                </th>
              </tr>
            </thead>
            <tbody>
              {CANCELLATION_CHARGES.map((c) => (
                <tr key={c.when} className="border-t-[1.5px] border-rule first:border-t-0">
                  <th scope="row" className="px-4 py-3 text-[15px] font-normal leading-[1.4]">
                    {c.when}
                  </th>
                  <td className="px-4 py-3 text-right font-mono text-[15px] font-semibold">{c.keep}%</td>
                  <td className="px-4 py-3 text-right font-mono text-[15px] font-semibold">{100 - c.keep}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul>
          <li>
            Percentages are of the trip cost for the seats you cancel, GST included. We don’t add any other fee.
          </li>
          <li>
            Days are counted to the first day of the trip, from the day we receive your cancellation in writing: email{" "}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a> from the address you booked with, and quote your
            reference.
          </li>
          <li>
            Cancelling some of the seats on a booking works the same way, for those seats only. If it leaves someone in
            your group without a roommate, we pair them with a traveller of the same gender, or tell you about any
            extra cost before it applies.
          </li>
          <li>
            Leaving a trip partway, or missing the pickup, counts as not turning up: there’s no refund for the days you
            miss.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "no-transfers",
    title: "Seats can’t be transferred",
    body: (
      <p>
        A seat belongs to the traveller named on the booking. If you can’t go, you can’t pass the seat to a friend; cancel
        it under the charges above. We book rooms, permits and transport in travellers’ names, which is why we can’t
        swap them.
      </p>
    ),
  },
  {
    id: "if-we-cancel",
    title: "If we cancel or change the trip",
    body: (
      <>
        <p>
          We sometimes cancel a departure, for example if too few people sign up or a hotel or vehicle falls through. We
          tell you as soon as we know, and you choose:
        </p>
        <ul>
          <li>
            a <strong>full refund</strong> of everything you paid, within {REFUND_WORKING_DAYS} working days, or
          </li>
          <li>
            a <strong>free move</strong> to another departure of the same trip, or to another trip (we refund or charge
            only the difference in price).
          </li>
        </ul>
        <p>
          If we have to change something important before departure, like the dates, the start point or the type of
          stay, you can cancel for a full refund instead of accepting the change. Swapping a hotel or vehicle for one of
          the same standard isn’t an important change.
        </p>
      </>
    ),
  },
  {
    id: "weather-and-roads",
    title: "Weather, landslides and road closures",
    body: (
      <>
        <p>
          Our trips run in the hills, forests and islands, where landslides, storms, road and ferry closures, strikes and
          government orders sometimes stop travel. None of that is in our control or yours.
        </p>
        <ul>
          <li>
            <strong>If the trip can’t start</strong>, you choose a free move to another date, or a refund of everything
            we haven’t already spent and can’t get back from hotels and transport. We show you that breakdown.
          </li>
          <li>
            <strong>If it’s disrupted partway</strong>, your coordinator changes the plan to keep everyone safe. We
            refund what we recover for the days you miss. Unavoidable extra costs, like an extra night when a road is
            shut, are paid by the group at cost; we tell you before spending anything.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "refunds",
    title: "How refunds are paid",
    body: (
      <ul>
        <li>
          To the same account, card or UPI ID you paid from, within {REFUND_WORKING_DAYS} working days of the
          cancellation being confirmed. Your bank may take a few more days to show it.
        </li>
        <li>The GST on the refunded amount is refunded too, and we send you a credit note.</li>
        <li>We never refund to a different person’s account, and never ask for your OTP or card details to do it.</li>
      </ul>
    ),
  },
  {
    id: "not-covered",
    title: "What this policy doesn’t cover",
    body: (
      <p>
        Your train or flight to the start point isn’t part of the trip, so its cancellation is between you and the
        railway or airline. The same goes for add-ons and meals you pay for directly on the trip. We recommend travel
        insurance for anything you can’t afford to lose.
      </p>
    ),
  },
  {
    id: "questions",
    title: "Questions and complaints",
    body: (
      <>
        <p>
          Talk to us first: {contact}. If you’re not happy with our answer, write to our Grievance Officer.
        </p>
        <GrievanceContact />
        <p>
          You can also contact the National Consumer Helpline on 1915 or at{" "}
          <a href="https://consumerhelpline.gov.in" rel="noopener noreferrer">
            consumerhelpline.gov.in
          </a>
          . This policy is part of our <Link href="/terms">terms of use</Link>, and it doesn’t limit any right you have
          under Indian consumer law.
        </p>
      </>
    ),
  },
];

export default function CancellationPolicyPage() {
  return (
    <LegalPage
      current="cancellation"
      kicker="Policies · cancellation and refunds"
      title="Cancellation policy"
      lede="What happens if you cancel, or if we do. Nothing is charged until you pay after our call, so a seat request costs nothing to withdraw."
      sections={sections}
    />
  );
}
