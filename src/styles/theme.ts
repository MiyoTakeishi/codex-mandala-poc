import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  colors: {
    brand: {
      50: "#E7F1EF",
      100: "#D2E3DF",
      200: "#A4C8C1",
      300: "#75ADA3",
      400: "#3F877D",
      500: "#1F5F58",
      600: "#1A514B",
      700: "#173F3B",
      800: "#102F2C",
      900: "#0B211F",
    },
    amber: {
      50: "#FBF3E4",
      100: "#F2DFC0",
      200: "#E4C587",
      300: "#D6AB5E",
      400: "#B8873D",
      500: "#986B2D",
      600: "#835B27",
      700: "#60421F",
      800: "#402C17",
      900: "#271B10",
    },
    ink: {
      50: "#F3F5F3",
      100: "#E1E7E4",
      200: "#C3CDC8",
      300: "#A0AEA8",
      400: "#7D8E87",
      500: "#66736D",
      600: "#4E5B56",
      700: "#384540",
      800: "#26312D",
      900: "#18211F",
    },
    linen: {
      50: "#FFFFFC",
      100: "#F7F7F4",
      200: "#F1F1EC",
      300: "#E6E7DF",
      400: "#D8DAD2",
      500: "#BEC2B8",
      600: "#9CA297",
      700: "#777F74",
      800: "#565E55",
      900: "#383F39",
    },
  },
  fonts: {
    heading:
      '"Inter", "Noto Sans JP", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body:
      '"Inter", "Noto Sans JP", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  radii: {
    md: "6px",
    lg: "8px",
  },
  shadows: {
    card: "0 14px 34px rgba(24, 33, 31, 0.06)",
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "brand",
      },
      baseStyle: {
        fontWeight: "700",
        letterSpacing: "0",
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
          },
          _active: {
            bg: "brand.700",
          },
        },
        outline: {
          borderColor: "linen.400",
          color: "ink.800",
          _hover: {
            bg: "linen.200",
          },
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: "linen.50",
            borderColor: "linen.400",
            color: "ink.900",
            _placeholder: {
              color: "ink.400",
            },
            _focusVisible: {
              borderColor: "brand.500",
              boxShadow: "0 0 0 3px rgba(47, 111, 100, 0.16)",
            },
          },
        },
      },
    },
    Textarea: {
      variants: {
        outline: {
          bg: "linen.50",
          borderColor: "linen.400",
          color: "ink.900",
          _placeholder: {
            color: "ink.400",
          },
          _focusVisible: {
            borderColor: "brand.500",
            boxShadow: "0 0 0 3px rgba(47, 111, 100, 0.16)",
          },
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "linen.100",
        color: "ink.900",
        letterSpacing: "0",
      },
    },
  },
});
