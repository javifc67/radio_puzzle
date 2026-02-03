//Copy this file to config.js and specify your own settings

export let ESCAPP_APP_SETTINGS = {
  //Settings that can be specified by the authors
  skin: "MODERN", //skin can be STANDARD, RETRO or MODERN
  // backgroundImg: "NONE", //background can be "NONE" or a URL.  
  // Radio Configuration

  stations: [
    { freq: 88.5, url: "/sounds/radio1.wav" },
    { freq: 100, url: "/sounds/radio2.wav" },
  ],
  range: { min: 87.0, max: 108.0 },
  step: 0.1,
  tolerance: 0.3, // Frequency match tolerance


  escappClientSettings: {
    endpoint: "https://escapp.es/api/escapeRooms/id",
    linkedPuzzleIds: [1],
    rtc: false,
  },
};
