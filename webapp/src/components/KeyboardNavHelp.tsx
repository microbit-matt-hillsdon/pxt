import * as React from "react";
import { getActionShortcut, SHORTCUT_NAMES } from "../shortcut_formatting";

const KeyboardNavHelp = () => {
    const ref = React.useRef<HTMLElement>(null);
    React.useEffect(() => {
        ref.current?.focus()
    }, []);
    const cmd = pxt.BrowserUtils.isMac() ? "⌘" : "Ctrl";
    const optionOrCtrl = pxt.BrowserUtils.isMac() ? "⌥" : "Ctrl"
    const contextMenuRow = <Row name="Open context menu" shortcuts={[SHORTCUT_NAMES.MENU]} />
    // TODO: this needs to be reconciled with "Format Code"
    const cleanUpRow = <Row name="Workspace: Clean up" shortcuts={[SHORTCUT_NAMES.CLEAN_UP]} />
    const enterOrSpace = { shortcuts: [["Enter"], ["Space"]], joiner: "or"}
    const editOrConfirmRow = <Row name="Edit or confirm" {...enterOrSpace} />
    return (
        <aside id="keyboardnavhelp" aria-label={lf("Keyboard Controls")} ref={ref} tabIndex={0}>
            <h2>Keyboard Controls</h2>
            <table>
                <tbody>
                    <Row name="Show/hide shortcut help" shortcuts={[SHORTCUT_NAMES.LIST_SHORTCUTS]} />
                    <Row name="Block and toolbox navigation" shortcuts={[SHORTCUT_NAMES.UP, SHORTCUT_NAMES.DOWN, SHORTCUT_NAMES.LEFT, SHORTCUT_NAMES.RIGHT]} />
                    <Row name="Toolbox or insert" shortcuts={[SHORTCUT_NAMES.TOOLBOX, SHORTCUT_NAMES.INSERT]} joiner="or" />
                    {editOrConfirmRow}
                    <Row name="Move mode" shortcuts={[["M"]]} >
                        <br /><span className="hint">Move with arrow keys</span>
                        <br /><span className="hint">Hold {optionOrCtrl} for free movement</span>
                    </Row>
                    <Row name="Copy / paste" shortcuts={[SHORTCUT_NAMES.COPY, SHORTCUT_NAMES.PASTE]} joiner="/" />
                    {cleanUpRow}
                    {contextMenuRow}
                </tbody>
            </table>
            <h3>Editor Overview</h3>
            <table>
                <tbody>
                    <Row name="Move between menus, simulator and the workspace" shortcuts={[["Tab"], ["Shift", "Tab"]]} joiner="row"/>
                    <Row name="Exit" shortcuts={[SHORTCUT_NAMES.EXIT]} />
                    <Row name="Toolbox" shortcuts={[SHORTCUT_NAMES.TOOLBOX]} />
                    <Row name="Toolbox: Move in and out of categories" shortcuts={[SHORTCUT_NAMES.LEFT, SHORTCUT_NAMES.RIGHT]} />
                    <Row name="Toolbox: Navigate categories or blocks" shortcuts={[SHORTCUT_NAMES.UP, SHORTCUT_NAMES.DOWN]} />
                    <Row name="Toolbox: Insert block" {...enterOrSpace} />
                    <Row name="Workspace" shortcuts={[[cmd, "E"]]} />
                    <Row name="Workspace: Select workspace" shortcuts={[["W"]]} />
                    {cleanUpRow}
                    <Row name="Simulator" shortcuts={[[cmd, "B"]]} />
                    <Row name="Download" shortcuts={[[cmd, "D"]]} />
                </tbody>
            </table>
            <h3>Edit Blocks</h3>
            <table>
                <tbody>
                    <Row name="Move in and out of a block" shortcuts={[SHORTCUT_NAMES.LEFT, SHORTCUT_NAMES.RIGHT]} />
                    {editOrConfirmRow}
                    <Row name="Cancel or exit" shortcuts={[SHORTCUT_NAMES.EXIT]} />
                    <Row name="Insert block at current position" shortcuts={[SHORTCUT_NAMES.INSERT]} />
                    <Row name="Copy" shortcuts={[SHORTCUT_NAMES.COPY]} />
                    <Row name="Paste" shortcuts={[SHORTCUT_NAMES.PASTE]} />
                    <Row name="Cut" shortcuts={[SHORTCUT_NAMES.CUT]} />
                    <Row name="Delete" shortcuts={[SHORTCUT_NAMES.DELETE, ["Backspace"]]} joiner="or" />
                    <Row name="Undo" shortcuts={[SHORTCUT_NAMES.UNDO]} />
                    <Row name="Redo" shortcuts={[SHORTCUT_NAMES.REDO]} />
                    {contextMenuRow}
                </tbody>
            </table>
            <h3>Moving Blocks</h3>
            <table>
                <tbody>
                    <Row name="Move mode" shortcuts={[["M"]]} />
                    <Row name="Move mode: Move to new position" shortcuts={[SHORTCUT_NAMES.UP, SHORTCUT_NAMES.DOWN, SHORTCUT_NAMES.LEFT, SHORTCUT_NAMES.RIGHT]} />
                    <Row name="Move mode: Free movement">
                        Hold <Key value={optionOrCtrl} /> and press arrow keys
                    </Row>
                    <Row name="Move mode: Confirm" {...enterOrSpace} />
                    <Row name="Move mode: Cancel" shortcuts={[SHORTCUT_NAMES.EXIT]} />
                    <Row name="Disconnect blocks" shortcuts={[SHORTCUT_NAMES.DISCONNECT]} />
                </tbody>
            </table>
        </aside>
    );
}

const Shortcut = ({ keys }: { keys: string[] }) => {
    const joiner = pxt.BrowserUtils.isMac() ? " " : " + "
    return (
        <span className="shortcut">
            {keys.reduce((acc, key) => {
                return acc.length === 0
                    ? [...acc,  <Key key={key} value={key} />]
                    : [...acc, joiner, <Key key={key} value={key} />]
            }, [])}
        </span>
    );
}

interface RowProps {
    name: string;
    shortcuts?: Array<string | string[]>;
    joiner?: string;
    children?: React.ReactNode;
}

const Row = ({ name, shortcuts = [], joiner, children}: RowProps) => {
    const shortcutElements = shortcuts.map((s, idx) => {
        if (typeof s === "string") {
            // Pull keys from shortcut registry.
            return <Shortcut key={idx} keys={getActionShortcut(s)} />
        } else {
            // Display keys as specified.
            return <Shortcut key={idx} keys={s} />
        }
    })
    return joiner === "row" ? (
        <>
            <tr>
                <td width="50%" rowSpan={shortcuts.length}>{name}</td>
                <td width="50%">
                    {shortcutElements[0]}
                </td>
            </tr>
            {shortcutElements.map((el, idx) => idx === 0
                ? undefined
                : (<tr key={idx}>
                        <td width="50%">
                            {el}
                        </td>
                    </tr>))}
        </>
    ) : (
        <tr>
            <td width="50%">{name}</td>
            <td width="50%">
                {shortcutElements.reduce((acc, shortcut) => {
                    return acc.length === 0
                        ? [...acc,  shortcut]
                        : [...acc, joiner ? ` ${joiner} ` : " ", shortcut]
                }, [])}
                {children}
                <br />
            </td>
        </tr>
    )
}

const Key = ({ value }: { value: string }) => {
    return <span className="key">{value}</span>
}

export default KeyboardNavHelp;