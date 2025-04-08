import * as React from "react";

const KeyboardNavHelp = () => {
    const ref = React.useRef<HTMLElement>(null);
    React.useEffect(() => {
        ref.current?.focus()
    }, []);
    const cmd = pxt.BrowserUtils.isMac() ? "⌘" : "Ctrl+";
    const optionOrCtrl = pxt.BrowserUtils.isMac() ? "⌥" : "Ctrl+"
    return (
        <aside id="keyboardnavhelp" aria-label={lf("Keyboard shortcuts")} ref={ref} tabIndex={0}>
            <h2>Keyboard Controls</h2>
            <h3>Common Actions</h3>
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
                            <span className="hint">Use left and right arrows to move along a block.</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Toolbox or insert</td>
                        <td>
                            <Shortcut value={["t"]} />{" or "}
                            <Shortcut value={["i"]} />
                        </td>
                    </tr>
                    <tr>
                        <td>Edit or confirm</td>
                        <td>
                            <Shortcut value={["Enter"]} />{" or "}
                            <Shortcut value={["Space"]} />
                        </td>
                    </tr>
                    <tr>
                        <td>Move mode<br /><span className="hint">Selected block only</span></td>
                        <td>
                            <Shortcut value={["m"]} />{" then "}
                            <br /><span className="hint">Move with arrow keys</span>
                            <br /><span className="hint">Hold {optionOrCtrl} for free movement</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Move mode<br /><span className="hint">Includes following blocks</span></td>
                        <td>
                            <Shortcut value={["M"]} />
                        </td>
                    </tr>
                </tbody>
            </table>
            <h3>Editor Overview</h3>
            <table>
                <tbody>
                    <tr>
                        <td width="50%">More</td>
                        <td width="50%">
                            <Shortcut value={["Here"]} />
                        </td>
                    </tr>
                </tbody>
            </table>
            <h3>Edit Blocks</h3>
            <table>
                <tbody>
                    <tr>
                        <td width="50%">More</td>
                        <td width="50%">
                            <Shortcut value={["Here"]} />
                        </td>
                    </tr>
                </tbody>
            </table>
            <h3>Moving Blocks</h3>
            <table>
                <tbody>
                    <tr>
                        <td width="50%">More</td>
                        <td width="50%">
                            <Shortcut value={["Here"]} />
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