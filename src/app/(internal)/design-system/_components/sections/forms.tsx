import Link from "next/link";
import { Badge, SeatBadge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { RadioCard, RadioCardGroup } from "@/components/ui/radio-card";
import { Select } from "@/components/ui/select";
import { Stepper } from "@/components/ui/stepper";
import { SwitchRow } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Section, Spec } from "../parts";

export function FormsSections() {
  return (
    <>
<Section id="forms" kicker="03 · Forms" title="Inputs" note="Wrap any control in <Field> for the label, hint and error; it wires id, aria-invalid and aria-describedby.">
          <div className="grid items-start gap-x-8 gap-y-7 md:grid-cols-3">
            <Field label="Full name">
              <Input defaultValue="Riya Sen" autoComplete="name" />
            </Field>
            <Field label="Email" hint="We send your reference here.">
              <Input type="email" defaultValue="riya.sen@example.com" autoComplete="email" />
            </Field>
            <Field label="Mobile number" hint="We only call about this request.">
              <PhoneInput defaultValue="98300 12345" />
            </Field>
            <Field label="Mobile number" error="Enter a 10-digit mobile number">
              <PhoneInput defaultValue="98300 123" />
            </Field>
            <Field label="Month">
              <Select defaultValue="any">
                <option value="any">Any month</option>
                <option value="nov">November</option>
                <option value="dec">December</option>
                <option value="jan">January</option>
              </Select>
            </Field>
            <Field label="Preferred date">
              <Input placeholder="e.g. Sat 9 Jan" />
            </Field>
            <Field label="Message" optional>
              <Textarea placeholder="Travelling with a child, food preferences, a birthday on the trip…" />
            </Field>
            <Stepper label="Travellers" hint="Max 4 · 04 seats left on this date" defaultValue={2} max={4} />
            <Checkbox defaultChecked>
              Ghumbo can call, SMS or WhatsApp me about this request. I have read the <Link href="/terms">Terms</Link> and{" "}
              <Link href="/privacy">Privacy policy</Link>.
            </Checkbox>
            <Spec label="Radio cards" className="md:col-span-2">
              <RadioCardGroup defaultValue="dec" aria-label="Departure" className="grid gap-3 sm:grid-cols-2">
                <RadioCard value="dec">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[16px] font-semibold leading-none">SAT 26 DEC</span>
                    <Badge tone="peak">Peak</Badge>
                  </span>
                  <span className="font-mono text-[12px] leading-none text-muted">→ TUE 29 DEC 2026</span>
                  <span className="flex items-center gap-2.5">
                    <span className="type-price-s">₹9,499</span>
                    <SeatBadge left={4} />
                  </span>
                </RadioCard>
                <RadioCard value="nov">
                  <span className="font-mono text-[16px] font-semibold leading-none">FRI 13 NOV</span>
                  <span className="font-mono text-[12px] leading-none text-muted">→ MON 16 NOV 2026</span>
                  <span className="flex items-center gap-2.5">
                    <span className="type-price-s">₹7,799</span>
                    <SeatBadge left={14} />
                  </span>
                </RadioCard>
              </RadioCardGroup>
            </Spec>
            <Spec label="Switches">
              <SwitchRow title="Trip updates by SMS" description="Reminders and pickup details." defaultChecked />
              <SwitchRow title="Offers by email" />
            </Spec>
          </div>
        </Section>
    </>
  );
}
