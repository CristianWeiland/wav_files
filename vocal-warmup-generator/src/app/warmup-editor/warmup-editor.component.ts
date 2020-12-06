import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExerciseListComponent } from '../exercise-list/exercise-list.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpParams } from '@angular/common/http';

import { convertToNote } from '../../utils/utils';

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
  loadingWarmup: boolean = true;
  loadingExercises: boolean = true;
  fetchWarmupError: string = null;
  fetchExercisesError: string = null;
  createOrEditExercise: string = 'create';
  editExerciseId: number = -1;

  // TODO: Load first exercise from warmup instead of a new with default values WHEN EDITTING
  currentExercise = null;
  predefinedExercises = null;
  warmup = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      let idParam = params.get('warmupId');

      this.warmupId = idParam === null ? null : parseInt(idParam);

      this.isEdit = idParam !== null;

      if (this.isEdit) {
        this.loadingWarmup = true;
        let params = { params: new HttpParams().set('id', this.warmupId.toString()) };

        this.http.get('http://127.0.0.1:8080/warmup/warmup', params)
          .subscribe((response: any) => {
            this.warmup = response.warmup;

            if (this.warmup.exercises.length) {
              this.currentExercise = this.generateExerciseDefaultValues();
              this.currentExercise = this.changeSelectedExercise(0);
            } else {
              this.currentExercise = this.generateExerciseDefaultValues();
            }

            this.loadingWarmup = false;
          }, (err) => {
            this.loadingWarmup = false;
            console.log('Error fetching warmup!', err);
            if (err.status === 404) {
              console.log('Error: this warmup does not exist!');
              this.fetchWarmupError = 'Error 404: Warmup not found.';
            } else {
              console.log('Unable to fetch warmup. Try again later.');
            }
          });
      } else {
        this.warmup = { id: -1, name: '', exercises: [] };
      }
      
      this.fetchExercises();
    });
  }

  fetchExercises() {
    this.loadingExercises = true;
    this.http.get('http://127.0.0.1:8080/exercises')
      .subscribe((response: any) => {
        this.predefinedExercises = response.exercises;
        this.loadingExercises = false;

        if (this.currentExercise === null) {
          this.currentExercise = this.generateExerciseDefaultValues();
        } else if (this.currentExercise.exercise === null) {
          this.currentExercise.exercise = this.predefinedExercises[0];
        }
      }, (err: any) => {
        this.loadingExercises = false;
        this.fetchExercisesError = 'Unable to fetch predefined exercises. Try again later.';
      });
  }

  generateExerciseDefaultValues() {
    this.createOrEditExercise = 'create';
    return {
      exercise: this.predefinedExercises ? this.predefinedExercises[0] : null,
      customName: '',
      range: { begin: 10, end: 20 },
      speed: 1,
    };
  }

  changeSelectedExercise(index: number) {
    let exercise = this.warmup.exercises[index];
    if (!this.warmup.exercises[index]) return;

    let exerciseId = this.warmup.exercises[index].exerciseId;

    this.currentExercise = this.currentExercise || {};

    if (this.predefinedExercises) {
      this.currentExercise.exercise = this.predefinedExercises.find(exercise => exercise.id === exerciseId);
    }
    this.currentExercise.range = exercise.range;
    //this.currentExercise.speed = exercise.speed;

    this.createOrEditExercise = 'edit';
    this.editExerciseId = index+1;

    return this.currentExercise;
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

    // TODO: Handling ONE array IN EACH component is a BAD idea. Later I should fix for it
    // to be only one array..
    if (this.createOrEditExercise === 'create') {
      this.exerciseList.addExercise(formattedExercise);
      this.warmup.exercises.push(formattedExercise);
    } else {
      this.exerciseList.updateExercise(formattedExercise, this.editExerciseId);
      this.warmup.exercises[this.editExerciseId] = formattedExercise;
    }

    this.currentExercise = this.generateExerciseDefaultValues();
  }

  save() {
    let warmup = this.exerciseList.getFullWarmup();

    // TODO: Save on db
    this._snackBar.open('Warmup saved successfully!', 'Ok!', {
      duration: 5000,
    });
  }

  convertToNote(note) {
    return convertToNote(note);
  }

  getSubtitle() {
    return this.createOrEditExercise === 'create' ? 'New exercise' : `Edit exercise ${this.editExerciseId}`;
  }

  newExercise() {
    this.createOrEditExercise = 'create';
    this.editExerciseId = -1;
    this.currentExercise = this.generateExerciseDefaultValues();    
  }
}
