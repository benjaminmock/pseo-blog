import { AppProps } from "next/app";
import { useEffect } from "react";
import Head from "next/head";
import "../styles/globals.css"; // Import global CSS
import { initConfig } from "@/config";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const initializeConfig = async () => {
      await initConfig(); // Await initConfig if it’s async
      console.log("initedConfig");
    };
    console.log("init config");

    initializeConfig();
  }, []);

  return (
    <>
      {/* Add global meta tags or title if needed */}
      <Head>
        <title>My Next.js App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="A description of my Next.js app" />
      </Head>

      {/* Wrap the Component with any providers or global components */}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
