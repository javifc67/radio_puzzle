import { useState, useRef, useEffect } from 'react';

export default function RotaryKnob({
    image,
    value,
    min,
    max,
    onChange,
    step,
    size = "100%"
}) {
    const knobRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const normalized = (value - min) / (max - min);
    const rotation = -135 + (normalized * 270);

    const handleStart = (clientX, clientY) => {
        setIsDragging(true);
        updateValueFromPointer(clientX, clientY);
    };

    const handleMove = (clientX, clientY) => {
        if (!isDragging) return;
        updateValueFromPointer(clientX, clientY);
    };

    const handleEnd = () => {
        setIsDragging(false);
    };

    const updateValueFromPointer = (clientX, clientY) => {
        if (!knobRef.current) return;

        const rect = knobRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angleRad = Math.atan2(clientY - centerY, clientX - centerX);
        let angleDeg = angleRad * (180 / Math.PI);
        let clockAngle = angleDeg + 90;

        if (clockAngle > 180) clockAngle -= 360; // Normalize

        let clampedAngle = Math.max(-135, Math.min(135, clockAngle));
        const pct = (clampedAngle + 135) / 270;
        let newValue = min + pct * (max - min);

        if (step) {
            newValue = Math.round(newValue / step) * step;
        }
        newValue = Math.max(min, Math.min(max, newValue));
        if (newValue !== value) {
            onChange(newValue);
        }
    };

    // Mouse events
    const onMouseDown = (e) => {
        handleStart(e.clientX, e.clientY);
    };

    useEffect(() => {
        const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
        const onMouseUp = () => handleEnd();

        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging]);

    // Touch events
    const onTouchStart = (e) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
        // e.preventDefault(); // can block scrolling? ok for knob.
    };

    useEffect(() => {
        const onTouchMove = (e) => {
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        };
        const onTouchEnd = () => handleEnd();

        if (isDragging) {
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onTouchEnd);
        }
        return () => {
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [isDragging]);


    return (
        <div
            ref={knobRef}
            className="rotary-knob"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                touchAction: 'none' // Important for preventing scroll while dragging
            }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            <img
                src={image}
                alt="knob"
                style={{
                    width: '100%',
                    height: '100%',
                    transform: `rotate(${rotation}deg)`,
                    pointerEvents: 'none', // Allow clicks to pass to div
                    userSelect: 'none',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
            />
        </div>
    );
}
