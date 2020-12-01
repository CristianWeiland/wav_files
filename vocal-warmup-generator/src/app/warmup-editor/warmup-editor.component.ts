import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-warmup-editor',
  templateUrl: './warmup-editor.component.html',
  styleUrls: ['./warmup-editor.component.css']
})
export class WarmupEditorComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
  ) {}

  warmupId = -1;

  predefinedExercises = [
    { id: 0, name: 'Bocca Chiusa' },
    { id: 1, name: 'Vroli' },
    { id: 2, name: 'O-I-A' },
  ];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.warmupId = parseInt(params.get('warmupId'));
    });
  }

  generateDefaultValue() {
    return {
      warmup: this.predefinedExercises[0],
      customName: '',
      range: { begin: 10, end: 20 },
      speed: 1,
    };
  }

  warmups = [
    {
      id: 0,
      warmupId: 0,
      name: 'Episode I - The Phantom Menace',
      range: { begin: 10, end: 20 },
      speed: 1,
    },
    {
      id: 1,
      warmupId: 1,
      name: 'Episode II - Attack of the Clones',
      range: { begin: 10, end: 20 },
      speed: 1,
    },
    {
      id: 2,
      warmupId: 2,
      name: 'Episode III - Revenge of the Sith',
      range: { begin: 10, end: 20 },
      speed: 1,
    },
  ];

  currentExercise = this.generateDefaultValue();

  getBeginMax() {
    return Math.min(50, this.currentExercise.range.end);
  }
  getEndMin() {
    return Math.max(10, this.currentExercise.range.begin);
  }

  addExercise() {
    let formattedWarmup = {
      id: this.warmups.length + 1,
      warmupId: this.currentExercise.warmup.id,
      name: this.currentExercise.customName || this.currentExercise.warmup.name,
      range: this.currentExercise.range,
      speed: this.currentExercise.speed,
    };
    this.warmups.push(formattedWarmup);
    this.currentExercise = this.generateDefaultValue();
  }

  deleteExercise(i) {
    this.warmups.splice(i, 1);
  }

  swap(i, j) {
    // Not the most readable code, but works
    this.warmups[i] = this.warmups.splice(j, 1, this.warmups[i])[0];
  }

  convertToNote(note) {
    if (isNaN(note)) return '--';

    let noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

    let parsedNote = parseInt(note);
    let noteName = noteNames[parsedNote % noteNames.length]; 
    let octave = Math.floor(parsedNote / noteNames.length) + 3
    return `${noteName}${octave}`;
  }
}
