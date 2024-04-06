import Header from "@/components/study/Header";
import {
  Text,
  Container,
  Space,
  Group,
  Avatar,
  Anchor,
  Input,
  Grid,
  Select,
  Stack,
  TagsInput,
  Button,
  Card,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useEffect, useState } from "react";
import { PiCross, PiFile, PiUpload, PiX } from "react-icons/pi";
import shortUUID from "short-uuid";
import { Deta } from "deta";
import {
  createRepo,
  uploadFiles,
  uploadFilesWithProgress,
  deleteFile,
  deleteRepo,
  listFiles,
  whoAmI,
} from "@huggingface/hub";
import type { RepoDesignation, Credentials } from "@huggingface/hub";
import { CrendentialData } from "./login";
import { getCookie, hasCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";


export default function Upload() {
  const [files, setFiles] = useState("");
  const [fileID, setFileID] = useState("none");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState([] as string[]);
  const [description, setDescription] = useState("");
  const [userdata, setUserData] = useState({} as CrendentialData);
  const router = useRouter();

  const handleUpload = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );
    await supabase.from("studies").insert([
      {
        id: shortUUID.generate(),
        title: title,
        subject: subject,
        tags: tags,
        desc: description,
        fileId: [files],
        email: userdata.email,
        created_at: new Date().toISOString(),
        isQuizlet: true,
      },
    ]);
    router.push("/study");
  };

  useEffect(() => {
    if (hasCookie("study-credentials")) {
      const jwt = getCookie("study-credentials") as string;
      const decoded = jwtDecode(jwt) as CrendentialData;
      setUserData(decoded);
    } else {
      router.push("/study/login");
    }
  }, []);
  return (
    <>
      <Header />
      <Container maw={"90%"} mx="auto">
        <Text my="10" fz="20" fw="600">
          Upload
        </Text>
        <Input.Wrapper label="Link To Quizlet" required mb={10}>
          <Input
            placeholder="例）https://quizlet.com/123456789"
            onChange={(e) => setFiles(e.target.value)}
          />
        </Input.Wrapper>
            <Stack gap={20}>
              <Input.Wrapper label="Title" required>
                <Input
                  placeholder="例）漢文白文"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Input.Wrapper>
              <Select
                label="Subject"
                onChange={(_value, option) => setSubject(_value as string)}
                data={[
                  "現代文",
                  "漢文",
                  "古文",
                  "代数",
                  "幾何",
                  "物理",
                  "化学",
                  "歴史",
                  "保健体育",
                  "英語１・２",
                  "英語３",
                  "フランス語",
                  "ドイツ語",
                  "中国語",
                  "韓国語",
                ]}
              />
              <TagsInput
                label="Tags"
                placeholder="Enter tag..."
                onChange={(value) => {
                  setTags(value);
                }}
              />
              <Input.Wrapper label="Description">
                <Input
                  placeholder="例）漢文白文です。"
                  multiline
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                />
              </Input.Wrapper>
              <Text size="sm" c="dimmed" mt={"md"}>
                File-ID: {fileID}
              </Text>
              <Button
                variant="gradient"
                gradient={{ from: "cyan", to: "lime" }}
                w={"100%"}
                size="lg"
                disabled={
                  title.length === 0 ||
                  subject.length === 0 ||
                  tags.length === 0 ||
                  description.length === 0 ||
                  files.length === 0
                }
                onClick={() => {
                  handleUpload();
                }}
              >
                <Text>Upload</Text>
              </Button>
            </Stack>
      </Container>
    </>
  );
}
