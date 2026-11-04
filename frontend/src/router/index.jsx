import Abteilungen from "@/pages/Abteilungen";
import StartAbteilungen from "@/pages/Abteilungen/views/Contacts";

import Consolcm from "@/pages/Consolcm";
import StartConsolcm from "@/pages/Consolcm/views/Consolcm";

import Produkte from "@/pages/Produkte";
import StartProdukte from "@/pages/Produkte/views/Produkte";

import Richtlinien from "@/pages/Richtlinien";

import Formulare from "@/pages/Formulare";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Portraet from "@/pages/Portraet";

import Privat from "@/pages/Privat";
import Sales from "@/pages/Sales";
import StartSales from "@/pages/Sales/views/Sales";
import Visitors from "@/pages/Visitors";
import Purchases from "@/pages/Purchases";
import StartPurchases from "@/pages/Purchases/views/Purchases";
import Customers from "@/pages/Customers";
import StartCustomers from "@/pages/Customers/views/Customers";

import { MdOutlineLogin } from "react-icons/md";

export const publicRoutes = [
  {
    path: "/home",
    type: "link",
    element: <Home />,
    navLabel: "Home",
    component: "Home",
    hidden: true,
  },
  {
    path: "/produkte",
    type: "link",
    element: <Produkte />,
    navLabel: "Produkte & Preise",
    component: "Produkte",
    indexElement: <StartProdukte />,
    param: ":product",
    nested: [
      { path: "salesnews", navLabel: "Salesnews" },
      { path: "preislisten", navLabel: "Preislisten" },
      { path: "skizzen", navLabel: "Skizzen" },
      { path: "lagerbestaende", navLabel: "Lagerbestaende" },
      { path: "rabattstaffel", navLabel: "Rabattstaffel" },
      { path: "sonderedition", navLabel: "Sonderedition" },
    ],
  },
  {
    path: "/abteilungen",
    type: "link",
    element: <Abteilungen />,
    navLabel: "Ansprechpartner & Abt.",
    navLabel2: "Stores",
    component: "Abteilungen",
    indexElement: <StartAbteilungen />,
    param: ":department",
    nested: [
      { path: "telefonverzeichnis", navLabel: "Telefonverzeichnis" },
      { path: "facilitymanagement", navLabel: "Facilitymanagement" },
      { path: "einkauf", navLabel: "Einkauf" },
      { path: "fibu-controlling", navLabel: "FiBu & Controlling" },
      { path: "it-administration", navLabel: "IT Administration" },
      { path: "kundenservice", navLabel: "Kundenservice" },
      { path: "disposition", navLabel: "Disposition" },
      { path: "lager-verwaltung", navLabel: "LagerVerwaltung" },
      { path: "marketing-ecommerce", navLabel: "Marketing & ECommerce" },
      { path: "personal", navLabel: "Personal" },
      { path: "planung-Exp", navLabel: "Planung & Exp." },
      { path: "produktmanagement", navLabel: "Produktmanagement" },
      { path: "vertriebsverantwortung", navLabel: "Vertriebsverantwortung" },
      { path: "suppliers", navLabel: "Lieferantenauskunft" },
    ],
    nested2: [
      { path: "duesseldorf", navLabel: "Düsseldorf" },
      // { path: "frankfurt", navLabel: "Frankfurt" },
      { path: "hamburg", navLabel: "Hamburg" },
      { path: "muenchen", navLabel: "München" },
      { path: "stuttgart", navLabel: "Stuttgart" },
    ],
  },
  {
    path: "/formulare",
    type: "link",
    element: <Formulare />,
    navLabel: "Formulare",
    component: "Formulare",
  },
  {
    path: "/richtlinien",
    type: "link",
    element: <Richtlinien />,
    navLabel: "Richtlinien",
    component: "Richtlinien",
  },
  {
    path: "/portraet",
    type: "link",
    element: <Portraet />,
    navLabel: "Über uns",
    component: "Portraet",
  },
  {
    path: "/consolcm",
    type: "link",
    element: <Consolcm />,
    navLabel: "Consol",
    component: "Consolcm",
    indexElement: <StartConsolcm />,
    param: ":modules",
    nested: [
      { path: "uebersicht", navLabel: "Uebersicht" },
      { path: "debitoren", navLabel: "Debitoren" },
      { path: "disposition", navLabel: "Disposition" },
      { path: "e-commerce", navLabel: "E-Commerce" },
      { path: "kundenservice", navLabel: "Kundenservice" },
      { path: "lagerleiter", navLabel: "Lagerleiter" },
      { path: "office-empfang", navLabel: "Office / Empfang" },
      { path: "social-media", navLabel: "SocialMedia" },
      { path: "vertrieb-frontoffice", navLabel: "Vertrieb / Frontoffice" },
      { path: "chat", navLabel: "Chat" },
      { path: "erklaerung", navLabel: "Erklaerung" },
      { path: "richtlinie", navLabel: "Richtlinie" },
    ],
  },
  {
    path: "/login",
    type: "icon",
    element: <Login />,
    navLabel: "Login",
    component: "Login",
    icon: MdOutlineLogin,
    hidden: true,
  },
];
export const privateRoutes = [
  {
    path: "/sales",
    type: "link",
    element: <Sales />,
    navLabel: "Umsatz",
    component: "Sales",
    indexElement: <StartSales />,
    param: ":reportType",
    nested: [
      { path: "sales-by-channel", navLabel: "Umsatz nach Vertriebskanal" },
      {
        path: "sales-by-branch",
        navLabel: "Neu-/Bestandskundenumsatz ohne Angebote",
      },
      { path: "sales-quotations", navLabel: "Umsätze und Angebote" },
      { path: "sales-by-postcode", navLabel: "Umsatz nach PLZ" },
      // { path: "sales-details", navLabel: "Verkaufspositionen" },
    ],
  },
  {
    path: "/visitors",
    type: "link",
    element: <Visitors />,
    navLabel: "Besucher",
    component: "Visitors",
  },
  {
    path: "/purchases",
    type: "link",
    element: <Purchases />,
    navLabel: "Käufe",
    component: "Purchases",
    indexElement: <StartPurchases />,
    param: ":reportType",
    nested: [
      {
        path: "first-to-second-purchase-intervals",
        navLabel: "Tage zwischen erstem und zweitem Kauf",
      },
      // { path: "muenchen", navLabel: "München" },
      // { path: "stuttgart", navLabel: "Stuttgart" },
    ],
  },
  {
    path: "/customers",
    type: "link",
    element: <Customers />,
    navLabel: "Kunden",
    component: "Customers",
    indexElement: <StartCustomers />,
    param: ":reportType",
    nested: [
      {
        path: "newsletter",
        navLabel: "Newsletter",
      },
      {
        path: "monthly-customer-statistics",
        navLabel: "Monatliche Kunden- und Bestellstatistik",
      },
    ],
  },
];
