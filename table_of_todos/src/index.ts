import joplin from 'api';
import {MenuItemLocation} from 'api/types';
import {manageTotNote} from "./tot_note";


joplin.plugins.register({
	onStart: async function() {
		// As soon as the current note changes, this updates the related TOT note content
		await joplin.workspace.onNoteChange(async () => {
			await manageTotNote(true);
		});

		// Registers a command that creates the TOT note.
		// This is triggered by the below button's click
		await joplin.commands.register({
			name: 'createTotNote',
			label: 'Create TOT note',
			iconName: 'fas fa-check-square',
			execute: async () => {
				const totNoteId = await manageTotNote(false);
				if(totNoteId.length > 0) {
					await joplin.commands.execute('openNote', totNoteId);
				}
			},
		});

		// Adds also a context menu entry for the note editor, to generate the corresponding TOT
		await joplin.views.menuItems.create('noteEditorContextTotMenu', 'createTotNote', MenuItemLocation.EditorContextMenu, {accelerator: 'Ctrl+Alt+Space'});
		// Adds also a menu entry to generate a TOT note in the main toolbar under "Note"
		await joplin.views.menus.create('toolbarToolsTotMenu', 'TOT (Table Of To-Dos)', [{
			commandName: 'createTotNote',
			accelerator: 'Ctrl+Alt+Space'
		}], MenuItemLocation.Note);
	},
})
.then(_ => console.info("TOT Plugin registered successfully!"))
.catch(err => console.error("Failed to register TOT Plugin:", err));