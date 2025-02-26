import * as Blockly from "blockly";

export class VerticalFlyout implements Blockly.IFlyout {
    horizontalLayout = false;
    RTL: boolean;
    targetWorkspace: Blockly.WorkspaceSvg;
    MARGIN: number;
    autoClose = true;
    CORNER_RADIUS: number;

    protected activeFlyout: CachedFlyout

    constructor(protected options: Blockly.Options) {
        this.activeFlyout = new CachedFlyout(this.options)
        this.activeFlyout.autoClose = this.autoClose;
    }

    createDom(tagName: string | Blockly.utils.Svg<SVGSVGElement> | Blockly.utils.Svg<SVGGElement>): SVGElement {
        return this.activeFlyout.createDom(tagName);
    }

    init(targetWorkspace: Blockly.WorkspaceSvg): void {
        this.targetWorkspace = targetWorkspace;
        this.activeFlyout.init(this.targetWorkspace);
    }

    dispose(): void {
        this.activeFlyout.dispose();
    }

    getWidth(): number {
        return this.activeFlyout.getWidth();
    }

    getHeight(): number {
        return this.activeFlyout.getHeight();
    }

    getWorkspace(): Blockly.WorkspaceSvg {
        return this.activeFlyout.getWorkspace();
    }

    isVisible(): boolean {
        return this.activeFlyout.isVisible();
    }

    setVisible(visible: boolean): void {
        this.activeFlyout.setVisible(visible);
    }

    setContainerVisible(visible: boolean): void {
        this.activeFlyout.setContainerVisible(visible);
    }

    hide(): void {
        this.activeFlyout.hide();
    }

    show(flyoutDef: string | Blockly.utils.toolbox.FlyoutDefinition, cacheKey?: string): void {
        this.activeFlyout.show(flyoutDef);
    }

    createBlock(originalBlock: Blockly.BlockSvg): Blockly.BlockSvg {
        return this.activeFlyout.createBlock(originalBlock);
    }

    reflow(): void {
        this.activeFlyout.reflow();
    }

    isScrollable(): boolean {
        return this.activeFlyout.isScrollable();
    }

    getX(): number {
        return this.activeFlyout.getX();
    }

    getY(): number {
        return this.activeFlyout.getY();
    }

    position(): void {
        this.activeFlyout.position();
    }

    isDragTowardWorkspace(currentDragDeltaXY: Blockly.utils.Coordinate): boolean {
        return this.activeFlyout.isDragTowardWorkspace(currentDragDeltaXY);
    }

    isBlockCreatable(block: Blockly.BlockSvg): boolean {
        return this.activeFlyout.isBlockCreatable(block);
    }

    scrollToStart(): void {
        this.activeFlyout.scrollToStart();
    }

    getContents() {
        return this.activeFlyout.getContents();
    }

    protected blocksToString(xmlList: Element[]): string {
        let xmlSerializer: XMLSerializer = null;
        const serialize = (e: Element) => {
            if (!e)
                return "<!-- invalid block here! -->"
            if (e.outerHTML)
                return e.outerHTML
            // The below code is only needed for IE 11 where outerHTML occassionally returns undefined :/
            if (!xmlSerializer)
                xmlSerializer = new XMLSerializer()
            return xmlSerializer.serializeToString(e);
        }
        return xmlList
            .map(serialize)
            .reduce((p, c) => p + c, "")
    }

    protected hashBlocks(xmlList: Element[]): number {
        if (!Array.isArray(xmlList)) return undefined;
        return pxt.Util.codalHash16(this.blocksToString(xmlList));
    }
}

class CachedFlyout extends Blockly.VerticalFlyout {
    protected def: Element[];
    protected buttonListeners: Blockly.browserEvents.Data[] = [];

    key: string | number;

    constructor(protected options: Blockly.Options) {
        super(options);
    }

    show(flyoutDef: string | Blockly.utils.toolbox.FlyoutDefinition): void {
        if (Array.isArray(flyoutDef)) {
            this.def = (flyoutDef as Element[]).slice();
        }
        super.show(flyoutDef);
    }

    protected blockIsRecyclable_(block: Blockly.BlockSvg) {
        switch (block.type) {
            case "variables_get":
            case "variables_set":
            case "variables_change":
                return false;
        }
        return true;
    }

