function removeFilenameCollisionAvoider(filename) {
  // example: filename (1).wav -> separate into ['filename', ' (1)', '.wav']
  let regex = /(.*)( \(\d+\))(\..*)/;

  if (filename.match(regex)) {
    let matches = regex.exec(filename);
    filename = `${matches[0]}${matches[1]}`;
  }

  return filename;
}

function convertToNote(note) {
  if (isNaN(note)) return '--';

  let noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

  let parsedNote = parseInt(note);
  let noteName = noteNames[parsedNote % noteNames.length]; 
  let octave = Math.floor(parsedNote / noteNames.length) + 3
  return `${noteName}${octave}`;
}

export {
  removeFilenameCollisionAvoider,
  convertToNote,
};
