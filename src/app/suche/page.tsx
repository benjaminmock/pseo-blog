type SearchResult = {
  id: number;
  slug: string;
  city: string;
};

// Fetch search results by making a POST request to the API route
async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  const res = await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Failed to fetch data");
  const data = await res.json();
  return data.results as SearchResult[];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  // Fetch results if a query exists
  const query = searchParams.query || "";
  const results = query ? await fetchSearchResults(query) : [];

  return (
    <div className="container mx-auto p-4 bg-background light:bg-background-light">
      <article className="prose lg:prose-xl light:prose-light mb-8">
        <h1 className="text-2xl font-bold mb-4">Suche</h1>
        <form action="/suche" method="GET" className="flex items-center mb-6">
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="Suche..."
            className="border border-gray-300 rounded-l px-4 py-2 text-gray-700"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition"
          >
            Suche
          </button>
        </form>
        {results.length > 0 ? (
          <ul>
            {results.map((result) => (
              <li key={result.id} className="py-2 border-b">
                <a
                  href={`/p/${result.slug}`}
                  className="text-blue-600 hover:text-blue-800 transition"
                >
                  {result.city}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Keine Ergebnisse gefunden.</p>
        )}
      </article>
    </div>
  );
}
