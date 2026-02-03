export const DEFAULT_APP_SETTINGS = {
  skin: "MODERN", //skin can be STANDARD
  backgroundImg: "NONE", //background can be "NONE" or a URL.
  whiteNoiseSound: "/sounds/white_noise.wav",
  stations: [
  ],
  range: { min: 87.0, max: 108.0 },
  step: 0.1,
  tolerance: 0.3,
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
    buttonImg: "/images/button_modern.png",
    displayPanel: {
      top: "43.5%",
      left: "35%",
      width: "30%",
      height: "20%",
    },
    buttons: {
      bottom: "64.4%",
      left: "31.2%",
      width: "25%",
      height: "12%",
    },


  }
};

