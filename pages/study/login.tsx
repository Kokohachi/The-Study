import Header from "@/components/study/Header";

import { Text, Container, Space, Group, Center, Stack } from "@mantine/core";

import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";

import { Outfit } from "next/font/google";
import {jwtDecode} from "jwt-decode";
import { useState } from "react";
import { setCookie } from "cookies-next";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

export interface CrendentialData {
  "iss": string,
  "azp": string,
  "aud": string,
  "sub": string,
  "email": string,
  "email_verified": boolean,
  "nbf": number,
  "name": string,
  "picture": string,
  "given_name": string,
  "family_name": string,
  "locale": string,
  "iat": number,
  "exp": number,
  "jti": string
}

const font = Outfit({ weight: "400", subsets: ["latin"] });
export default function Study() {
  const [signedIn, setSignedIn] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const router = useRouter();
  const handleLogin = async (decoded: CrendentialData) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );
    const {data, error} = await supabase.from("studyUser").select("*").eq("email", decoded.email);
    if (error) {
      setErrorMessages(["Database Error"]);
    }
    console.log(data);
    if (data) {
      if (data.length === 0) {
        const {data, error} = await supabase.from("studyUser").insert([
          {
            email: decoded.email,
            name: decoded.name,
            display_name: decoded.name,
            avatar: decoded.picture,
            pointHistory: [],
          },
        ]);

        router.push("/study/setup");
        if (error) {
          setErrorMessages(["Database Error"]);
        }
      } else {
        router.push("/study");
      }
    }
  }
  return (
    <>
      <Header />
      <Container maw={"90%"} mx="auto">
        <Center>
          <Stack gap="md">
            <Text fz="20" fw="600">
              Log In to <span className={font.className}>The Study</span>
            </Text>
            {errorMessages.map((message) => (
              <Text color="red" key={message}>
                {message}
              </Text>
            ))}
            <Text fz="16" color="gray">
              Only School Accounts are allowed to log in.
            </Text>
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                // get email and avatar and name and id from credentialResponse(cl)
                //decode JWT
                const jwt = credentialResponse.credential as string;
                const decoded = jwtDecode(jwt) as CrendentialData;

                console.log(decoded);
                if (decoded.email.endsWith(process.env.NEXT_PULIC_SCHOOL_EMAIL_SUFFIX as string)) {
                  setCookie("study-credentials", jwt, {
                    path: "/",
                    //like forever
                    maxAge: 60 * 60 * 24 * 365 * 10,
                  });
                  setSignedIn(true);
                  handleLogin(decoded);

                } else {
                  setErrorMessages(["Invalid Email : Retry with @s.musashi.ed.jp email adress"]);
                }
              }}
              text="signin_with"
              onError={() => {
                console.log("Login Failed");
                setErrorMessages(["Login Failed"]);
              }}
              size="large"
            />
          </Stack>
        </Center>
      </Container>
    </>
  );
}
