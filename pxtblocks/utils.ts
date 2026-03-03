import * as Blockly from "blockly";
import { FieldImageNoText } from "./fields/field_imagenotext";

export const maybeFocusMutatorButton = (field: Blockly.IFocusableNode | undefined): void => {
    const focusManager = Blockly.getFocusManager();
    const currentlyFocusedNode = focusManager.getFocusedNode();
    if (
        field &&
        (currentlyFocusedNode instanceof FieldImageNoText || !currentlyFocusedNode)
    ) {
        focusManager.focusNode(field);
    }
}