import Header from "@/components/study/Header";
import { Carousel } from "@mantine/carousel";
import {
  Container,
  Space,
  Text,
  Group,
  Avatar,
  Anchor,
  AspectRatio,
  Skeleton,
} from "@mantine/core";

export default function Study() {
  return (
    <>
      <Header />
      <Container maw={"90%"} mx="auto">
        <Carousel withIndicators height={200}>
          <Carousel.Slide><Skeleton /></Carousel.Slide>
          <Carousel.Slide></Carousel.Slide>
          <Carousel.Slide></Carousel.Slide>
        </Carousel>
      </Container>
    </>
  );
}