    // FIXME: Unfortunately, there is no easy way to extend the rendering of
    // labels and buttons in flyouts. This hack lets us make buttons bigger,
    // add icons to flyout headers, add custom css classes to labels, and
    // underline things
    protected initFlyoutButton_(button: Blockly.FlyoutButton, x: number, y: number): void {
        const textMarginX = Blockly.FlyoutButton.TEXT_MARGIN_X;
        const textMarginY = Blockly.FlyoutButton.TEXT_MARGIN_Y;

        if (!button.isLabel()) {
            Blockly.FlyoutButton.TEXT_MARGIN_X = 17.5;
            Blockly.FlyoutButton.TEXT_MARGIN_Y = 14;
        }

        const buttonSvg = button.createDom() as SVGGElement;
        button.moveTo(x, y);
        button.show();
        // Clicking on a flyout button or label is a lot like clicking on the
        // flyout background.
        this.buttonListeners.push(
            Blockly.browserEvents.conditionalBind(
                buttonSvg,
                'pointerdown',
                this,
                this.onButtonMouseDown,
            ),
        );

        this.buttons_.push(button);

        Blockly.FlyoutButton.TEXT_MARGIN_X = textMarginX;
        Blockly.FlyoutButton.TEXT_MARGIN_Y = textMarginY;

        if (!this.def) return;

        // This relies on the layout in the parent class always happening in order from
        // top to bottom, which is unlikely to ever change but still a little iffy
        const def = this.def.find(n => n.getAttribute("text") === button.getButtonText());
        this.def.splice(this.def.indexOf(def), 1);

        if (!def) return;

        if (def.hasAttribute("web-class")) {
            buttonSvg.classList.add(def.getAttribute("web-class"));
        }

        const icon = def.getAttribute("web-icon");
        const iconClass = def.getAttribute("web-icon-class");
        const iconColor = def.getAttribute("web-icon-color");

        if (icon || iconClass) {
            const svgIcon = Blockly.utils.dom.createSvgElement(
                'text',
                {
                    'class': iconClass ? 'blocklyFlyoutLabelIcon ' + iconClass : 'blocklyFlyoutLabelIcon',
                    'x': 0, 'y': 0, 'text-anchor': 'start'
                },
                buttonSvg
            ) as SVGTextElement;
            if (icon) svgIcon.textContent = icon;
            if (iconColor) svgIcon.setAttribute('style', 'fill: ' + iconColor);

            const ws = button.getTargetWorkspace();

            svgIcon.setAttribute('dominant-baseline', 'central');
            svgIcon.setAttribute('dy', '0');
            svgIcon.setAttribute('x', (ws.RTL ? button.width + Blockly.FlyoutButton.TEXT_MARGIN_X : 0) + "");
            svgIcon.setAttribute('y', (button.height / 2 + Blockly.FlyoutButton.TEXT_MARGIN_Y) + "");

            const iconWidth = Blockly.utils.dom.getTextWidth(svgIcon) + 2 * Blockly.FlyoutButton.TEXT_MARGIN_X
            button.width += iconWidth;

            for (let i = 0; i < buttonSvg.children.length; i++) {
                const el = buttonSvg.children.item(i);

                if (el !== svgIcon) {
                    const x = Number(el.getAttribute("x"));
                    el.setAttribute("x", (x + iconWidth) + "")
                }
            }
        }

        const line = def.getAttribute("web-line");
        const lineWidth = def.getAttribute("web-line-width");
        if (line) {
            const svgLine = Blockly.utils.dom.createSvgElement(
                'line',
                {
                    'class': 'blocklyFlyoutLine', 'stroke-dasharray': line,
                    'text-anchor': 'middle'
                },
                buttonSvg
            );
            svgLine.setAttribute('x1', "0");
            svgLine.setAttribute('x2', lineWidth != null ? lineWidth : button.width + "");
            svgLine.setAttribute('y1', (button.height + 10) + "");
            svgLine.setAttribute('y2', (button.height + 10) + "");
        }
    }

    protected onButtonMouseDown(e: PointerEvent) {
        const gesture = this.targetWorkspace.getGesture(e);
        if (gesture) {
            gesture.handleFlyoutStart(e, this);
        }
    }
}