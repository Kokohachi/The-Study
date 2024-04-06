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
  Overlay,
  Modal,
  Loader,
  Center,
  Progress,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useEffect, useState } from "react";
import {
  PiCross,
  PiFile,
  PiUpload,
  PiUploadDuotone,
  PiX,
} from "react-icons/pi";
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
import { useDisclosure } from "@mantine/hooks";

export default function Upload() {
  const [files, setFiles] = useState([] as any);
  const [fileID, setFileID] = useState("none");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState([] as string[]);
  const [description, setDescription] = useState("");
  const [userdata, setUserData] = useState({} as CrendentialData);
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadedFileCount, setUploadedFileCount] = useState(0);
  const [percen, setPercen] = useState(0);
  const handleUpload = async () => {
    open();
    setUploadStatus("Uploading files...");
    const repo: RepoDesignation = { type: "dataset", name: "kix-intl/ts" };
    const credentials: Credentials = {
      accessToken: "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",
    };
    const { name: username } = await whoAmI({ credentials });
    let fileids = [] as string[];
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );

    //create a list of uuid for each file, into one array
    const fileIdList = files.map((_:any) => shortUUID().generate());
    // suffix of each file
    const suffixes = files.map((file: any) => file.name.split(".").pop());
    // make alist of file {path: content:} for each file
    const fileData = files.map((file: any, index: number) => {
      return {
        path: `studyAsset/${fileIdList[index]}.${suffixes[index]}`,
        content: new Blob([file]),
      };
    });
    console.log(fileData);
    //upload files
    for await (const progressEvent of await uploadFilesWithProgress({
      repo,
      credentials,
      files: fileData,
    })) {
      console.log(progressEvent);
      //progress is like 0.782871.... so round it to something like 78
      const percent = Math.round((progressEvent as any).progress * 100);
      setPercen(percent);
    }
    setUploadStatus("Uploading to database...");

    //file id and suffix combined
    const fileIdListWithSuffix = fileIdList.map((id: any, index :any) => {
      return `${id}.${suffixes[index]}`;
    });

    await supabase.from("studies").insert([
      {
        id: fileID,
        title: title,
        subject: subject,
        tags: tags,
        desc: description,
        fileId: fileIdListWithSuffix,
        email: userdata.email,
      },
    ]);
    setUploadStatus("Done!");
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
        <Modal
          opened={opened}
          onClose={close}
          title="Upload in Progress..."
          withCloseButton={false}
        >
          <Stack gap="md">
            <Text fw={"700"} fz={"lg"}> Uploading... </Text>
            <Text color="gray">{uploadStatus}</Text>
            {!(uploadStatus === "Done!") && (
            <Progress value={percen} color="gray" />
            )}
            {uploadStatus === "Done!" && <Button color="gray" onClick={() => router.push("/study") }>The Study | Home </Button>}
          </Stack>
        </Modal>
        <Text my="10" fz="20" fw="600">
          Upload
        </Text>
        {!(files.length > 0) ? (
          <Dropzone
            onDrop={(files) => {
              setFiles(files);
              setFileID(shortUUID().generate());
            }}
            multiple={true}
            onReject={(files) => console.log("rejected files", files)}
            accept={[
              "image/png",
              "image/jpeg",
              "image/gif",
              "image/webp",
              "application/pdf",
            ]}
          >
            <Group
              justify="center"
              gap="xl"
              mih={220}
              style={{ pointerEvents: "none" }}
            >
              <Dropzone.Accept>
                <PiUpload
                  style={{
                    width: 52,
                    height: 52,
                    color: "var(--mantine-color-blue-6)",
                  }}
                  stroke={"1.5"}
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <PiX style={{ width: 52, height: 52 }} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <PiUploadDuotone style={{ width: 52, height: 52 }} />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline>
                  Upload Files
                </Text>
                <Text size="sm" c="dimmed" mt="sm">
                  Drag and drop your files here (Image or PDF)
                </Text>
              </div>
            </Group>
          </Dropzone>
        ) : (
          <Stack>
            {files.map((file: any, index: number) => (
              <Card key={index} shadow="sm" padding="md" radius="md" withBorder>
                <Group>
                  <PiFile />
                  <Text>{file.name}</Text>
                  <PiX
                    style={{ cursor: "pointer", marginLeft: "auto" }}
                    onClick={() => {
                      setFiles(files.filter((_: any, i: any) => i !== index));
                    }}
                  />
                  <Anchor href={URL.createObjectURL(file)} target="_blank">
                    Preview
                  </Anchor>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
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
            ]}
          />
          <TagsInput
            label="Tags"
            placeholder="タグを入力しエンターキーを押してください"
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
