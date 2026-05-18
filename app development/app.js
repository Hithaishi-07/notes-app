let notes = JSON.parse(localStorage.getItem('nota_notes')) || [];
let currentNoteId = null;

const notesList = document.getElementById('notes-list');
const editor = document.getElementById('editor');
const emptyState = document.getElementById('empty-state');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const preview = document.getElementById('preview');

function renderNotes(filteredNotes = notes) {
  notesList.innerHTML = '';
  document.getElementById('count').textContent = filteredNotes.length;

  filteredNotes.sort((a, b) => new Date(b.updated) - new Date(a.updated));

  filteredNotes.forEach(note => {
    const div = document.createElement('div');
    div.className = `note-card p-4 rounded-3xl cursor-pointer mx-2 ${currentNoteId === note.id ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`;
    div.innerHTML = `
      <div class="font-medium text-lg line-clamp-1">${note.title || 'Untitled'}</div>
      <div class="text-xs text-zinc-500 mt-1">${new Date(note.updated).toLocaleDateString()}</div>
      <div class="text-sm text-zinc-400 line-clamp-2 mt-2">${note.content.substring(0, 120)}...</div>
    `;
    div.onclick = () => openNote(note.id);
    notesList.appendChild(div);
  });
}

function saveNote() {
  if (!currentNoteId) return;

  const note = notes.find(n => n.id === currentNoteId);
  if (note) {
    note.title = titleInput.value.trim();
    note.content = contentInput.value;
    note.updated = new Date().toISOString();
    localStorage.setItem('nota_notes', JSON.stringify(notes));
    renderNotes();
  }
}

function newNote() {
  const newNote = {
    id: 'note_' + Date.now(),
    title: '',
    content: '',
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };
  notes.unshift(newNote);
  localStorage.setItem('nota_notes', JSON.stringify(notes));
  openNote(newNote.id);
  renderNotes();
}

function openNote(id) {
  currentNoteId = id;
  const note = notes.find(n => n.id === id);
  if (!note) return;

  titleInput.value = note.title;
  contentInput.value = note.content;
  emptyState.classList.add('hidden');
  editor.classList.remove('hidden');

  renderNotes();
  updatePreview();
}

function deleteCurrentNote() {
  if (!currentNoteId || !confirm('Delete this note?')) return;
  notes = notes.filter(n => n.id !== currentNoteId);
  localStorage.setItem('nota_notes', JSON.stringify(notes));
  currentNoteId = null;
  editor.classList.add('hidden');
  emptyState.classList.remove('hidden');
  renderNotes();
}

function updatePreview() {
  const markdown = contentInput.value;
  // Simple markdown renderer (you can enhance with marked.js later)
  preview.innerHTML = markdown
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

contentInput.addEventListener('input', () => {
  if (currentNoteId) saveNote();
  updatePreview();
});

titleInput.addEventListener('input', () => {
  if (currentNoteId) saveNote();
});

function filterNotes() {
  const query = document.getElementById('search').value.toLowerCase();
  const filtered = notes.filter(n => 
    n.title.toLowerCase().includes(query) || 
    n.content.toLowerCase().includes(query)
  );
  renderNotes(filtered);
}

function exportNotes() {
  const dataStr = JSON.stringify(notes, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const exportFileDefaultName = 'nota_backup.json';

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

function importNotes() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        notes = [...imported, ...notes];
        localStorage.setItem('nota_notes', JSON.stringify(notes));
        renderNotes();
        alert('Notes imported successfully!');
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// Initialize
renderNotes();