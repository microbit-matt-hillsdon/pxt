export function fireClickOnEnter(e: React.KeyboardEvent<HTMLElement>): void {
    const charCode = (typeof e.which == "number") ? e.which : e.keyCode;
    if (charCode === /*enter*/13 || charCode === /*space*/32) {
        e.preventDefault();
        (e.currentTarget as HTMLElement).click();
    }
}

export function ariaAnnounce(msg: string, assertiveness?: string, role?: string) {
    const el = document.getElementById("aria-announce");
    if (el) {
        el.textContent = msg;
        el.ariaLive = assertiveness ?? "polite";
        el.setAttribute("role", role ?? null);
    }
}