import * as React from "react";
import * as ReactDOM from "react-dom";
import { classList, ContainerProps } from "../util";
import { Button } from "./Button";
import { FocusTrap } from "./FocusTrap";
import { Link } from "./Link";
import { useInertSiblings } from "../../hooks/useInertSiblings";

export interface ModalAction {
    label: string;
    className?: string;
    disabled?: boolean;
    icon?: string;
    xicon?: boolean;
    leftIcon?: string;
    onClick: () => void;
    url?: string;

    // TODO: It would be nice to make fullscreen modals their own thing and deprecate this prop. right
    // now it's required to render the back arrow
    fullscreen?: boolean;
}

export interface ModalProps extends ContainerProps {
    title: string;
    leftIcon?: string;
    helpUrl?: string
    ariaDescribedBy?: string;
    actions?: ModalAction[];
    onClose?: () => void;
    fullscreen?: boolean;
    parentElement?: Element;
    hideDismissButton?: boolean;
}

export const Modal = (props: ModalProps) => {
    const {
        children,
        id,
        className,
        ariaLabel,
        ariaHidden,
        ariaDescribedBy,
        role,
        title,
        leftIcon,
        helpUrl,
        actions,
        onClose,
        parentElement,
        fullscreen,
        hideDismissButton,
    } = props;

    const closeClickHandler = (e?: React.MouseEvent<HTMLButtonElement>) => {
        if (onClose) onClose();
    }

    const classes = classList(
        "common-modal-container",
        fullscreen && "fullscreen",
        className
    );

    const modalRootRef = React.useRef<HTMLDivElement>(null);
    const portalTarget = parentElement || document.body;
    useInertSiblings(modalRootRef, portalTarget);

    return ReactDOM.createPortal(<div className={classes} ref={modalRootRef}>
        <FocusTrap
            id={id}
            className="common-modal"
            role={role || "dialog"}
            ariaModal={true}
            ariaHidden={ariaHidden}
            ariaLabel={ariaLabel}
            ariaDescribedBy={ariaDescribedBy}
            ariaLabelledby="modal-title"
            onEscape={closeClickHandler}
        >
            <div className="common-modal-header">
                {fullscreen && !hideDismissButton &&
                    <div className="common-modal-back">
                        <Button
                            className="menu-button"
                            onClick={closeClickHandler}
                            title={lf("Go Back")}
                            label={lf("Go Back")}
                            leftIcon="fas fa-arrow-left"
                        />
                    </div>
                }
                <div id="modal-title" className="common-modal-title">
                    {leftIcon && <i className={leftIcon} aria-hidden={true}/>}
                    {title}
                </div>
                {fullscreen && helpUrl &&
                    <div className="common-modal-help">
                        <Link
                            className="common-button menu-button"
                            title={lf("Help on {0} dialog", title)}
                            href={props.helpUrl}
                            target="_blank"
                        >
                            <span className="common-button-flex">
                                <i className="fas fa-question" aria-hidden={true}/>
                            </span>
                        </Link>
                    </div>
                }
                {!fullscreen && !hideDismissButton &&
                    <div className="common-modal-close">
                        <Button
                            className="menu-button"
                            onClick={closeClickHandler}
                            title={lf("Close")}
                            rightIcon="fas fa-times-circle"
                        />
                    </div>
                }
            </div>
            <div className="common-modal-body">
                {children}
            </div>
            {actions?.length &&
                <div className="common-modal-footer">
                    { actions.map((action, index) =>
                        <Button
                            key={index}
                            className={action.className ?? "primary inverted"}
                            disabled={action.disabled}
                            onClick={action.onClick}
                            href={action.url}
                            label={action.label}
                            title={action.label}
                            rightIcon={(action.xicon ? "xicon " : "") + action.icon}
                            leftIcon={action.leftIcon}
                        />
                    )}
                </div>
            }
        </FocusTrap>
    </div>, portalTarget)
}
