/// <reference path="../../built/pxtlib.d.ts" />

import * as Blockly from "blockly";
import { FieldImageDropdown, FieldImageDropdownOptions } from "./field_imagedropdown";
import { FieldCustom } from "./field_utils";

export interface FieldImagesOptions extends FieldImageDropdownOptions {
    sort?: boolean;
    addLabel?: string;
}

export class FieldImages extends FieldImageDropdown implements FieldCustom {
    public isFieldCustom_ = true;

    protected addLabel_: boolean;

    constructor(text: string, options: FieldImagesOptions, validator?: Function) {
        if (options.sort) {
            options.data.sort()
        }
        super(text, {...options, columns: "4"}, validator);

        this.addLabel_ = !!options.addLabel;
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

        contentDiv.querySelectorAll("img").forEach(el => {
            el.removeAttribute("height")
            el.removeAttribute("width")
        });

        Array.from(contentDiv.children).forEach((el, i) => {
            const content = (options[i] as any)[0]; // Human-readable text or image.
            const value = (options[i] as any)[1]; // Language-neutral value.
            const div = el as HTMLDivElement;
            div.classList.add("blocklyDropDownButton", "blocklyDropDownImage")

            // We need to find where this occurs and handle it.
            // if (content.type == 'placeholder') {
            //     let placeholder = document.createElement('span');
            //     placeholder.setAttribute('class', 'blocklyDropDownPlaceholder');
            //     placeholder.style.width = content.width + 'px';
            //     placeholder.style.height = content.height + 'px';
            //     contentDiv.appendChild(placeholder);
            //     continue;
            // }

            if ((this as any).columns_) {
                div.style.width = (((this as any).width_ / (this as any).columns_) - 8) + 'px';
                div.style.height = "unset";
            } else {
                div.style.width = content.width + 'px';
                div.style.height = content.height + 'px';
            }

            if (this.addLabel_) {
                const buttonText = this.createTextNode_(content.alt);
                buttonText.setAttribute('data-value', value);
                // Append to blocklyMenuItemContent div.
                div.children[0].appendChild(buttonText);
            }
        })
    }

    protected createTextNode_(text: string) {
        const textSpan = document.createElement('span');
        textSpan.setAttribute('class', 'blocklyDropdownTextLabel');
        textSpan.textContent = text;
        return textSpan;
    }
}

Blockly.Css.register(`
.blocklyDropDownImage > div {
    flex-direction: column;
    gap: 4px;
    padding: 5px 0;
}

.blocklyDropDownButton.blocklyDropDownImage img {
    width: 80%;
    height: unset;
}

.blocklyDropDownImage .blocklyDropdownTextLabel {
    font-family: sans-serif;
    line-height: 1.15;
    text-align: center;
}
`)