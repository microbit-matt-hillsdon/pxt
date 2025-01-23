/// <reference path="../../built/pxtlib.d.ts" />

import * as Blockly from "blockly";
import { FieldCustom, FieldCustomDropdownOptions, parseColour } from "./field_utils";
import { FieldGridDropdown } from "@blockly/field-grid-dropdown";
import { ImageProperties } from "blockly/core/field_dropdown";

export interface FieldImageDropdownOptions extends FieldCustomDropdownOptions {
    columns?: string;
    maxRows?: string;
    width?: string;
}

export class FieldImageDropdown extends FieldGridDropdown implements FieldCustom {
    public isFieldCustom_ = true;
    // Width in pixels
    protected width_: number;

    // Columns in grid
    protected columns_: number;

    // Number of rows to display (if there are extra rows, the picker will be scrollable)
    protected maxRows_: number;

    protected backgroundColour_: string;
    protected borderColour_: string;

    protected savedPrimary_: string;

    constructor(text: string, options: FieldImageDropdownOptions, validator?: Function) {
        super(options.data, undefined, {columns: parseInt(options.columns)});

        this.columns_ = parseInt(options.columns);
        this.maxRows_ = parseInt(options.maxRows) || 0;
        this.width_ = parseInt(options.width) || 300;

        this.backgroundColour_ = parseColour(options.colour);
        this.borderColour_ = pxt.toolbox.fadeColor(this.backgroundColour_, 0.4, false);
    }

    /**
     * Create a dropdown menu under the text.
     * @private
     */
    public showEditor_() {
        super.showEditor_();

        const dropdownDiv = Blockly.DropDownDiv.getContentDiv() as HTMLElement;
        const contentDiv = dropdownDiv.querySelector("div");
        const options = this.getOptions();
        let maxButtonHeight: number = 0;

        contentDiv.querySelectorAll("img").forEach(el => {
            el.removeAttribute("height")
            el.removeAttribute("width")
        });

        Array.from(contentDiv.children).forEach((el, i) => {
            const content = (options[i] as any)[0]; // Human-readable text or image.
            const div = el as HTMLDivElement;
            div.classList.add("blocklyDropDownButton");

            // We need to find where this occurs and handle it.
            // if (content.type == 'placeholder') {
            //     let placeholder = document.createElement('span');
            //     placeholder.setAttribute('class', 'blocklyDropDownPlaceholder');
            //     placeholder.style.width = content.width + 'px';
            //     placeholder.style.height = content.height + 'px';
            //     contentDiv.appendChild(placeholder);
            //     return;
            // }

            let buttonSize = content.height;
            if (this.columns_) {
                buttonSize = ((this.width_ / this.columns_) - 8);
                div.style.width = buttonSize + 'px';
                div.style.height = buttonSize + 'px';
            } else {
                div.style.width = content.width + 'px';
                div.style.height = content.height + 'px';
            }
            if (buttonSize > maxButtonHeight) {
                maxButtonHeight = buttonSize;
            }
        })

        contentDiv.style.width = this.width_ + 'px';
        if (this.maxRows_) {
            // Limit the number of rows shown, but add a partial next row to indicate scrolling
            dropdownDiv.style.maxHeight = (this.maxRows_ + 0.4) * (maxButtonHeight + 8) + 'px';
        }

        if (pxt.BrowserUtils.isFirefox()) {
            // This is to compensate for the scrollbar that overlays content in Firefox. It
            // gets removed in onHide_()
            dropdownDiv.style.paddingRight = "20px";
        }
    }

    doValueUpdate_(newValue: any): void {
        (this as any).selectedOption_ = undefined;
        super.doValueUpdate_(newValue);
    }

    /**
     * Callback for when a button is clicked inside the drop-down.
     * Should be bound to the FieldIconMenu.
     * @param {Event} e DOM event for the click/touch
     * @private
     */
    protected buttonClick_ = (e: MouseEvent) => {
        let value = (e.target as Element).getAttribute('data-value');
        if (!value) return;
        this.setValue(value);
        Blockly.DropDownDiv.hide();
    };

    /**
     * Callback for when the drop-down is hidden.
     */
    protected onHide_() {
        let content = Blockly.DropDownDiv.getContentDiv() as HTMLElement;
        content.removeAttribute('role');
        content.removeAttribute('aria-haspopup');
        content.removeAttribute('aria-activedescendant');
        content.style.width = '';
        content.style.paddingRight = '';
        content.style.maxHeight = '';

        let source = this.sourceBlock_ as Blockly.BlockSvg;
        if (source?.isShadow()) {
            this.sourceBlock_.setColour(this.savedPrimary_);
        } else if (this.borderRect_) {
            this.borderRect_.setAttribute('fill', this.savedPrimary_);
        }
    };
}

Blockly.Css.register(`
.fieldGridDropDownContainer.blocklyMenu {
    grid-gap: 0px;
    margin: 0px;
}

.blocklyDropDownButton {
    display: inline-block;
    float: left;
    padding: 0 !important;
    margin: 4px;
    border-radius: 4px;
    outline: none;
    border: 1px solid;
    transition: box-shadow .1s;
    cursor: pointer;
}

.blocklyDropDownButton > div {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.blocklyDropDownButton img {
    width: 80%;
    height: 80%;
}
`)