/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly";
import { shouldDuplicateOnDrag, updateDuplicateOnDragState } from "./duplicateOnDrag";

interface DragStrategyInternals {
  block: Blockly.BlockSvg;
  startParentConn: Blockly.Connection | null;
  startChildConn: Blockly.Connection | null;
  storeInitialConnections(healStack: boolean): void;
}

// @ts-expect-error overriding private method
export class DuplicateOnDragStrategy extends Blockly.dragging.BlockDragStrategy {
  private disconnectBlock(healStack: boolean) {
    const self = this as unknown as DragStrategyInternals;

    let clone: Blockly.Block;
    let target: Blockly.Connection;
    let xml: Element;
    const isShadow = self.block.isShadow();

    if (isShadow) {
        self.block.setShadow(false);
    }

    if (shouldDuplicateOnDrag(self.block)) {
        const output = self.block.outputConnection;

        if (!output?.targetConnection) return;

        xml = Blockly.Xml.blockToDom(self.block, true) as Element;

        if (!isShadow) {
            clone = Blockly.Xml.domToBlock(xml, self.block.workspace);
        }
        target = output.targetConnection;
    }

    self.startParentConn =
        self.block.outputConnection?.targetConnection ??
        self.block.previousConnection?.targetConnection;
    if (healStack) {
        self.startChildConn = self.block.nextConnection?.targetConnection;
    }

    if (target && isShadow) {
        target.setShadowDom(xml)
    }
    self.storeInitialConnections(healStack);
    self.block.unplug(healStack);
    Blockly.blockAnimations.disconnectUiEffect(self.block);
    updateDuplicateOnDragState(self.block);

    if (target && clone) {
        target.connect(clone.outputConnection);
    }
  }
}

export function setDuplicateOnDragStrategy(block: Blockly.Block | Blockly.BlockSvg) {
    (block as Blockly.BlockSvg).setDragStrategy?.(new DuplicateOnDragStrategy(block as Blockly.BlockSvg));
}