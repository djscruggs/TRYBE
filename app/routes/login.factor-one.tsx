import { JSX } from 'react'
import { SignIn } from "@clerk/react-router";
import { type LoaderFunctionArgs } from "react-router";
import { rootAuthLoader } from "@clerk/react-router/server";

export async function loader(args: LoaderFunctionArgs) {
  return rootAuthLoader(args);
}

export default function SignInPage(): JSX.Element {
  return (
    <div className="w-full flex flex-col justify-center items-start mt-10">
        <SignIn
          routing="hash"
          fallbackRedirectUrl="/home"
          afterSignInUrl="/home"
          appearance={{
            elements: {
              formButtonPrimary: "bg-red hover:bg-yellow text-sm normal-case",
            },
          }}
        />
      
    </div>
  );
}

