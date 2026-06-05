import * as Blockly from "blockly";

/**
 * Override of BlockNavigationPolicy that exposes the expand button on
 * collapsed blocks as a navigable child. Blockly's default treats collapsed
 * blocks as leaves, leaving the expand icon unreachable by keyboard.
 */
export class PxtBlockNavigationPolicy extends Blockly.BlockNavigationPolicy {
    override getFirstChild(block: Blockly.BlockSvg): Blockly.IFocusableNode | null {
        if (block.isCollapsed()) {
            const input = block.getInput(Blockly.constants.COLLAPSED_INPUT_NAME);
            if (!input) return null;
            for (const field of input.fieldRow) {
                if (field.isClickable() || field.isCurrentlyEditable()) {
                    return field;
                }
            }
            return null;
        }
        return super.getFirstChild(block);
    }
}

/**
 * Override of FieldNavigationPolicy that puts fields on the collapsed-block
 * input on the same row as the block, so the expand button is reachable via
 * IN (right) rather than NEXT (down).
 */
export class PxtFieldNavigationPolicy extends Blockly.FieldNavigationPolicy {
    override getRowId(current: Blockly.Field<any>): string {
        const block = current.getSourceBlock();
        const input = current.getParentInput();
        if (block?.isCollapsed() && input?.name === Blockly.constants.COLLAPSED_INPUT_NAME) {
            return (block as Blockly.BlockSvg).getRowId();
        }
        return super.getRowId(current);
    }
}

export class PxtNavigator extends Blockly.Navigator {
    constructor() {
        super();
        // Prepend so isApplicable() picks our policies before the built-in ones.
        this.rules.unshift(new PxtBlockNavigationPolicy());
        this.rules.unshift(new PxtFieldNavigationPolicy());
    }
}
