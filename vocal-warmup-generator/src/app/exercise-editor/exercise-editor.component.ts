import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { url } from '../../utils/baseUrl';
import { convertToNote } from '../../utils/utils';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-exercise-editor',
  templateUrl: './exercise-editor.component.html',
  styleUrls: ['./exercise-editor.component.css']
})
export class ExerciseEditorComponent implements OnInit {

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) {}

  @Input() active: boolean;
  @Input() exerciseId: number;
  @Input() warmupId: number;

  @Output() back = new EventEmitter();
  @Output() reloadWarmup = new EventEmitter();

  exercise: any = null;
  predefinedExercises: any[];
  loadingPredefinedExercises: boolean = true;
  fetchPredefinedExercisesError: string = null;

  ngOnInit(): void {
    this.generateExerciseDefaultValues();
    this.fetchPredefinedExercises();
  }

  getSubtitle() {
    return this.exerciseId === -1 ? 'New exercise' : `Edit exercise ${this.exerciseId + 1}`;
  }

  generateExerciseDefaultValues() {
    this.exercise = {
      predefinedExerciseId: this.predefinedExercises && this.predefinedExercises.length > 0 ?
        this.predefinedExercises[0].id : null,
      customName: '',
      range: { begin: 10, end: 20 },
      speed: 1,
    };
  }

  fetchPredefinedExercises() {
    this.loadingPredefinedExercises = true;
    this.http.get(`${url}/predefined_exercises`)
      .subscribe((response: any) => {
        this.predefinedExercises = response.predefined_exercises;
        this.loadingPredefinedExercises = false;

        if (this.exercise.predefinedExerciseId === null) {
          this.exercise.exercise = this.predefinedExercises[0].id;
        }
      }, (err: any) => {
        this.loadingPredefinedExercises = false;
        this.fetchPredefinedExercisesError = 'Unable to fetch predefined exercises. Try again later.';
      });
  }

  getBeginMax() {
    let rangeEnd = (this.exercise || { range: { end: 50 } }).range.end;
    return Math.min(50, rangeEnd);
  }
  getEndMin() {
    let rangeBegin = (this.exercise || { range: { begin: 10 } }).range.begin;
    return Math.max(10, rangeBegin);
  }

  goBack() {
    this.back.emit();
  }

  editExercise(exercise) {
    this.exercise = {
      exerciseId: exercise.exerciseId,
      predefinedExerciseId: exercise.predefinedExerciseId,
      customName: exercise.name,
      range: {
        begin: exercise.range.begin,
        end: exercise.range.end,
      }
    };
  }

  convertToNote(note) {
    return convertToNote(note);
  }

  saveExercise(exercise) {
    // Validations:
    if (!exercise.predefinedExerciseId && exercise.predefinedExerciseId !== 0) {
      this._snackBar.open('Invalid predefined exercise.', '', { duration: 5000 });
      return;
    }

    let parsedExercise = {
      ...exercise,
      //id: this.exerciseId,
      warmupId: this.warmupId,
    };

    this.http.post(`${url}/exercises/save`, { params: parsedExercise })
      .subscribe((response: any) => {
        this._snackBar.open('Exercise saved succesfully', 'Awesome!', { duration: 5000 });

        this.reloadWarmup.emit();
        this.back.emit();
      }, err => {
        console.log(err);

        this._snackBar.open('Unable to save exercise.', '', { duration: 5000 });
      });
  }
}
