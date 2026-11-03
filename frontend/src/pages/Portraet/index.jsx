import Content from "@/layouts/Content";
import { PageLayoutProvider } from "@/layouts/PageLayoutProvider";
import { pagesConfig } from "@/shared/config/pages.config";

const Portraet = () => {
  const config = pagesConfig["/portraet"];

  return (
    <PageLayoutProvider config={config}>
      <Content>
        <h1>Unternehmensportrait</h1>

        <section>
          <h2>Unsere HISTORIE – Entwicklung und Wachstum</h2>
          <p>
            Unser Beispielunternehmen wurde mit dem Ziel gegründet, hochwertige
            Produkte und einen zuverlässigen Service anzubieten. Aus einem
            kleinen Standort entwickelte sich im Laufe der Jahre ein
            erfolgreiches Unternehmen mit mehreren Niederlassungen.
          </p>
          <p>
            Durch die kontinuierliche Weiterentwicklung unseres Sortiments und
            unserer Dienstleistungen konnten wir unser Angebot stetig erweitern
            und an die Bedürfnisse unserer Kunden anpassen.
          </p>
        </section>

        <section>
          <h2>Unser SLOGAN – Qualität, die überzeugt</h2>
          <p>
            Unser Anspruch ist es, unseren Kunden hochwertige Produkte,
            kompetente Beratung und einen zuverlässigen Service zu bieten.
            Qualität und Kundenzufriedenheit stehen dabei im Mittelpunkt.
          </p>
        </section>

        <section>
          <h2>Unser ANGEBOT – Vielfalt und Qualität</h2>
          <p>
            Wir bieten unseren Kunden ein vielfältiges Sortiment ausgewählter
            Produkte. Unser Angebot verbindet modernes Design, hohe Qualität und
            attraktive Konditionen.
          </p>
        </section>

        <section>
          <h2>Unser ANSPRUCH – Qualität und Kompetenz</h2>
          <p>
            Bei der Auswahl unserer Produkte legen wir besonderen Wert auf
            Qualität, Funktionalität und modernes Design. Unsere Partner werden
            sorgfältig ausgewählt, um unseren Qualitätsansprüchen gerecht zu
            werden.
          </p>
          <p>
            Durch eine enge Zusammenarbeit mit unseren Lieferanten können wir
            unseren Kunden ein zuverlässiges und hochwertiges Angebot
            bereitstellen.
          </p>
        </section>

        <section>
          <h2>Unsere PREISE – Qualität zu attraktiven Konditionen</h2>
          <p>
            Durch effiziente Einkaufsprozesse und langfristige Partnerschaften
            können wir hochwertige Produkte zu attraktiven Konditionen anbieten.
          </p>
          <p>
            Dabei achten wir auf ein ausgewogenes Verhältnis zwischen Qualität,
            Service und Preis.
          </p>
        </section>

        <section>
          <h2>Unsere MITARBEITER – Gemeinsam erfolgreich</h2>
          <p>
            Der Erfolg unseres Unternehmens basiert auf dem Engagement, der
            Kompetenz und der Zusammenarbeit unserer Mitarbeiter. Ein
            respektvolles Arbeitsumfeld und eine offene Kommunikation sind für
            uns wichtige Bestandteile einer erfolgreichen Zusammenarbeit.
          </p>
        </section>

        <section>
          <h2>Unsere VISION – Gemeinsam weiterentwickeln</h2>
          <p>
            Wir möchten unser Unternehmen kontinuierlich weiterentwickeln,
            bestehende Prozesse verbessern und neue Möglichkeiten nutzen.
            Gemeinsam arbeiten wir daran, unseren Kunden auch in Zukunft
            hochwertige Produkte und Dienstleistungen anzubieten.
          </p>
        </section>
      </Content>
    </PageLayoutProvider>
  );
};

export default Portraet;
