import * as React from "react";
import { classList, ContainerProps, fireClickOnEnter } from "../util";

export interface CardProps extends ContainerProps {
    onClick?: () => void;
    tabIndex?: number;
    ariaLabelledBy?: string;
    label?: string;
    labelClass?: string;
}

export const Card = (props: CardProps) => {
    const {
        id,
        className,
        role,
        children,
        ariaDescribedBy,
        ariaLabelledBy,
        ariaHidden,
        ariaLabel,
        onClick,
        label,
        labelClass,
        tabIndex
    } = props;

    const lastFocusedRef = React.useRef<HTMLElement | null>(null);

    const handleLinkOrTriggerClick = (e: React.MouseEvent | React.KeyboardEvent) => {
        if (e.target && (e.target as HTMLElement).tagName == "A") {
            console.log('Another debug line for this A tag')
            return;
        }
        if ((e.target as HTMLElement).closest?.('a')) {
            console.log("a better way with screen readers?")
            return;
        }
        if (document.activeElement?.tagName === 'A') {
            console.log("active element alternative approach")
            return;
        }
        if (lastFocusedRef.current?.tagName === 'A') {
            console.log("the ref alternative approach")
        return;
    }
        e.preventDefault();
        onClick();
    }

    const handleClick = (e: React.MouseEvent) => {
        handleLinkOrTriggerClick(e);
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const charCode = (typeof e.which == "number") ? e.which : e.keyCode;
        if (charCode === /*enter*/13 || charCode === /*space*/32) {
            handleLinkOrTriggerClick(e);
        }
    }

    return <div
        id={id}
        className={classList("common-card", className)}
        role={role || (onClick ? "button" : undefined)}
        aria-describedby={ariaDescribedBy}
        aria-labelledby={ariaLabelledBy}
        aria-hidden={ariaHidden}
        aria-label={ariaLabel}
        onFocus={(e) => { lastFocusedRef.current = e.target as HTMLElement; }}
        onBlur={() => { lastFocusedRef.current = null; }}   
        onClick={handleClick}
        tabIndex={tabIndex}
        onKeyDown={handleKeyDown}>
            <div className="common-card-body">
                {children}
            </div>
            {label &&
                <label className={classList("common-card-label", labelClass)}>
                    {label}
                </label>
            }
    </div>
}