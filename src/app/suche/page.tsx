import { headers } from "next/headers";

type SearchResult = {
  id: number;
  slug: string;
  city: string;
  title: string;
  state: string;
  zip: string;
  type: "city" | "course" | "event";
  sort_priority: number;
};

// Fetch search results by making a POST request to the API route
async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  try {
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const host = headers().get("host") || "localhost:3000";
    const res = await fetch(`${protocol}://${host}/api/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Error(`Search failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.results as SearchResult[];
  } catch (error) {
    console.error("Search error:", error);
    throw new Error("Failed to fetch search results. Please try again.");
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  let results: SearchResult[] = [];
  let error: string | null = null;

  // Fetch results if a query exists
  const query = searchParams.query || "";

  if (query) {
    try {
      results = await fetchSearchResults(query);
    } catch (e) {
      error = e instanceof Error ? e.message : "An unexpected error occurred";
    }
  }

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
            className="border border-gray-300 rounded-l px-4 py-2 text-gray-700 flex-grow"
            minLength={2}
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-r hover:bg-gray-800 transition"
          >
            Suche
          </button>
        </form>

        {error ? (
          <div className="text-red-600 mb-4" role="alert">
            {error}
          </div>
        ) : results.length > 0 ? (
          <ul className="space-y-4">
            {results.map((result) => {
              // Determine the appropriate link based on result type
              let href = "";
              let typeLabel = "";
              let typeColor = "";

              switch (result.type) {
                case "city":
                  href = `/p/${result.slug}`;
                  typeLabel = "Stadt";
                  typeColor = "bg-blue-100 text-blue-800";
                  break;
                case "course":
                  href = `/kurse/${result.slug}`;
                  typeLabel = "Kurs";
                  typeColor = "bg-green-100 text-green-800";
                  break;
                case "event":
                  href = `/events/${result.slug}`;
                  typeLabel = "Event";
                  typeColor = "bg-purple-100 text-purple-800";
                  break;
                default:
                  href = `/p/${result.slug}`;
                  typeLabel = "Stadt";
                  typeColor = "bg-gray-100 text-gray-800";
              }

              return (
                <li
                  key={`${result.type}-${result.id}`}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <a
                    href={href}
                    className="block text-slate-700 hover:text-blue-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${typeColor}`}
                      >
                        {typeLabel}
                      </span>
                    </div>
                    <div className="font-semibold">{result.title}</div>
                    {result.type === "city" ? (
                      <div className="text-sm text-gray-600">
                        {result.state} • {result.zip}
                      </div>
                    ) : (
                      result.city && (
                        <div className="text-sm text-gray-600">
                          {result.city}
                        </div>
                      )
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : query ? (
          <p className="text-gray-500">
            Keine Ergebnisse gefunden für &quot;{query}&quot;.
          </p>
        ) : null}
      </article>
    </div>
  );
}
