export async function generateMetadata() {
  return {
    title: "Impressum",
    description: "Impressum",
    robots: {
      index: false,
      follow: true,
      nocache: true,
    },
  };
}

export default function Imprint() {
  const reversedEmail = "ed.kcomnimajneb@liam";

  return (
    <div className="container mx-auto p-4 bg-background light:bg-background-light">
      <article className="prose lg:prose-xl light:prose-light mb-8">
        <h1 className="font-bold">Impressum</h1>
        <div>
          <h2>Angaben gemäß § 5 TMG</h2>
          <p>
            <strong>Name:</strong> Benjamin Mock
          </p>
          <p>
            <strong>Anschrift:</strong> Kiefernring 12, 15806 Zossen
          </p>
          <p>
            <strong>E-Mail:</strong>{" "}
            <span
              style={{
                unicodeBidi: "bidi-override",
                direction: "rtl",
              }}
            >
              {reversedEmail}
            </span>
          </p>

          <h2>Haftungsausschluss (Disclaimer)</h2>

          <h3>Haftung für Inhalte</h3>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
            §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet, übermittelte
            oder gespeicherte fremde Informationen zu überwachen.
          </p>

          <h3>Haftung für Links</h3>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren
            Inhalte wir keinen Einfluss haben. Deshalb übernehmen wir für diese
            fremden Inhalte keine Gewähr. Für die Inhalte der verlinkten Seiten
            ist stets der jeweilige Anbieter oder Betreiber der Seiten
            verantwortlich.
          </p>

          <h3>Urheberrecht</h3>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
            diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge
            Dritter sind als solche gekennzeichnet.
          </p>
        </div>
      </article>
    </div>
  );
}
