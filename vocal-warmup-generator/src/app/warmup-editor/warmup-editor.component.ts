import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExerciseListComponent } from '../exercise-list/exercise-list.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-warmup-editor',
  templateUrl: './warmup-editor.component.html',
  styleUrls: ['./warmup-editor.component.css']
})
export class WarmupEditorComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private http: HttpClient,
  ) {}

  @ViewChild(ExerciseListComponent) exerciseList: ExerciseListComponent;

  warmupId: number = -1;
  isEdit: boolean = true;
  loading: boolean = true;
  err: string = null;

  // TODO: Fetch predefinedExercises from db
  predefinedExercises = [
    { id: 0, name: 'Bocca Chiusa' },
    { id: 1, name: 'Vroli' },
    { id: 2, name: 'O-I-A' },
    { id: 3, name: 'Ziu ziu' },
    { id: 4, name: 'Mei mai mei' },
  ];

  // TODO: Load first exercise from warmup instead of a new with default values WHEN EDITTING
  currentExercise = this.generateDefaultValue();
  warmup = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      let idParam = params.get('warmupId');

      this.warmupId = idParam === null ? null : parseInt(idParam);

      this.isEdit = idParam !== null;

      if (this.isEdit) {
        this.loading = true;
        let params = { params: new HttpParams().set('id', this.warmupId.toString()) };

        this.http.get('http://127.0.0.1:8080/warmup/warmup', params)
          .subscribe((response: any) => {
            this.warmup = response.warmup;
            this.loading = false;
          }, (err) => {
            this.loading = false;
            console.log('Error fetching warmup!', err);
            if (err.status === 404) {
              console.log('Error: this warmup does not exist!');
              this.err = 'Error 404: Warmup not found.';
            } else {
              console.log('Unable to fetch warmup. Try again later.');
            }
          });
      } else {
        this.warmup = { id: -1, name: '', exercises: [] };
      }
    });
  }

  generateDefaultValue() {
    return {
      exercise: this.predefinedExercises[0],
      customName: '',
      range: { begin: 10, end: 20 },
      speed: 1,
    };
  }

  getBeginMax() {
    return Math.min(50, this.currentExercise.range.end);
  }
  getEndMin() {
    return Math.max(10, this.currentExercise.range.begin);
  }

  addExercise() {
    let formattedExercise = {
      exerciseId: this.currentExercise.exercise.id,
      name: this.currentExercise.customName || this.currentExercise.exercise.name,
      range: this.currentExercise.range,
      speed: this.currentExercise.speed,
    };

    this.exerciseList.addExercise(formattedExercise);

    this.currentExercise = this.generateDefaultValue();
  }

  save() {
    let warmup = this.exerciseList.getFullWarmup();

    // TODO: Save on db
    this._snackBar.open('Warmup saved successfully!', 'Ok!', {
      duration: 5000,
    });
  }

  changeSelectedExercise() {
    console.log('Changing!');
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
