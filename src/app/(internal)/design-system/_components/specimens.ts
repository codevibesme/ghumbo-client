import { ArrowLeft, ArrowRight, Calendar, Check, ChevronDown, ChevronRight, Clock, Filter, Info, Mail, MapPin, Menu, Minus, Mountain, Phone, Plus, Search, Ticket, TriangleAlert, User, Users, X } from "lucide-react";

export const typeScale = [
  { cls: "type-display", name: "display", spec: "88 / 0.95 · 800 · 125% (44 mobile)", sample: "One ticket." },
  { cls: "type-h1", name: "h1", spec: "56 / 1.0 · 800 · 125% (36)", sample: "Your seat, sorted" },
  { cls: "type-h2", name: "h2", spec: "40 / 1.05 · 800 · 125% (28)", sample: "Leaving soon" },
  { cls: "type-h3", name: "h3", spec: "22 / 1.15 · 800 · 115% (19)", sample: "Darjeeling: Queen of the Hills" },
  { cls: "type-h4", name: "h4", spec: "18 / 1.3 · 700 · 110% (17)", sample: "What happens after I request a seat?" },
  { cls: "type-body-l", name: "body-l", spec: "19 / 1.55 · 400 (17)", sample: "Pick a date, grab a seat in a group of up to 18." },
  { cls: "type-body", name: "body", spec: "16 / 1.55 · 400", sample: "Three nights in a family homestay below Chowrasta." },
  { cls: "type-small text-muted", name: "small", spec: "14 / 1.45 · 400 · muted", sample: "Final amount confirmed on the call." },
  { cls: "type-label", name: "label", spec: "Plex 500 · 12 · 0.08em · caps", sample: "Why Ghumbo" },
  { cls: "type-data", name: "data", spec: "Plex 600 · 16 / 1.2 · 0.02em (15)", sample: "SAT 26 DEC · 11:00 · GH-26DEC-4821" },
  { cls: "type-price-l", name: "price-l", spec: "36 / 1 · 800 · 115% (30)", sample: "≈ ₹18,998" },
  { cls: "type-price-m", name: "price-m", spec: "26 / 1 · 800 · 115% (22)", sample: "₹7,799" },
  { cls: "type-price-s", name: "price-s", spec: "20 / 1 · 800 · 115% (18)", sample: "₹5,299" },
];

export const icons = [
  ["calendar", Calendar], ["users", Users], ["map-pin", MapPin], ["clock", Clock], ["arrow-right", ArrowRight],
  ["arrow-left", ArrowLeft], ["check", Check], ["x", X], ["chevron-down", ChevronDown], ["chevron-right", ChevronRight],
  ["menu", Menu], ["search", Search], ["phone", Phone], ["mail", Mail], ["ticket", Ticket], ["mountain", Mountain],
  ["filter", Filter], ["info", Info], ["alert", TriangleAlert], ["minus", Minus], ["plus", Plus], ["user", User],
] as const;
