import "./../assets/scss/MainScreen.scss";
import { useState, useRef, useEffect } from "react";
import useSound from "../hooks/useSound";
import { useContext } from "react";
import { GlobalContext } from "./GlobalContext.jsx";

export default function MainScreen({ solvePuzzle, solved, solvedTrigger }) {
  const { I18n, appSettings: config } = useContext(GlobalContext);


  useEffect(() => {
    if (solvedTrigger > 0 && !solved) {

    } else if (solvedTrigger > 0 && solved) {
     
    }
  }, [solvedTrigger, solved]);

  return (
    <div className="mainScreen">

    </div>
  );
}
