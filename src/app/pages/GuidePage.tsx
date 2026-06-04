import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

import { AppShell } from "../AppShell";
import { AppIcon } from "../../components/ui/AppIcon";

const centerThemes = [
  "体力",
  "練習計画",
  "食事",
  "睡眠",
  "フルマラソン完走",
  "装備",
  "メンタル",
  "記録",
  "休息",
];

const actionExamples = [
  "週3回走る",
  "5kmから始める",
  "月1回長距離",
  "坂道を歩く",
  "体力",
  "筋トレ10分",
  "階段を使う",
  "心拍を記録",
  "走後ストレッチ",
];

const guideThemes = [
  {
    bg: "red.50",
    border: "red.400",
    text: "red.700",
  },
  {
    bg: "pink.50",
    border: "pink.400",
    text: "pink.700",
  },
  {
    bg: "purple.50",
    border: "purple.400",
    text: "purple.700",
  },
  {
    bg: "blue.50",
    border: "blue.400",
    text: "blue.700",
  },
  {
    bg: "white",
    border: "ink.700",
    text: "ink.900",
  },
  {
    bg: "cyan.50",
    border: "cyan.400",
    text: "cyan.700",
  },
  {
    bg: "green.50",
    border: "green.400",
    text: "green.700",
  },
  {
    bg: "yellow.50",
    border: "yellow.500",
    text: "yellow.800",
  },
  {
    bg: "orange.50",
    border: "orange.500",
    text: "orange.800",
  },
];

const appSteps = [
  {
    title: "ログインしてチャートを作る",
    body: "Googleでログインし、一覧画面でタイトルを入力して「チャートを作成」を押します。",
  },
  {
    title: "チャートを開いて編集する",
    body: "一覧の「開く」から編集画面へ移動します。セルは入力後、フォーカスが外れたタイミングで保存されます。",
  },
  {
    title: "共有設定を開く",
    body: "編集画面の「共有設定」から、招待リンクの発行と編集者メールアドレスの管理を行います。",
  },
  {
    title: "共有相手にリンクを渡す",
    body: "共有リンクを知っている人はゲスト閲覧できます。編集するには、許可済みメールアドレスでのGoogleログインが必要です。",
  },
];

const faqs = [
  {
    question: "最初に何を書けばいいですか？",
    answer:
      "まず中央の1マスに、一番達成したい目標を書きます。例として「資格に合格する」「売上を伸ばす」「健康習慣を作る」のように、1つに絞ると整理しやすくなります。",
  },
  {
    question: "中央の周り8マスには何を書きますか？",
    answer:
      "目標達成に必要な大きなテーマを書きます。たとえば健康が目標なら、運動、食事、睡眠、記録、環境、仲間、知識、休息のような分類です。",
  },
  {
    question: "外側の3x3には何を書きますか？",
    answer:
      "そのテーマを実行するための具体的な行動を書きます。「運動」なら、週3回歩く、階段を使う、ストレッチする、体重を測る、のように今日からできる行動にします。",
  },
  {
    question: "全部埋めないと使えませんか？",
    answer:
      "全部埋めなくても使えます。まず中央と周り8テーマだけを作り、外側の行動マスは考えが固まったところから埋めてください。",
  },
  {
    question: "このアプリでは中央3x3と外側ブロックはどうつながりますか？",
    answer:
      "中央3x3の周囲8マスは、外側8ブロックの中心セルと連動します。どちらかを編集すると、対応するもう一方にも同じ内容が反映されます。",
  },
  {
    question: "共有リンクを知っている人は編集できますか？",
    answer:
      "初期状態ではゲスト閲覧です。編集するにはGoogleログインと、作成者が共有設定で追加した編集者メールアドレスの一致が必要です。",
  },
];

function MiniChartFrame({
  borderColor,
  children,
}: {
  borderColor: string;
  children: ReactNode;
}) {
  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(3, 1fr)"
      gap="1px"
      bg={borderColor}
      border="2px solid"
      borderColor={borderColor}
      w="100%"
      maxW="340px"
      mx="auto"
    >
      {children}
    </Box>
  );
}

function MiniCenterChart() {
  return (
    <MiniChartFrame borderColor="ink.600">
      {centerThemes.map((label, index) => {
        const isGoal = index === 4;
        const theme = guideThemes[index];

        return (
          <Box
            key={label}
            aspectRatio="1"
            bg={theme.bg}
            border="2px solid"
            borderColor={theme.border}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={2}
            textAlign="center"
          >
            <Text
              color={theme.text}
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight={isGoal ? "bold" : "semibold"}
            >
              {label}
            </Text>
          </Box>
        );
      })}
    </MiniChartFrame>
  );
}

function MiniActionBlock() {
  const linkedTheme = guideThemes[0];

  return (
    <MiniChartFrame borderColor={linkedTheme.border}>
      {actionExamples.map((label, index) => {
        const isTheme = index === 4;

        return (
          <Box
            key={label}
            aspectRatio="1"
            bg={isTheme ? linkedTheme.bg : "white"}
            border="2px solid"
            borderColor={isTheme ? linkedTheme.border : "linen.300"}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={2}
            textAlign="center"
          >
            <Text
              color={isTheme ? linkedTheme.text : "ink.700"}
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight={isTheme ? "bold" : "semibold"}
            >
              {label}
            </Text>
          </Box>
        );
      })}
    </MiniChartFrame>
  );
}

