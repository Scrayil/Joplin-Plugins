import joplin from 'api';
import {generateTotMd} from './utils';


// Function to update the existing TOT note
async function updateTotNote(currNote, currTotBody, newTotBody, totNoteId) {
    console.debug(`Updating note ${currNote.title}'s tot content...`)
    for(const line of currTotBody.split('\n')) {
        if(line.indexOf("[x]") > -1) {
            const match = line.substring(line.indexOf("]")).match(/\[(.*?)\]/)
            newTotBody = newTotBody.replace("- [ ] [" + match[1], "- [x] [" + match[1]);
        }
    }
    await joplin.data.put(['notes', totNoteId], null, { body: newTotBody });
}

// Function used to create a new TOT note
async function createTotNote(currNote, totBody, totNoteTitle) {
    console.debug(`Creating note ${currNote.title}'s tot...`)
    const newNote = await joplin.data.post(['notes'], null, { is_todo: 1, body: totBody, title: totNoteTitle, parent_id: currNote.parent_id });
    return newNote.id;
}

// Main TOT notes core used to detect the current state and act based on it.
// This can either generate a new TOT or update the existing one
export async function manageTotNote(isNoteChange: boolean) {
    console.debug(`Managing the selected note's TOT...`)
    const currNote = await joplin.workspace.selectedNote();
    const allNotes = await joplin.data.get(['folders', currNote.parent_id, 'notes'], {fields: ['id', 'title', 'body']})
    let totExistsAlready = false

    const totNoteTitle = currNote.title + " [tot]"
    let totNoteId = ""
    let currTotBody = ""
    for (const note of allNotes.items) {
        if(note.title === totNoteTitle) {
            totExistsAlready = true
            totNoteId = note.id;
            currTotBody = note.body;
            break;
        }
    }

    const newTotBody = generateTotMd(currNote);
    if(newTotBody == -1) {
        if(!isNoteChange) {
            await joplin.views.dialogs.showMessageBox("This note contains no headings!")
        }
        return ""
    }
    // Creates the note only if the function has been explicitly called (not during notes' updates)
    if(!totExistsAlready && !isNoteChange) {
        totNoteId = await createTotNote(currNote, newTotBody, totNoteTitle)
    // Updates the notes only if it exists
    } else if(totExistsAlready) {
        await updateTotNote(currNote, currTotBody, newTotBody, totNoteId)
    }
    return totNoteId;
}