import * as React from "react";
import { Button } from "../../../../react-common/components/controls/Button";
import { classList, fireClickOnEnter } from "../../../../react-common/components/util";
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
}

export const SoundGallery = (props: SoundGalleryProps) => {
    const { sounds, onSoundSelected, visible, useMixerSynthesizer } = props;

    const soundItemRefs = React.useRef<Record<string,HTMLElement>>({});

    function listNav(
        prev: number,
        next: number,
        event: React.KeyboardEvent<HTMLElement>) {
            if (event.code === "ArrowDown") {
                soundItemRefs.current[next].focus();
                event.preventDefault();
            } else if (event.code === "ArrowUp") {
                soundItemRefs.current[prev].focus();
                event.preventDefault();
            } else {
                fireClickOnEnter(event);
            }
    }

    return <div className={classList("sound-gallery", visible && "visible")} aria-hidden={!visible}>
        <div className="sound-gallery-scroller">
            {sounds.map((item, index) => {
                    const prev = (index + sounds.length - 1) % sounds.length;
                    const next = (index + 1) % sounds.length;
                    return(<div
                        key={index}
                        ref={ref => soundItemRefs.current[index] = ref}
                        className="common-button"
                        title={item.name}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => listNav(prev, next, e)}
                        onClick={() => onSoundSelected(item.sound)}>

                        <SoundGalleryEntry {...item} useMixerSynthesizer={useMixerSynthesizer} />
                    </div>);
                })
            }
        </div>
    </div>
}

const SoundGalleryEntry = (props: SoundGalleryItemProps) => {
    const { sound, name, useMixerSynthesizer } = props;
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
        <Button
            className="sound-effect-play-button"
            title={cancelToken ? lf("Stop Sound Preview") : lf("Preview Sound")}
            onClick={handlePlayButtonClick}
            leftIcon={cancelToken ? "fas fa-stop" : "fas fa-play"}
            />
    </div>
}


