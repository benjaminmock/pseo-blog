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
  return (
    <div className="container mx-auto p-4 bg-background light:bg-background-light">
      <article className="prose lg:prose-xl light:prose-light mb-8">
        <h1 className="font-bold">Impressum</h1>
        <div></div>
      </article>
    </div>
  );
}
