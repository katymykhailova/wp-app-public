import { useParams } from "react-router-dom";

import { getSelectedFiles } from "@/store/services";

import Content from "@/layouts/Content";

import MyEmail from "@/shared/ui/MyEmail";

import s from "./Consolcm.module.scss";

const Consolcm = () => {
  const { modules: modulesParam } = useParams();
  const modules = modulesParam?.toLowerCase();

  const handleClickFile = async (files) => {
    await getSelectedFiles([files], "open");
  };

  return (
    <Content>
      {(!modules || modules === "uebersicht") && (
        <>
          <h1>Einführung eines Ticketsystems im Kundenservice</h1>
          <p>
            Bisher werden Anfragen von Kunden auf verschiedenen Wegen (E-Mail,
            Anrufe, Wiedervorlagen in Moeve) an den Kundenservice herangetragen.
            Dadurch wird insgesamt der Ablauf inkl. einer Antwort an den Kunden
            verlangsamt und durch die dezentrale Vorgehensweise besteht die
            Gefahr, dass Informationen und Anfragen verloren gehen. Die
            Bearbeitung von komplexen Anfragen wird zusätzlich in die Länge
            gezogen.
          </p>
        </>
      )}
      {modules === "debitoren" && (
        <>
          <h1>Bearbeitung der Anfragen vom Kundenservice an die Debitoren</h1>
          <p>
            Der Kundenservice fragt bei relevanten Themen per E-Mail bei den
            Debitoren nach, es ist immer auf diese E-Mail direkt zu antworten.
            Wenn Sie die E-Mail beantworten (Wichtig: der Betreff{" "}
            <span className={s.accentBold}>
              "Ticket: (<span className={s.accentBold}>TicketID</span>)"
            </span>{" "}
            ist dabei nicht zu verändern), wird das Ticket des Kunden im
            Kundenservice aktualisiert und kann vom Kundenservice dann
            zeitgerecht weiterbearbeitet werden. Der Kundenservice informiert
            den Kunden über z.B. die Rückzahlung.
          </p>
          <p>
            Bitte erstellen Sie sich einen Ordner und eine Regel in Outlook, um
            diese Anfragen abzufangen und abzuarbeiten.
          </p>
        </>
      )}
      {modules === "disposition" && (
        <>
          <h1>Übergabe von Anfragen von Kunden an den Kundenservice</h1>
          <p>
            Alle Anfragen von Kunden per Telefon oder E-Mail, die der
            Mitarbeiter nicht selbst erledigen kann, können ab sofort nur noch
            ausschließlich über <MyEmail email={"cs-dispo@firmenname.de"} />{" "}
            Eine Weitergabe per E-Mail an die E-Mail-Adresse
            service@firmenname.de oder der dienstlichen E-Mail-Adresse des
            Mitarbeiters des Kundenservice oder per Wiedervorlage in Moeve ist
            nicht mehr möglich!
          </p>
        </>
      )}
      {modules === "lagerleiter" && (
        <>
          <h1>Übergabe von Anfragen von Kunden an den Kundenservice</h1>
          <h3>1. Reklamation</h3>
          <p>
            Bei der Tourenrückmeldung müssen Reklamationen zusätzlich zur
            bekannten Reklamationsvorerfassung in Moeve (bleibt unverändert)
            über dieses neue Formular gemeldet werden. Der betroffene
            Kaufvertrag und die betroffenen Artikel sind aufzunehmen. Das
            bekannte Liefer- und Montageprotokoll ist dabei{" "}
            <span className={s.accentColor}>immer</span> mit hochzuladen! Eine
            Ablage der Bilder und des Protokolls im ZKO entfällt.
          </p>
          <p>
            Die Vorlage für das Liefer- und Montageprotokoll ist
            <button
              className={s.link}
              type="button"
              onClick={() =>
                handleClickFile({
                  name: "Formular Liefer-Montageprotokoll_210x297_RZ.pdf",
                  isDirectory: false,
                  isPdf: true,
                  relativePath:
                    "Formulare/CRM_Kundenservice/Formular Liefer-Montageprotokoll_210x297_RZ.pdf",
                })
              }
            >
              →hier
            </button>
            zu finden, es sind auch{" "}
            <span className={s.accentColor}> immer </span>
            Bilder beizufügen.
          </p>
        </>
      )}
    </Content>
  );
};

export default Consolcm;
