import { JSX } from 'react'
import { SignIn } from "@clerk/react-router";
import { type LoaderFunctionArgs } from "react-router";
import { ClientOnly } from "~/components/ClientOnly";
import { rootAuthLoader } from "@clerk/react-router/server";

export async function loader(args: LoaderFunctionArgs) {
  return rootAuthLoader(args);
}

export default function SignInPage(): JSX.Element {
  return (
    <div className="w-full flex flex-col justify-center items-start mt-10 border-2 border-red-500">
      foo
      <ClientOnly fallback={<div>Loading...</div>}>
        <SignIn
          fallbackRedirectUrl="/home"
          appearance={{
            elements: {
              formButtonPrimary: "bg-red hover:bg-yellow text-sm normal-case",
            },
          }}
        />
      </ClientOnly>
    </div>
  );
}
