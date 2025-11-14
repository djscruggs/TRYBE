import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
  useLoaderData,
  useSearchParams,
  useRevalidator,
} from "react-router";
import type { Route } from "../.react-router/types/app/+types/root";
import { useEffect, useState } from "react";
import { CurrentUserContext } from "./contexts/CurrentUserContext";
import DeviceContext from "./contexts/DeviceContext";
import LayoutComponent from "./ui/layout";
import "./tailwind.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-circular-progressbar/dist/styles.css";
import type { LinksFunction, LoaderFunction, MetaFunction } from "react-router";
import { type CurrentUser } from "./utils/types";
import { Toaster } from "react-hot-toast";
import { ClerkProvider, useUser } from "@clerk/react-router";
import { rootAuthLoader, clerkMiddleware } from "@clerk/react-router/server";

export const middleware = [clerkMiddleware()];

export const links: LinksFunction = () => [];

export const meta: MetaFunction = () => {
  return [
    { title: "Trybe" },
    { viewport: "width=device-width,initial-scale=1" },
  ];
};

export interface RootLoaderData {
  ENV: {
    CLERK_PUBLISHABLE_KEY: string;
    NODE_ENV: string;
  };
  user: CurrentUser | null;
  auth: typeof rootAuthLoader;
}

export const loader: LoaderFunction = async (args) => {
  return rootAuthLoader(args, ({ request }) => {
    return {
      ENV: {
        CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || "",
        NODE_ENV: process.env.NODE_ENV || "development",
      },
    };
  });
};

// React Router v7 Layout component - handles both SSR and client-side hydration
export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<RootLoaderData>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Taprom&family=Waiting+for+the+Sunrise&display=swap"
        />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `console.log('🔥 INLINE SCRIPT - HTML IS LOADING')`,
          }}
        />
        <ClerkProvider loaderData={data}>{children}</ClerkProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function ClerkRevalidator() {
  const revalidator = useRevalidator();
  const clerkUser = useUser();

  useEffect(() => {
    revalidator.revalidate();
  }, [clerkUser.user, revalidator]);

  return null;
}

export default function App(): Route.ComponentProps {
  const data = useLoaderData<RootLoaderData>();

  const { user } = data || {};
  const userAgent = typeof window !== "undefined" ? navigator.userAgent : "";
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(
    user as CurrentUser
  );

  // Determine if the user agent is "gonative median" and if iphone or android
  const isMobileDevice =
    userAgent?.includes("gonative median") || userAgent?.includes("capacitor");
  const isIphone =
    isMobileDevice && userAgent?.toLowerCase().includes("iphone");
  const isAndroid =
    isMobileDevice && userAgent?.toLowerCase().includes("android");

  useEffect(() => {
    setCurrentUser(user as CurrentUser);
  }, [user]);

  const searchParams = useSearchParams();
  if (!user && typeof window !== "undefined") {
    const redirectTo = searchParams[0].get("redirectTo");

    if (redirectTo && !localStorage.getItem("redirectTo")) {
      localStorage.setItem("redirectTo", redirectTo);
    }
  }

  return (
    <>
      <ClerkRevalidator />
      <DeviceContext.Provider
        value={{
          isMobileDevice,
          isIphone,
          isAndroid,
          isMobile: () => isIphone || isAndroid,
        }}
      >
        <Toaster position="top-center" />
        <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
          <LayoutComponent />
        </CurrentUserContext.Provider>
      </DeviceContext.Provider>
    </>
  );
}

// https://remix.run/docs/en/main/route/error-boundary
export function ErrorBoundary(): JSX.Element {
  const error = useRouteError();
  // captureRemixErrorBoundaryError(error)
  if (isRouteErrorResponse(error)) {
    let message;

    switch (error.status) {
      case 401:
        message = (
          <p>
            Oops! Looks like you tried to visit a page that you do not have
            access to.
          </p>
        );
        break;
      case 404:
        message = (
          <p>Oops! Looks like you tried to visit a page that does not exist.</p>
        );
        break;

      default:
        throw new Error(
          `Unhandled error.status: ${error.status}: ${error.data || error.statusText}`
        );
    }

    return (
      <div className="flex flex-col justify-start items-start mr-8">
        <h1>
          {error.status}: {error.statusText}
        </h1>
        {message}
      </div>
    );
  }

  if (error instanceof Error) {
    console.error(error);
    return (
      <div style={{ margin: "100px", padding: "25%" }}>
        <h1 style={{ fontSize: "1rem", color: "red" }}>There was an error</h1>
        <p style={{ fontSize: "2rem" }}>{error.message}</p>
      </div>
    );
  }

  return <h1>Unknown Error</h1>;
}
