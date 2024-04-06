import { Paper, Text, Avatar, Group, Button, Menu } from "@mantine/core";
import { PiGraphDuotone, PiNotebook, PiPlusCircleDuotone, PiQuestion, PiSignOut } from "react-icons/pi";
import { Outfit } from "next/font/google";
import { useRouter } from "next/router";
import { deleteCookie, getCookie, hasCookie } from "cookies-next";
import { useState, useEffect } from "react";
import { CrendentialData } from "@/pages/study/login";
import { jwtDecode } from "jwt-decode";
import Head from "next/head";

const font = Outfit({ weight: "400", subsets: ["latin"] });

export default function Header(props: any) {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userData, setUserData] = useState<CrendentialData | null>(null);
  const [avatar, setAvatar] = useState<string>("");

  useEffect(() => {
    console.log(hasCookie("study-credentials"));
    if (hasCookie("study-credentials")) {
      const jwt = getCookie("study-credentials") as string;
      const decoded = jwtDecode(jwt) as CrendentialData;
      setUserData(decoded);
      console.log(userData?.picture);
      setIsSignedIn(true);
      console.log(isSignedIn);

    }
  }, []);
  return (
    <Paper
      p="md"
      radius="lg"
      style={{ marginBottom: "20px" }}
      mt={"20px"}
      mx={"auto"}
      maw={"90%"}
    >
      <Head>
        <title>The Study | {props.title}</title>
      </Head>
      <Group>
        <PiNotebook size="40" />
        <Text
          ml="xs"
          fw={600}
          fz="xl"
          className={font.className}
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/study")}
        >
          The Study
        </Text>
        {!isSignedIn ? (
          <Button
            variant="subtle"
            color="gray"
            size="md"
            ml={"auto"}
            onClick={() => {
              router.push("/study/login");
            }}
          >
            Log In
          </Button>
        ) : (
          <Group ml={"auto"}>
            <Menu>
              <Menu.Target>
                <Group>
                  <Avatar src={`https://huggingface.co/datasets/kix-intl/ts/resolve/main/avatars/${userData?.email}?download=true`} />
                </Group>
              </Menu.Target>
              <Menu.Dropdown>
              <Menu.Item
                  onClick={() => {
                    router.push("/study/upload");
                  }}
                  leftSection={<PiPlusCircleDuotone size={24} />}
                >
                  新規投稿
                </Menu.Item>
                <Menu.Item
                  onClick={() => {
                    router.push("/study/uploadQuizlet");
                  }}
                  leftSection={<PiQuestion size={24} />}
                >
                  クイズレット投稿
                </Menu.Item>
                <Menu.Item
                  onClick={() => {
                    router.push("/study/dashboard");
                  }}
                  leftSection={<PiGraphDuotone size={24} />}
                >
                  ダッシュボード
                </Menu.Item>
                <Menu.Item
                  onClick={() => {
                    deleteCookie("study-credentials");
                    router.reload();
                  }}
                  color="red"
                  leftSection={<PiSignOut size={24} />}
                >
                  ログアウト
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        )}
      </Group>
    </Paper>
  );
}
