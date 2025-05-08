import * as React from "react";
import { Button } from "../../../../react-common/components/controls/Button";
import { classList } from "../../../../react-common/components/util";
import { CancellationToken } from "./SoundEffectEditor";
import { soundToCodalSound } from "./soundUtil";

export interface SoundGalleryItem {
    sound: pxt.assets.Sound;
    name: string;
}

export interface SoundGalleryProps {
    onSoundSelected: (newSound: pxt.assets.Sound) => void;
    sounds: SoundGalleryItem[];
    visible: boolean;
    useMixerSynthesizer: boolean;
}

interface SoundGalleryItemProps extends SoundGalleryItem {
    useMixerSynthesizer: boolean;
    onClick: () => void;
    selectReference: (el: HTMLDivElement) => void;
    playReference: (el: HTMLButtonElement) => void;
    previewKeyDown: (evt: React.KeyboardEvent<HTMLElement>) => void;
    selectKeyDown: (evt: React.KeyboardEvent<HTMLElement>) => void;
}

export const SoundGallery = (props: SoundGalleryProps) => {
    const { sounds, onSoundSelected, visible, useMixerSynthesizer } = props;

    const selectItemRefs = React.useRef<Record<string,HTMLElement>[]>([{},{}]);
    const selectedCoord = React.useRef<{row: number, col: "select" | "preview"}>({row: 0, col: "select"});

    const selectNav = (
        prev: number,
        next: number,
        current: number,
        event: React.KeyboardEvent<HTMLElement>) => {
        switch(event.code) {
            case "ArrowDown":
                selectedCoord.current.row = next;
                selectItemRefs.current[0][next].focus();
                event.preventDefault();
                break;
            case "ArrowUp":
                selectedCoord.current.row = prev;
                selectItemRefs.current[0][prev].focus();
                event.preventDefault();
                break;
            case "ArrowLeft":
                selectedCoord.current.col = "select";
                selectItemRefs.current[0][current].focus();
                event.preventDefault();
                break;
            case "ArrowRight":
                selectedCoord.current.col = "preview";
                selectItemRefs.current[1][current].focus();
                event.preventDefault();
                break;
            case "Space":
            case "Enter":
                if (selectedCoord.current.col === "select") {
                    selectItemRefs.current[0][current].click();
                    event.stopPropagation();
                    event.preventDefault();
                }
                break;
            case "Home":
                selectedCoord.current = {col: "select", row: 0};
                selectItemRefs.current[0][0].focus();
                event.stopPropagation();
                event.preventDefault();
                break;
            case "End":
                selectedCoord.current = {col: "preview", row: sounds.length - 1};
                selectItemRefs.current[1][sounds.length-1].focus();
                event.stopPropagation();
                event.preventDefault();
                break;
            default:
        }
    }

    return <div className={classList("sound-gallery", visible && "visible")} aria-hidden={!visible}>
        <div className="sound-gallery-scroller"
            tabIndex={0}
            onFocus={() => {
                selectItemRefs.current[selectedCoord.current.col === "select" ? 0 : 1][selectedCoord.current.row].focus();
            }}>
            {sounds.map((item, index) => {
                    const prev = Math.max(index - 1, 0);
                    const next = Math.min(index + 1, sounds.length-1);
                    return(<div
                        key={index}
                        onClick={() => onSoundSelected(item.sound)}
                        className="common-button">

                        <SoundGalleryEntry
                            {...item}
                            useMixerSynthesizer={useMixerSynthesizer}
                            onClick={() => onSoundSelected(item.sound)}

                            playReference={ref => selectItemRefs.current[1][index] = ref}
                            selectReference={ref => selectItemRefs.current[0][index] = ref}

                            previewKeyDown={evt => selectNav(prev, next, index, evt)}
                            selectKeyDown={evt => selectNav(prev, next, index, evt)}
                        />
                    </div>);
                })
            }
        </div>
    </div>
}

const SoundGalleryEntry = (props: SoundGalleryItemProps) => {
    const {
        sound,
        name,
        onClick,
        useMixerSynthesizer,
        playReference,
        selectReference,
        previewKeyDown,
        selectKeyDown
    } = props;
    const width = 160;
    const height = 40;

    const [ cancelToken, setCancelToken ] = React.useState<CancellationToken>(null);

    const handlePlayButtonClick = async () => {
        if (cancelToken) {
            cancelToken.cancelled = true
            setCancelToken(null);
            return;
        }
        const newToken = {
            cancelled: false
        }
        setCancelToken(newToken);

        if (useMixerSynthesizer) {
            await pxsim.AudioContextManager.playInstructionsAsync(pxt.assets.soundToInstructionBuffer(sound, 20, 1));
        }
        else {
            await pxsim.codal.music.playSoundExpressionAsync(soundToCodalSound(sound).src);
        }

        setCancelToken(null);
    }

    return <div className="sound-gallery-item-label">
        <div className="sound-gallery-item-label-inner"
            tabIndex={-1}
            ref={selectReference}
            onClick={onClick}
            onKeyDown={selectKeyDown}
            title={name}
            role="button">
            <div className="sound-effect-name">
                {name}
            </div>
            <div className="sound-gallery-preview">
                <svg viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
                    <path
                        className="sound-gallery-preview-wave"
                        d={pxt.assets.renderSoundPath(sound, width, height)}
                        strokeWidth="2"
                        fill="none"/>
                </svg>
            </div>
        </div>
        <Button
            className="sound-effect-play-button"
            buttonRef={playReference}
            tabIndex={-1}
            title={cancelToken ? lf("Stop Sound Preview") : lf("Preview Sound")}
            onClick={handlePlayButtonClick}
            onKeydown={previewKeyDown}
            leftIcon={cancelToken ? "fas fa-stop" : "fas fa-play"}
            />
    </div>
}