function StepCard({
  body,
  index,
  title,
}: {
  body: string;
  index: number;
  title: string;
}) {
  return (
    <Box bg="white" border="1px solid" borderColor="linen.300" borderRadius="lg" p={4}>
      <Text color="brand.600" fontSize="sm" fontWeight="bold">
        STEP {index + 1}
      </Text>
      <Heading size="sm" color="ink.900" mt={2}>
        {title}
      </Heading>
      <Text color="ink.500" fontSize="sm" mt={2}>
        {body}
      </Text>
    </Box>
  );
}

export function GuidePage() {
  return (
    <AppShell>
      <VStack align="stretch" spacing={6}>
        <Box
          bg="linen.50"
          border="1px solid"
          borderColor="linen.300"
          borderRadius="lg"
          boxShadow="card"
          p={{ base: 5, md: 8 }}
        >
          <VStack align="start" spacing={4}>
            <Badge colorScheme="brand">GUIDE</Badge>
            <Box>
              <Heading size="xl" color="ink.900">
                使い方ガイド
              </Heading>
              <Text color="ink.500" mt={3} maxW="3xl">
                ここでは、マンダラチャート自体の仕組みと、このアプリでの操作方法を分けて説明します。
                はじめて使う場合は、まず「中心の目標」「周りの8テーマ」「外側の具体行動」の順に見てください。
              </Text>
            </Box>
            <HStack flexWrap="wrap" spacing={3}>
              <Button as={RouterLink} leftIcon={<AppIcon name="plus" />} to="/charts">
                チャートを作成する
              </Button>
              <Button
                as={RouterLink}
                leftIcon={<AppIcon name="logIn" />}
                to="/login"
                variant="outline"
              >
                ログインする
              </Button>
            </HStack>
          </VStack>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4} alignItems="stretch">
          <Box bg="white" border="1px solid" borderColor="linen.300" borderRadius="lg" p={5}>
            <VStack align="stretch" spacing={4} h="100%">
              <Box minH={{ base: "auto", lg: "154px" }}>
                <Badge colorScheme="gray">MANDALA CHART</Badge>
                <Heading size="md" color="ink.900" mt={2}>
                  マンダラチャートの仕組み
                </Heading>
                <Text color="ink.600" mt={3}>
                  マンダラチャートは、目標を「大きなテーマ」と「具体的な行動」に分けて考えるための9x9の表です。
                  中央に最終目標を置き、その周りに必要な8つのテーマを書きます。
                </Text>
              </Box>
              <MiniCenterChart />
              <Text color="ink.600">
                例では中央の「フルマラソン完走」を達成するために、体力、練習計画、食事、睡眠などの8テーマを置いています。
                まずはこの中央3x3を作ると、目標に必要な要素が見えやすくなります。
              </Text>
              <Text color="brand.700" fontSize="sm" fontWeight="bold">
                左上の「体力」が、右の例では外側3x3の中心セルになります。
              </Text>
            </VStack>
          </Box>

          <Box bg="white" border="1px solid" borderColor="linen.300" borderRadius="lg" p={5}>
            <VStack align="stretch" spacing={4} h="100%">
              <Box minH={{ base: "auto", lg: "154px" }}>
                <Badge colorScheme="brand">ACTION</Badge>
                <Heading size="md" color="ink.900" mt={2}>
                  外側の3x3で行動に落とす
                </Heading>
                <Text color="ink.600" mt={3}>
                  中央3x3で決めた8テーマは、外側8ブロックの中心セルになります。
                  その周りに、実際にやる行動やチェック項目を書きます。
                </Text>
              </Box>
              <MiniActionBlock />
              <Text color="ink.600">
                例では「体力」を中心に置き、周囲に「週3回走る」「5kmから始める」「走後ストレッチ」など、
                すぐ実行できる行動を書いています。
              </Text>
            </VStack>
          </Box>
        </SimpleGrid>

        <Box bg="linen.50" border="1px solid" borderColor="linen.300" borderRadius="lg" p={5}>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Badge colorScheme="brand">APP TUTORIAL</Badge>
              <Heading size="md" color="ink.900" mt={2}>
                このアプリの使い方
              </Heading>
              <Text color="ink.500" mt={2}>
                ここからは、チャートの考え方ではなく、このアプリ上での操作手順です。
              </Text>
            </Box>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3}>
              {appSteps.map((step, index) => (
                <StepCard key={step.title} index={index} title={step.title} body={step.body} />
              ))}
            </SimpleGrid>
          </VStack>
        </Box>

        <Box bg="white" border="1px solid" borderColor="linen.300" borderRadius="lg" p={5}>
          <VStack align="stretch" spacing={4}>
            <Heading size="md" color="ink.900">
              Q&A
            </Heading>
            <Accordion allowToggle>
              {faqs.map((faq) => (
                <AccordionItem key={faq.question} borderColor="linen.300">
                  <AccordionButton px={0} py={4}>
                    <Box as="span" flex="1" textAlign="left" fontWeight="bold" color="ink.900">
                      {faq.question}
                    </Box>
                    <AccordionIcon color="ink.500" />
                  </AccordionButton>
                  <AccordionPanel px={0} pb={4} color="ink.600">
                    {faq.answer}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </Box>
      </VStack>
    </AppShell>
  );
}
