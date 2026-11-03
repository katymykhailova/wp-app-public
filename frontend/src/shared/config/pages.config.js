import homeImg from "@/assets/willkommen.jpeg";
import produkteImg from "@/assets/produkte.jpeg";
import abteilungenImg from "@/assets/abteilungen.jpeg";
import formulareImg from "@/assets/formulare.jpeg";
import richtlinienImg from "@/assets/richtlinien.jpeg";
import portraetImg from "@/assets/portraet.jpeg";
import consolcmImg from "@/assets/consolcm.jpeg";

export const pagesConfig = {
  "/": {
    title: "Willkommen",
    subTitle: "im Intranet von Firmenname",
    backgroundImage: homeImg,
    hasSigebar: false,
  },
  "/produkte": {
    title: "Produkte",
    subTitle: "& Preise",
    backgroundImage: produkteImg,
    hasSigebar: true,
  },
  "/abteilungen": {
    title: "Abteilungen",
    subTitle: "& Ansprechpartner",
    backgroundImage: abteilungenImg,
    hasSigebar: true,
  },
  "/formulare": {
    title: "Formulare",
    subTitle: "& Anträge",
    backgroundImage: formulareImg,
    hasSigebar: false,
  },
  "/richtlinien": {
    title: "Richt",
    subTitle: "linien",
    backgroundImage: richtlinienImg,
    hasSigebar: false,
  },
  "/portraet": {
    title: "Unternehmens",
    subTitle: "portrait",
    backgroundImage: portraetImg,
    hasSigebar: false,
  },
  "/consolcm": {
    title: "Consol",
    subTitle: " CM",
    backgroundImage: consolcmImg,
    hasSigebar: true,
  },
  "/login": {
    title: "Anmeldung",
    subTitle: "",
    backgroundImage: homeImg,
    hasSigebar: false,
  },
  "/sales": {
    title: "Umsatz",
    subTitle: "",
    // backgroundImage: homeImg,
    hasSigebar: true,
    hasBanner: false,
  },
  "/visitors": {
    title: "Besucher",
    subTitle: "",
    // backgroundImage: homeImg,
    hasSigebar: false,
    hasBanner: false,
  },
  "/purchases": {
    title: "Käufe",
    subTitle: "",
    // backgroundImage: homeImg,
    hasSigebar: true,
    hasBanner: false,
  },
  "/customers": {
    title: "Customers",
    subTitle: "",
    // backgroundImage: homeImg,
    hasSigebar: true,
    hasBanner: false,
  },
};
