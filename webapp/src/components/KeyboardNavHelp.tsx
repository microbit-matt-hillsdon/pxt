import * as React from "react";

const KeyboardNavHelp = () => {
    const ref = React.useRef<HTMLElement>(null);
    React.useEffect(() => {
        ref.current?.focus()
    }, []);
    const cmd = pxt.BrowserUtils.isMac() ? "⌘" : "Ctrl+";
    const optionOrCtrl = pxt.BrowserUtils.isMac() ? "⌥" : "Ctrl+"
    const enterOrSpace = <><Shortcut value={["Enter"]} /> or <Shortcut value={["Space"]} /></>
    return (
        <aside id="keyboardnavhelp" aria-label={lf("Keyboard Controls")} ref={ref} tabIndex={0}>
            <h2>Keyboard Controls</h2>
            <table>
                <tbody>
                    <tr>
                        <td width="50%">Show/hide shortcut help</td>
                        <td width="50%">
                            <Shortcut value={[cmd, "/"]} />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Block and toolbox navigation
                        </td>
                        <td>
                            <Shortcut value={["↑", "↓", "←", "→"]} /><br />
                        </td>
                    </tr>
                    <tr>
                        <td>Toolbox or insert</td>
                        <td>
                            <Shortcut value={["T"]} />{" or "}
                            <Shortcut value={["I"]} />
                        </td>
                    </tr>
                    <tr>
                        <td>Edit or confirm</td>
                        <td>
                            {enterOrSpace}
                        </td>
                    </tr>
                    <tr>
                        <td>Move mode</td>
                        <td>
                            <Shortcut value={["Shift", "M"]} />
                            <br /><span className="hint">Move with arrow keys</span>
                            <br /><span className="hint">Hold {optionOrCtrl} for free movement</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Copy / paste</td>
                        <td>
                            <Shortcut value={[cmd, "C"]} /> / <Shortcut value={[cmd, "V"]} />
                        </td>
                    </tr>
                </tbody>
            </table>
            <h3>Editor Overview</h3>
            <table>
                <tbody>
                    <tr>
                        <td width="50%" rowSpan={2}>Move between menus, simulator and the workspace</td>
                        <td width="50%">
                            <Shortcut value={["Tab"]} />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">
                            <Shortcut value={["Shift", "Tab"]} />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Exit</td>
                        <td width="50%">
                            <Shortcut value={["Escape"]} />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Toolbox</td>
                        <td width="50%">
                            <Shortcut value={["T"]} />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Toolbox: Move in and out of categories</td>
                        <td width="50%">
                            <Shortcut value={["←", "→"]} /><br />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Toolbox: Navigate categories or blocks</td>
                        <td width="50%">
                            <Shortcut value={["↑", "↓"]} /><br />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Toolbox: Insert block</td>
                        <td width="50%">
                            {enterOrSpace}
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Workspace</td>
                        <td width="50%">
                            <Shortcut value={[cmd, "E"]} /><br />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Workspace: Select workspace</td>
                        <td width="50%">
                            <Shortcut value={["W"]} /><br />
                        </td>
                    </tr>
                    <tr>
                        {/* TODO: this needs to be reconciled with "Format Code" */}
                        <td width="50%">Workspace: Clean up</td>
                        <td width="50%">
                            <Shortcut value={["C"]} /><br />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Simulator</td>
                        <td width="50%">
                            <Shortcut value={[cmd, "B"]} /><br />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Download</td>
                        <td width="50%">
                            <Shortcut value={[cmd, "D"]} /><br />
                        </td>
                    </tr>
                </tbody>
            </table>
            <h3>Edit Blocks</h3>
            <table>
                <tbody>
                    <tr>
                        <td width="50%">Move in and out of a block</td>
                        <td width="50%">
                            <Shortcut value={["←", "→"]} /><br />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Edit or confirm</td>
                        <td width="50%">
                            {enterOrSpace}
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Cancel or exit</td>
                        <td width="50%">
                            <Shortcut value={["Escape"]} />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Insert block at current position</td>
                        <td width="50%">
                            <Shortcut value={["T"]} /> or <Shortcut value={["I"]} />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Copy</td>
                        <td width="50%">
                            <Shortcut value={[cmd, "C"]} />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Paste</td>
                        <td width="50%">
                            <Shortcut value={[cmd, "V"]} />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Cut</td>
                        <td width="50%">
                            <Shortcut value={[cmd, "X"]} />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Delete</td>
                        <td width="50%">
                            <Shortcut value={["Delete"]} /> or <Shortcut value={["Backspace"]} />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Undo</td>
                        <td width="50%">
                            <Shortcut value={[cmd, "Z"]} />
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Redo</td>
                        <td width="50%">
                            { pxt.BrowserUtils.isWindows() ? <Shortcut value={["Ctrl", "Y"]} /> : <Shortcut value={[cmd, "Shift", "Z"]} /> }
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">Open context menu</td>
                        <td width="50%">
                            <Shortcut value={[cmd, "Enter"]} />
                        </td>
                    </tr>
                </tbody>
            </table>
            <h3>Moving Blocks</h3>
            <table>
                <tbody>
                    <tr>
                        <td>Move mode</td>
                        <td>
                            <Shortcut value={["Shift", "M"]} />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Move mode: Move to new position
                        </td>
                        <td>
                            <Shortcut value={["↑", "↓", "←", "→"]} /><br />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Move mode: Free movement
                        </td>
                        <td>
                            Hold <Key value={optionOrCtrl} /> and press arrow keys
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Move mode: Confirm
                        </td>
                        <td>
                            {enterOrSpace}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Move mode: Cancel
                        </td>
                        <td>
                            <Shortcut value={["Escape"]} />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Disconnect blocks
                        </td>
                        <td>
                            <Shortcut value={["X"]} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </aside>
    );
}

const Shortcut = ({ value }: { value: string[] }) => {
    return (
        <span className="shortcut">
            {value.map(v => <Key key={v} value={v} />)}
        </span>
    );
}

const Key = ({ value }: { value: string }) => {
    return <span className="key">{value}</span>
}

export default KeyboardNavHelp;