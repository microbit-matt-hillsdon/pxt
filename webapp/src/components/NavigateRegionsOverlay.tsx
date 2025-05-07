import { useCallback, useEffect, useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import { Button, ButtonProps } from "../../../react-common/components/controls/Button";
import { FocusTrap } from "../../../react-common/components/controls/FocusTrap";

import IProjectView = pxt.editor.IProjectView;

interface NavigateRegionsOverlayProps {
    parent: IProjectView;
    onClose: () => void;
}

interface RectBounds {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
}

type Region = "mainmenu" | "simulator" | "toolbox" | "workspace" | "editortools"

const shortcutToRegion: Record<string, Region> = {
    "1": "mainmenu",
    "2": "simulator",
    "3": "toolbox",
    "4": "workspace",
    "5": "editortools"
}

const regionToShortcut = Object.entries(shortcutToRegion).reduce((acc, entry) => {
    const [shortcut, region] = entry;
    acc[region] = shortcut;
    return acc;
  }, {} as Record<Region, string>);

export const NavigateRegionsOverlay = ({ parent, onClose }: NavigateRegionsOverlayProps) => {
    const previouslyFocused = useRef<Element>(document.activeElement);
    const getRects = () => ({
        simulator: (
            !!document.querySelector(".miniSim")
                ? document.querySelector(".simPanel")
                : document.querySelector("#editorSidebar")
            ).getBoundingClientRect(),
        toolbox: document.querySelector(".blocklyToolbox").getBoundingClientRect(),
        workspace: document.querySelector(".blocklySvg").getBoundingClientRect(),
        mainmenu: document.querySelector("#mainmenu").getBoundingClientRect(),
        editortools: document.querySelector("#editortools").getBoundingClientRect(),
    })
    const [regionRects, setRegionRects] = useState(getRects())

    const focusRegion = useCallback((region: Region) => {
        switch (region) {
            case "mainmenu": {
                (document.querySelector(".blocks-menuitem") as HTMLElement).focus();
                onClose();
                return
            }
            case "simulator": {
                // Note that pxtsim.driver.focus() isn't the same as tabbing to the sim.
                (document.querySelector("#boardview") as HTMLElement).focus();
                onClose()
                return
            }
            case "workspace": {
                parent.editor.focusWorkspace();
                onClose();
                return
            }
            case "toolbox": {
                parent.editor.focusToolbox();
                onClose();
                return
            }
            case "editortools": {
                ((!!document.querySelector(".miniSim")
                    ? document.querySelector(".download-button-full")
                    : document.querySelector(".download-button.large")) as HTMLElement).focus();
                onClose();
                return
            }
        }
    }, [])

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            const region = shortcutToRegion[e.key]
            focusRegion(region)
        }
        document.addEventListener("keydown", listener)

        const observer = new ResizeObserver(() => {
            setRegionRects(getRects())
        });

        observer.observe(document.body);

        return () => {
            observer.disconnect()
            document.removeEventListener("keydown", listener)
        }
    }, [])

    const handleEscape = () => {
        if (previouslyFocused.current) {
            (previouslyFocused.current as HTMLElement).focus()
        }
        onClose();
    }

    return ReactDOM.createPortal(<FocusTrap dontRestoreFocus onEscape={handleEscape}>
        <div className="navigate-regions-container">
            <RegionButton
                title={regionToShortcut["mainmenu"]}
                bounds={regionRects.mainmenu}
                onClick={() => focusRegion("mainmenu")}
                ariaLabel={lf("Main menu")}
            />
            <RegionButton
                className="simulator-region"
                title={regionToShortcut["simulator"]}
                bounds={regionRects.simulator}
                onClick={() => focusRegion("simulator")}
                ariaLabel={lf("Simulator")}
            />
            <RegionButton
                title={regionToShortcut["toolbox"]}
                bounds={regionRects.toolbox}
                onClick={() => focusRegion("toolbox")}
                ariaLabel={lf("Toolbox")}
            />
            <RegionButton
                title={regionToShortcut["workspace"]}
                bounds={{
                    right: regionRects.workspace.right,
                    bottom: regionRects.workspace.bottom,
                    top: regionRects.workspace.top,
                    height: regionRects.workspace.height,
                    left: regionRects.toolbox.right,
                    width: regionRects.workspace.width - regionRects.toolbox.width
                }}
                onClick={() => focusRegion("workspace")}
                ariaLabel={lf("Workspace")}
            />
            <RegionButton
                title={regionToShortcut["editortools"]}
                bounds={regionRects.editortools}
                onClick={() => focusRegion("editortools")}
                ariaLabel={lf("Editor toolbar")}
            />
        </div>
    </FocusTrap>, document.getElementById("root") || document.body)
}

interface RegionButtonProps extends ButtonProps {
    bounds: RectBounds
}

const RegionButton = ({bounds, ...props}: RegionButtonProps) => {
    const buttonRef = useRef<HTMLButtonElement>()

    useEffect(() => {
        if (bounds) {
            buttonRef.current.style.top = `${bounds.top}px`;
            buttonRef.current.style.height = `${bounds.height}px`;
            buttonRef.current.style.left = `${bounds.left}px`;
            buttonRef.current.style.width = `${bounds.width}px`;
        }
    }, [bounds])

    return <Button
        buttonRef={(ref) => {buttonRef.current = ref}}
        {...props}
        className={`region-button ${props.className}`}
    >
        <div><p>{props.title}</p></div>
    </Button>
}
