namespace pxtmelody {
    export class MelodyGallery {
        protected contentDiv: HTMLDivElement;
        protected containerDiv: HTMLDivElement;

        protected itemBorderColor: string;
        protected itemBackgroundColor: string;

        protected value: string = null;

        protected visible = false;
        protected pending: (res: string) => void;

        protected playIcons: HTMLElement[];
        protected selectionButtons: HTMLElement[];
        protected previewButtons: HTMLElement[];

        private timeouts: number[] = []; // keep track of timeout
        private numSamples: number = pxtmelody.SampleMelodies.length;

        constructor() {
            this.containerDiv = document.createElement("div");
            this.containerDiv.setAttribute("id", "melody-editor-gallery-outer");
            this.contentDiv = document.createElement("div");
            this.contentDiv.setAttribute("id", "melody-editor-gallery");

            this.itemBackgroundColor = "#DCDCDC";
            this.itemBorderColor = "white";

            this.initStyles();
            this.containerDiv.appendChild(this.contentDiv);

            this.containerDiv.style.display = "none";
            this.contentDiv.addEventListener("animationend", () => {
                if (!this.visible) {
                    this.containerDiv.style.display = "none";
                }
            });

            this.contentDiv.addEventListener('wheel', e => {
                e.stopPropagation();
            }, true)
        }

        getElement() {
            return this.containerDiv;
        }

        getValue() {
            return this.value;
        }

        show(notes: (res: string) => void) {
            this.pending = notes;
            this.containerDiv.style.display = "block";
            this.buildDom();
            this.visible = true;
            pxt.BrowserUtils.removeClass(this.contentDiv, "hidden-above");
            pxt.BrowserUtils.addClass(this.contentDiv, "shown");
        }

        hide() {
            this.visible = false;
            pxt.BrowserUtils.removeClass(this.contentDiv, "shown");
            pxt.BrowserUtils.addClass(this.contentDiv, "hidden-above");
            this.value = null;
            this.stopMelody();
        }

        clearDomReferences() {
            this.contentDiv = null;
            this.containerDiv = null;
        }

        layout(left: number, top: number, height: number) {
            this.containerDiv.style.left = left + "px";
            this.containerDiv.style.top = top + "px";
            this.containerDiv.style.height = height + "px";
        }

        getLastTabStop() {
            return this.previewButtons[this.previewButtons.length-1];
        }

        protected buildDom() {
            while (this.contentDiv.firstChild) this.contentDiv.removeChild(this.contentDiv.firstChild);
            const buttonWidth = "255px";
            const buttonHeight = "45px";
            const samples = pxtmelody.SampleMelodies;

            this.playIcons = [];
            this.selectionButtons = [];
            this.previewButtons = [];
            for (let i = 0; i < samples.length; i++) {
                this.mkButton(samples[i], i, buttonWidth, buttonHeight);
            }
        }

        protected initStyles() {
            // Style injected directly because animations are mangled by the less compiler
            const style = document.createElement("style");
            style.textContent = `
            #melody-editor-gallery {
                margin-top: -100%;
            }

            #melody-editor-gallery.hidden-above {
                margin-top: -100%;
                animation: slide-up 0.2s 0s ease;
            }

            #melody-editor-gallery.shown {
                margin-top: 0px;
                animation: slide-down 0.2s 0s ease;
            }

            @keyframes slide-down {
                0% {
                    margin-top: -100%;
                }
                100% {
                    margin-top: 0px;
                }
            }

            @keyframes slide-up {
                0% {
                    margin-top: 0px;
                }
                100% {
                    margin-top: -100%;
                }
            }
            `;
            this.containerDiv.appendChild(style);
        }

        protected mkButton(sample: pxtmelody.MelodyInfo, i: number, width: string, height: string) {
            const outer = mkElement("div", {
                className: "melody-gallery-button melody-editor-card",
                id: `:${i}`,
            });

            const icon = mkElement("i", {
                className: "music icon melody-icon"
            });

            const label = mkElement("div", {
                className: "melody-editor-text"
            });

            label.innerText = sample.name;

            const preview = this.createColorBlock(sample);

            const leftButton = mkElement("div", {
                className: "melody-editor-button left-button",
                title: sample.name,
                role: "menuitem",
                tabIndex: 0,
            }, () => this.handleSelection(sample))

            leftButton.appendChild(icon);
            leftButton.appendChild(label);
            leftButton.appendChild(preview);

            outer.appendChild(leftButton);

            this.selectionButtons[i] = leftButton;
 
            const rightButton = mkElement("div", {
                className: "melody-editor-button right-button",
                role: "button",
                title: lf("Preview {0}", sample.name),
                tabIndex: 0,
            }, () => this.togglePlay(sample, i));

            const playIcon = mkElement("i", {
                className: "play icon"
            });

            this.playIcons[i] = playIcon;

            rightButton.appendChild(playIcon);
            outer.appendChild(rightButton);

            this.previewButtons[i] = rightButton;
              
            leftButton.addEventListener("keydown", (e) => {
                if (["Space", "Enter"].includes(e.code)) {
                    this.handleSelection(sample);
                    e.stopPropagation();
                    e.preventDefault();
                } else if (e.code === "ArrowRight") {
                    rightButton.focus();
                    e.stopPropagation();
                    e.preventDefault();
                } else if (e.code === "ArrowDown") {
                    this.selectionButtons[(i + 1) % this.selectionButtons.length].focus();
                    e.stopPropagation();
                    e.preventDefault();
                } else if (e.code === "ArrowUp") {
                    this.selectionButtons[(i - 1 + this.selectionButtons.length) % this.selectionButtons.length].focus();
                    e.stopPropagation();
                    e.preventDefault();
                }
            });

            rightButton.addEventListener("keydown", (e) => {
                if (["Space", "Enter"].includes(e.code)) {
                    this.previewMelody(sample);
                    e.stopPropagation();
                    e.preventDefault();
                } else if (e.code === "ArrowLeft") {
                    leftButton.focus();
                    e.stopPropagation();
                    e.preventDefault();
                } else if (e.code === "ArrowDown") {
                    this.previewButtons[(i + 1) % this.previewButtons.length].focus();
                    e.stopPropagation();
                    e.preventDefault();
                } else if (e.code === "ArrowUp") {
                    this.previewButtons[(i - 1 + this.previewButtons.length) % this.previewButtons.length].focus();
                    e.stopPropagation();
                    e.preventDefault();
                }
            });

            this.contentDiv.appendChild(outer);
        }

