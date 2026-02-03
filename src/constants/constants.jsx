export const DEFAULT_APP_SETTINGS = {
  skin: "STANDARD", //skin can be STANDARD
  backgroundImg: "NONE", //background can be "NONE" or a URL.
};

export const ESCAPP_CLIENT_SETTINGS = {
  imagesPath: "./images/",
};
export const MAIN_SCREEN = "MAIN_SCREEN";

export const THEMES = {
  STANDARD: "STANDARD",
  RETRO: "RETRO",
  MODERN: "MODERN",
};

export const THEME_ASSETS = {
  [THEMES.STANDARD]: {
    // Standard CSS-based theme assets
  },
  [THEMES.RETRO]: {
    radioImg: "/images/radio_retro.png",
  },
  [THEMES.MODERN]: {
    radioImg: "/images/radio_modern.png",
  }
};

