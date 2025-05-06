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

type Region = "topbar" | "simulator" | "toolbox" | "workspace" | "bottombar"

const shortcutToRegion: Record<string, Region> = {
    "1": "topbar",
    "2": "simulator",
    "3": "toolbox",
    "4": "workspace",
    "5": "bottombar"
}

const regionToShortcut = Object.entries(shortcutToRegion).reduce((acc, entry) => {
    const [shortcut, region] = entry;
    acc[region] = shortcut;
    return acc;
  }, {} as Record<Region, string>);

export const NavigateRegionsOverlay = ({ parent, onClose }: NavigateRegionsOverlayProps) => {
    const getRects = () => ({
        simulator: (
            !!document.querySelector(".miniSim")
                ? document.querySelector(".simPanel")
                : document.querySelector("#editorSidebar")
            ).getBoundingClientRect(),
        toolbox: document.querySelector(".blocklyToolbox").getBoundingClientRect(),
        workspace: document.querySelector(".blocklySvg").getBoundingClientRect(),
        topbar: document.querySelector("#mainmenu").getBoundingClientRect(),
        bottombar: document.querySelector("#editortools").getBoundingClientRect(),
    })
    const [regionRects, setRegionRects] = useState(getRects())

    const focusRegion = useCallback((region: Region) => {
        switch (region) {
            case "topbar": {
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
            case "bottombar": {
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

    return ReactDOM.createPortal(<FocusTrap dontRestoreFocus onEscape={onClose}>
        <div className="navigate-regions-container">
            <RegionButton
                title={regionToShortcut["topbar"]}
                bounds={regionRects.topbar}
                onClick={() => focusRegion("topbar")}
                ariaLabel={lf("Main menu")}
            />
            <RegionButton
                className={!!document.querySelector(".miniSim") && "mini-sim-region"}
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
                title={regionToShortcut["bottombar"]}
                bounds={regionRects.bottombar}
                onClick={() => focusRegion("bottombar")}
                ariaLabel={lf("Project menu")}
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
