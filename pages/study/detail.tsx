import Header from "@/components/study/Header";
import { Carousel, CarouselSlide } from "@mantine/carousel";
import {
  ActionIcon,
  Avatar,
  Card,
  Container,
  Divider,
  Group,
  Pill,
  Space,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { createClient } from "@supabase/supabase-js";
import { hasCookie, getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  PiDownload,
  PiDownloadDuotone,
  PiPaperPlaneLight,
  PiStar,
  PiStarDuotone,
} from "react-icons/pi";
import { CrendentialData } from "./login";
import shortUUID from "short-uuid";

export default function Study() {
  const [fileURLs, setFileURLs] = useState<string[]>([]);
  const [studyData, setstudyData] = useState(Object);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([] as any[]);
  const [commentEntered, setCommentEntered] = useState("");
  const [usernameList, setUsernameList] = useState([] as string[]);
  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
  const handleComment = async () => {
    const jwt = getCookie("study-credentials") as string;
    const decoded = jwtDecode(jwt) as CrendentialData;
    const comId = shortUUID.generate();
    const { data, error } = await supabase.from("studyComment").insert([
      {
        id: comId,
        comment_on: router.query.id,
        comment_by: decoded.email,
        comment: {
          text: commentEntered,
          created_at: new Date().toISOString(),
        },
      },
    ]);
    if (error) {
      console.error(error);
    }
    if (data) {
      console.log(data);
    }
    setCommentEntered("");
    console.log(commentEntered);
    setComments([
      ...comments,
      {
        id: comId,
        comment_on: router.query.id,
        comment_by: decoded.email,
        comment: {
          text: commentEntered,
          created_at: new Date()
        },
      },
    ]);
  };
  const handleLike = async () => {
    const jwt = getCookie("study-credentials") as string;
    const decoded = jwtDecode(jwt) as CrendentialData;
    const { data, error } = await supabase
      .from("studyLikes")
      .select("*")
      .eq("id", `${decoded.email}`);
    if (error) {
      console.error(error);
    }
    if (data) {
      if (data.length === 0) {
        await supabase.from("studyLikes").insert([
          {
            id: `${decoded.email}`,
            likes: [router.query.id],
          },
        ]);
        setIsLiked(true);
      } else {
        if (data[0].likes.includes(router.query.id)) {
          const likes = data[0].likes.filter(
            (id: string) => id !== router.query.id
          );
          await supabase
            .from("studyLikes")
            .update({ likes })
            .eq("id", `${decoded.email}`);
          setIsLiked(false);
        } else {
          const likes = data[0].likes;
          likes.push(router.query.id);
          await supabase
            .from("studyLikes")
            .update({ likes })
            .eq("id", `${decoded.email}`);
          setIsLiked(true);
        }
      }
    }
  };
  const getstudyData = async (id: string) => {
    // get study data
    const { data, error } = await supabase
      .from("studies")
      .select("*")
      .eq("id", id);
    if (error) {
      console.error(error);
    }
    if (data) {
      const { data: dat2, error: erro2 } = await supabase
        .from("studyUser")
        .select("*")
        .eq("email", data[0].email);

      if (erro2) {
        console.error(erro2);
      }
      if (dat2) {
        const study = {
          title: data[0].title,
          subject: data[0].subject,
          tags: JSON.parse(data[0].tags),
          desc: data[0].desc,
          email: data[0].email,
          fileId: JSON.parse(data[0].fileId),
          created_at: data[0].created_at,
          display_name: dat2[0].display_name,
          avatar: dat2[0].avatar,
        };
        console.log(study);
        setstudyData(study);
      }
    }
  };
  const setLikeOnLoad = async () => {
    const jwt = getCookie("study-credentials") as string;
    const decoded = jwtDecode(jwt) as CrendentialData;
    const { data, error } = await supabase
      .from("studyLikes")
      .select("*")
      .eq("id", `${decoded.email}`);
    if (error) {
      console.error(error);
    }
    if (data) {
      if (data.length > 0) {
        if (data[0].likes.includes(router.query.id)) {
          setIsLiked(true);
        }
      }
    }
  };
  const getUsernames = async () => {
    const { data, error } = await supabase
      .from("studyUser")
      .select("email, display_name");
    if (error) {
      console.error(error);
    }
    if (data) {
      /// dict of email: display_name
      const names = data.reduce((acc: any, cur: any) => {
        acc[cur.email] = cur.display_name;
        return acc;
      }, {});
      setUsernameList(names);
    }
  };
  const getComments = async (id: string) => {
    const { data, error } = await supabase
      .from("studyComment")
      .select("*")
      .eq("comment_on", id);
    if (error) {
      console.error(error);
    }
    if (data) {
      console.dir(data);
      setComments(data);
    }
  };
  useEffect(() => {
    const id = router.query.id as string;
    if (id) {
      getstudyData(id);
    }
    if (hasCookie("study-credentials")) {
      const jwt = getCookie("study-credentials") as string;
      const decoded = jwtDecode(jwt) as CrendentialData;
      getUsernames();
      setLikeOnLoad();
      getComments(id);
    } else {
      router.push("/study/login");
    }
  }, [router]);
  return (
    <>
      <Header title={`${studyData?.title} - ${studyData?.display_name}`} />
      <Container maw={"90%"} mx="auto">
        <Carousel>
          {studyData?.fileId?.map((url: string) => (
            <Carousel.Slide key={url}>
              <iframe
                src={`https://docs.google.com/viewer?url=https://huggingface.co/datasets/kix-intl/ts/resolve/main/studyAsset/${url}&embedded=true`}
                width="100%"
                height="500px"
              />
            </Carousel.Slide>
          ))}
        </Carousel>
        <Stack>
          <Text mt="10" fz="xl" fw="600">
            {studyData?.title}
          </Text>
          <Text color="gray" fz={"lg"} fw="600">
            {studyData?.subject}
          </Text>
          <Group>
            {studyData?.tags?.map((tag: string) => (
              <Pill size="xl" key={tag}>
                {tag}
              </Pill>
            ))}
            <ActionIcon
              color="gray"
              size="lg"
              radius="md"
              style={{ marginLeft: "auto" }}
              variant="outline"
              onClick={() => {
                handleLike();
              }}
              //filled on liked (gray)
            >
              {isLiked ? (
                <PiStarDuotone style={{ color: "ff8080" }} size={24} />
              ) : (
                <PiStar size={24} />
              )}
            </ActionIcon>
          </Group>
          <Text color="gray">{studyData?.desc}</Text>
          <Group>
            <Avatar src={studyData?.avatar} size={"lg"} />
            <Text fz="lg" fw="600">
              {/* date ja */}
              {studyData?.display_name}
            </Text>
            <Text color="gray" size="sm">
              on {new Date(studyData?.created_at).toLocaleString("ja-JP")}
            </Text>
          </Group>
          <Text fz="24" fw="600">
            Files
          </Text>
          {studyData?.fileId?.map((file: string) => (
            <Card
              key={file}
              onClick={() => {
                const a = document.createElement("a");
                a.href = `https://huggingface.co/datasets/kix-intl/ts/resolve/main/studyAsset/${file}`;
                a.download = file;
                a.click();
              }}
              withBorder
              radius="md"
              style={{ cursor: "pointer" }}
            >
              <Group>
                <Text color="gray">{file}</Text>
                <PiDownload style={{ marginLeft: "auto" }} size={24} />
              </Group>
            </Card>
          ))}
        </Stack>
        <Space h={20} />
        <Text fz="24" fw="600">
          Comments
        </Text>

        <Stack>
          {comments.map((comment: any) => (
            <>
              <Card key={comment.id} mt={"sm"}>
                <Group>
                  <Avatar
                    src={`https://huggingface.co/datasets/kix-intl/ts/resolve/main/avatars/${comment.comment_by}?download=true`}
                    size={"sm"}
                  />
                  <Stack gap={0}>
                    <Text fz="sm">
                      {usernameList[comment.comment_by]} on{" "}
                      {new Date(comment.created_at).toLocaleString()}
                    </Text>

                    <Text color="gray" size="sm">
                      {comment.comment.text}
                    </Text>
                  </Stack>
                </Group>
              </Card>
              <Divider />
            </>
          ))}
        </Stack>
        <Group>
          <TextInput
            className="comment-input"
            value={commentEntered}
            placeholder="Write a comment..."
            w={"100%"}
            radius={"md"}
            mt={"sm"}
            variant="outline"
            style={{ borderBottom: "1px solid #e1e1e1" }}
            onChange={(e) => {
              setCommentEntered(e.target.value);
            }}
            rightSection={
              <ActionIcon
                color="gray"
                size="lg"
                radius="md"
                variant="subtle"
                onClick={() => {
                  handleComment();
                }}
              >
                <PiPaperPlaneLight size={24} width={"10%"} />
              </ActionIcon>
            }
          />
        </Group>
        <Space h={20} />
      </Container>
    </>
  );
}
