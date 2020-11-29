import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

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

  predefinedWarmups = [
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
      warmup: this.predefinedWarmups[0],
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

  currentWarmup = this.generateDefaultValue();
/*
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.warmups, event.previousIndex, event.currentIndex);
  }
*/
  getBeginMin() {
    return Math.min(50, this.currentWarmup.range.end);
  }
  getEndMax() {
    return Math.max(10, this.currentWarmup.range.begin);
  }

  addWarmup() {
    let formattedWarmup = {
      id: this.warmups.length + 1,
      warmupId: this.currentWarmup.warmup.id,
      name: this.currentWarmup.customName || this.currentWarmup.warmup.name,
      range: this.currentWarmup.range,
      speed: this.currentWarmup.speed,
    };
    this.warmups.push(formattedWarmup);
    this.currentWarmup = this.generateDefaultValue();
  }

  deleteWarmup(i) {
    this.warmups.splice(i, 1);
  }

  swapWarmups(i, j) {
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
