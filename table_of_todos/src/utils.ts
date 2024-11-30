const uslug = require('@joplin/fork-uslug');

// From https://stackoverflow.com/a/6234804/561309
function escapeHtml(unsafe:string) {
    if (unsafe != null) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    return unsafe;
}

function noteHeaders(noteBody:string) {
    const headers = [];
    const lines = noteBody.split('\n');
    for (const line of lines) {
        const match = line.match(/^(#+)\s(.*)*/);
        if (!match) continue;
        headers.push({
            level: match[1].length,
            text: match[2],
        });
    }
    return headers;
}

function headerSlug(headerText:string) {
    const slugs: any = {};
    const s = uslug(headerText);
    let num = slugs[s] ? slugs[s] : 1;
    const output = [s];
    if (num > 1) output.push(num);
    slugs[s] = num + 1;
    return output.join('-');
}

export function generateTotMd(note) {
    let mdString = ""
    const headers = noteHeaders(note.body);
    if(headers.length == 0) return -1;
    for (const header of headers) {
        // Skips smaller headers since Joplin does not render their checkboxes
        if(header.level > 4) continue;
        const slug = headerSlug(header.text);
        for (let i = 0; i < header.level - 1; i++) {
            mdString += "\t"
        }
        mdString += `- [ ] [${escapeHtml(header.text)}](:/${note.id}#${escapeHtml(slug)})\n`;
    }
    return mdString;
}