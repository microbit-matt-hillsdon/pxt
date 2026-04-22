import { RefObject, useEffect } from "react";

// Sets `inert` and `aria-hidden` on siblings of the given ref so background
// UI can't steal focus or be read by assistive tech while the modal is open.
// `siblingRef` must point at the element being portaled (typically a FocusTrap).
export function useInertSiblings(
    siblingRef: RefObject<HTMLElement>,
    root: Element,
    enabled: boolean = true
) {
    useEffect(() => {
        if (!enabled) return undefined;
        const siblingEl = siblingRef.current;
        if (!siblingEl) return undefined;

        const modified: Array<{
            el: HTMLElement;
            hadAriaHidden: boolean;
            hadInert: boolean;
        }> = [];

        for (const child of Array.from(root.children)) {
            if (child === siblingEl) continue;
            const el = child as HTMLElement;
            const hadAriaHidden =
                el.hasAttribute("aria-hidden") &&
                el.getAttribute("aria-hidden") !== "false";
            const hadInert = el.hasAttribute("inert");
            if (!hadAriaHidden) el.setAttribute("aria-hidden", "true");
            if (!hadInert) el.setAttribute("inert", "");
            if (!hadAriaHidden || !hadInert) {
                modified.push({ el, hadAriaHidden, hadInert });
            }
        }

        return () => {
            for (const { el, hadAriaHidden, hadInert } of modified) {
                if (!hadAriaHidden) el.removeAttribute("aria-hidden");
                if (!hadInert) el.removeAttribute("inert");
            }
        };
    }, [siblingRef, root, enabled]);
}
