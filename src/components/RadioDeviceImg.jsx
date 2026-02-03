import { useState, useRef } from 'react';
import '../assets/scss/RadioDeviceImg.scss';
import { THEMES } from '../constants/constants';
import RotaryKnob from './RotaryKnob';

export default function RadioDeviceImg({
    config,
    frequency,
    setFrequency,
    volume,
    setVolume,
    minFreq,
    maxFreq,
    step
}) {
    const [showVolume, setShowVolume] = useState(false);

    const panel = {
        top: config.displayPanel.top,
        left: config.displayPanel.left,
        width: config.displayPanel.width,
        height: config.displayPanel.height,
    };
    const buttons = {
        bottom: config.buttons.bottom,
        left: config.buttons.left,
        width: config.buttons.width,
        height: config.buttons.height,
    };

    const volumeTimeoutRef = useRef(null);

    const setVolumeHandler = (val) => {
        setShowVolume(true);
        setVolume(val);

        if (volumeTimeoutRef.current) {
            clearTimeout(volumeTimeoutRef.current);
        }

        volumeTimeoutRef.current = setTimeout(() => {
            setShowVolume(false);
        }, 1000);
    };

    const calculateNeedlePosition = () => {
        const pct = ((frequency - minFreq) / (maxFreq - minFreq)) * 100;
        return Math.min(Math.max(pct, 0), 100);
    };

    const modernPanel = <div className="lcd-display">
        {showVolume ? <>
            Vol: {(volume * 100).toFixed(0)}
        </> : <>
            {frequency.toFixed(1)} <span className="mhz">MHz</span>
        </>}
    </div>

    const retroPanel = <div className="scale-container">
        <div className="needle" style={{ left: `${calculateNeedlePosition()}%` }}></div>
    </div>

    return (
        <div className="radio-device" style={{ backgroundImage: `url(${config.radioImg})` }}>
            <div className="radio-top" >
                <div className="display-panel" style={panel}>
                    {config.skin === THEMES.MODERN ? modernPanel : retroPanel}
                </div>
            </div>

            <div className="radio-controls" style={buttons}>
                <div className="control-group" style={{ height: "100%" }}>
                    <RotaryKnob
                        image={config.buttonImg}
                        value={volume}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(val) => setVolumeHandler(val)}
                    />
                </div>
                <div className="control-group" style={{ height: "100%" }}>
                    <RotaryKnob
                        image={config.buttonImg}
                        value={frequency}
                        min={minFreq}
                        max={maxFreq}
                        step={step}
                        onChange={(val) => setFrequency(val)}
                    />
                </div>
            </div>
        </div>
    );
}
