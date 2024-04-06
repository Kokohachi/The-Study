import Header from "@/components/study/Header";
import { Input, Container, FileInput, Button } from "@mantine/core";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { hasCookie, getCookie } from "cookies-next";
import { useRouter } from "next/router";
import {
  Credentials,
  RepoDesignation,
  uploadFile,
  uploadFiles,
  whoAmI,
} from "@huggingface/hub";
import { jwtDecode } from "jwt-decode";
export default function Setup() {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [decoded, setDecoded] = useState<any>({});
  const router = useRouter();
  const handleSetup = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );
    const repo: RepoDesignation = { type: "dataset", name: "kix-intl/ts" };
    const credentials: Credentials = {
      accessToken: "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",
    };
    const { name: username } = await whoAmI({ credentials });
    await uploadFiles({
      repo,
      credentials,
      files: [
        {
          path: `avatars/${decoded.email}`,
          content: new Blob([avatar as BlobPart]),
        },
      ],
    });
    console.log(decoded.email);
    await supabase
      .from("studyUser")
      .update({
        avatar: `https://huggingface.co/datasets/kix-intl/ts/resolve/main/avatars/${decoded.email}?download=true`,
        display_name: name,
      })
      .eq("email", decoded.email);
  };

  useEffect(() => {
    if (hasCookie("study-credentials")) {
      setDecoded(jwtDecode(getCookie("study-credentials") as string));
    } else {
      router.push("/study");
    }
  }, []);

  return (
    <>
      <Header />
      <Container maw={"90%"} mx="auto">
        <Input.Wrapper label="Avatar Image">
          <FileInput
            color="gray"
            placeholder="Choose Image..."
            onChange={(e) => {
              setAvatar(e);
            }}
            accept="image/*"
          />
        </Input.Wrapper>
        <Input.Wrapper label="Username" mt={10}>
          <Input
            color="gray"
            placeholder="Enter display name..."
            onChange={(e) => {
              setName(e.target.value);
            }}

          />
        </Input.Wrapper>
        <Button
          onClick={() => {
            setAvatar(decoded.picture);
            setName(decoded.name);
            handleSetup();
            router.push("/study");
          }}
          mt={10}
          w={"100%"}
          color="gray"
          variant="subtle"
        >
          Skip
        </Button>
        <Button
          onClick={() => {
            handleSetup();
            router.push("/study");
          }}
          mt={10}
          w={"100%"}
          color="gray"
          variant="outline"
          disabled={avatar === null || name === ""}
        >
          Start The Study
        </Button>
      </Container>
    </>
  );
}
