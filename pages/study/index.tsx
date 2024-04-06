import Header from "@/components/study/Header";
import {
  Alert,
  Avatar,
  Card,
  Container,
  Divider,
  Group,
  Select,
  SimpleGrid,
  Text,
  TextInput,
} from "@mantine/core";
import { createClient } from "@supabase/supabase-js";
import { getCookie, hasCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BsChevronRight, BsDownload } from "react-icons/bs";
import { PiStarDuotone } from "react-icons/pi";
import { CrendentialData } from "./login";
import { MdOutlineQuiz } from "react-icons/md";

export default function Lister() {
  const [studies, setStudies] = useState([] as any[]);
  const [subFilter, setSubFilter] = useState("全て");
  const [sub2Filter, setSub2Filter] = useState("全て");
  const [sub3Filter, setSub3Filter] = useState("全て");
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [likes, setLikes] = useState([] as string[]);

  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
  const getStudies = async () => {
    const { data, error } = await supabase
      .from("studies")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
    }
    if (data) {
      setStudies(data);
      setLoading(false);
    }
  };
  const getLikes = async (id: string) => {
    const { data, error } = await supabase
      .from("studyLikes")
      .select("*")
      .eq("id", id);

    if (error) {
      console.error(error);
    }
    if (data) {
      console.log(data);
      //sort from latest
      setLikes(data[0].likes);
    }
  };
  const getName = async (id: string) => {
    let name = "";
    supabase
      .from("studyUser")
      .select("display_name")
      .eq("email", id)
      .then((data) => {
        name = data?.data ? data.data[0].display_name : "Unknown";
      });
    console.log(name);
    return name;
  };

  useEffect(() => {
    if (!hasCookie("study-credentials")) {
      router.push("/study/login");
    } else {
      const jwt = getCookie("study-credentials") as string;
      const decoded = jwtDecode(jwt) as CrendentialData;
      if (decoded) {
        getStudies();
        getLikes(decoded.email);
      }
    }
  }, []);
  return (
    <>
      <Header title="Study Home" />
      <Container maw={"90%"} mx="auto">
        <TextInput
          placeholder="Search"
          mt={"lg"}
          onChange={(e) => {
            setKeyword(e.target.value);
          }}
        />
        <SimpleGrid cols={3}>
          <Select
            data={[
              "全て",
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
            defaultValue={"全て"}
            onChange={(value) => {
              setSubFilter(value as string);
            }}
            mt={"lg"}
            label="教科"
          />
          <Select
            data={["全て", "Quizlet", "File"]}
            defaultValue={"全て"}
            onChange={(value) => {
              setSub2Filter(value as string);
            }}
            mt={"lg"}
            label="教材の種類"
          />
          <Select
            data={["全て", "お気に入り"]}
            defaultValue={"全て"}
            mt={"lg"}
            label="お気に入り"
            onChange={(value) => {
              setSub3Filter(value as string);
            }}
          />
        </SimpleGrid>

        {loading && <p>Loading...</p>}
        {studies.map((study) => {
          const date = new Date(study.created_at);
          if (subFilter !== "全て" && study.subject !== subFilter) {
            return;
          }

          if (
            sub2Filter !== "全て" &&
            (sub2Filter === "Quizlet" ? !study.isQuizlet : study.isQuizlet)
          ) {
            return;
          }

          if (
            sub3Filter !== "全て" &&
            (sub3Filter === "お気に入り"
              ? likes.filter((like) => like === study.id).length === 0
              : likes.filter((like) => like === study.id).length > 0)
          ) {
            return;
          }

          //in title or tag or desc
          if (
            keyword !== "" &&
            !study.title.includes(keyword) &&
            !study.tags.includes(keyword) &&
            !study.desc.includes(keyword)
          ) {
            return;
          }

          return (
            <>
              <Card
                key={study.id}
                onClick={() => {
                  //download
                  if (!study.isQuizlet) {
                    router.push(`/study/detail?id=${study.id}`);
                  } else {
                    location.href = JSON.parse(study.fileId)[0];
                  }
                }}
              >
                <Group>
                  <Text fz={"lg"} fw={"700"}>
                    {study.title}
                  </Text>
                  {likes.filter((like) => like === study.id).length > 0 && (
                    <PiStarDuotone style={{ color: "ff8080" }} />
                  )}
                </Group>
                <Text color="gray" fw={"600"}>
                  {study.subject}
                </Text>
                <Text color="gray">{study.desc}</Text>
                <Group>
                  <Avatar
                    src={`https://huggingface.co/datasets/kix-intl/ts/resolve/main/avatars/${study.email}?download=true`}
                    size={"sm"}
                  />
                  <Text color="gray" size="sm">
                    {" "}
                    on {date.toLocaleString()}
                  </Text>
                  <Group ml={"auto"}>
                    {study.isQuizlet && <MdOutlineQuiz size={24} />}
                    {!study.isQuizlet && <BsChevronRight size={24} />}
                  </Group>
                </Group>
              </Card>
              <Divider />
            </>
          );
        })}
      </Container>
    </>
  );
}