        protected handleSelection(sample: pxtmelody.MelodyInfo) {
            if (this.pending) {
                const notes = this.pending;
                this.pending = undefined;
                notes(sample.notes);
            }
        }

        private playNote(note: string, colNumber: number, tempo: number): void {
            let tone: number = 0;

            switch (note) {
                case "C5": tone = 523; break; // Tenor C
                case "B": tone = 494; break; // Middle B
                case "A": tone = 440; break; // Middle A
                case "G": tone = 392; break; // Middle G
                case "F": tone = 349; break; // Middle F
                case "E": tone = 330; break; // Middle E
                case "D": tone = 294; break; // Middle D
                case "C": tone = 262; break; // Middle C
            }

            // start note
            this.timeouts.push(setTimeout(() => {
                pxt.AudioContextManager.tone(tone);
            }, colNumber * this.getDuration(tempo)));
            // stop note
            this.timeouts.push(setTimeout(() => {
                pxt.AudioContextManager.stop();
            }, (colNumber + 1) * this.getDuration(tempo)));
        }

        // ms to hold note
        private getDuration(tempo: number): number {
            return 60000 / tempo;
        }

        private previewMelody(sample: pxtmelody.MelodyInfo): void {
            // stop playing any other melody
            this.stopMelody();
            let notes = sample.notes.split(" ");
            for (let i = 0; i < notes.length; i++) {
                this.playNote(notes[i], i, sample.tempo);
            }
        }

        private togglePlay(sample: pxtmelody.MelodyInfo, i: number) {
            let button = this.playIcons[i];

            if (pxt.BrowserUtils.containsClass(button, "play icon")) {
                // check for other stop icons and toggle back to play
                this.resetPlayIcons();
                pxt.BrowserUtils.removeClass(button, "play icon");
                pxt.BrowserUtils.addClass(button, "stop icon");
                this.previewMelody(sample);
                // make icon toggle back to play when the melody finishes
                this.timeouts.push(setTimeout(() => {
                    pxt.BrowserUtils.removeClass(button, "stop icon");
                    pxt.BrowserUtils.addClass(button, "play icon");
                }, (sample.notes.split(" ").length) * this.getDuration(sample.tempo)));
            } else {
                pxt.BrowserUtils.removeClass(button, "stop icon");
                pxt.BrowserUtils.addClass(button, "play icon");
                this.stopMelody();
            }
        }

        public stopMelody() {
            while (this.timeouts.length) clearTimeout(this.timeouts.shift());
            pxt.AudioContextManager.stop();
        }

        private resetPlayIcons(): void {
            for (let i = 0; i < this.numSamples; i++) {
                let button = this.playIcons[i];
                if (pxt.BrowserUtils.containsClass(button, "stop icon")) {
                    pxt.BrowserUtils.removeClass(button, "stop icon");
                    pxt.BrowserUtils.addClass(button, "play icon");
                    break;
                }
            }
        }

        // create color representation of melody
        private createColorBlock(sample: pxtmelody.MelodyInfo): HTMLDivElement {
            let colorBlock = document.createElement("div");
            pxt.BrowserUtils.addClass(colorBlock, "melody-color-block");
            let notes = sample.notes.split(" ");
            for (let i = 0; i < notes.length; i++) {
                let className = pxtmelody.getColorClass(pxtmelody.noteToRow(notes[i]));
                let colorDiv = document.createElement("div");
                // create rounded effect on edge divs and fill in color
                if (i == 0) {
                    pxt.BrowserUtils.addClass(colorDiv, "left-edge sliver " + className);
                } else if (i == notes.length - 1) {
                    pxt.BrowserUtils.addClass(colorDiv, "right-edge sliver " + className);
                } else {
                    pxt.BrowserUtils.addClass(colorDiv, "sliver " + className);
                }

                colorBlock.appendChild(colorDiv);
            }
            return colorBlock;
        }
    }


    function mkElement(tag: string, props?: {[index: string]: string | number}, onClick?: () => void): HTMLElement {
        const el = document.createElement(tag);
        return initElement(el, props, onClick);
    }

    function initElement(el: HTMLElement, props?: {[index: string]: string | number}, onClick?: () => void) {
        if (props) {
            for (const key of Object.keys(props)) {
                if (key === "className") el.setAttribute("class", props[key] + "")
                else el.setAttribute(key, props[key] + "");
            }
        }

        if (onClick) {
            el.addEventListener("click", onClick);
        }

        return el;
    }
}