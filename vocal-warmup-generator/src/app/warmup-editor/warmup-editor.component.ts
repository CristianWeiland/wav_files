import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExerciseListComponent } from '../exercise-list/exercise-list.component';
import { ExerciseEditorComponent } from '../exercise-editor/exercise-editor.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

import { url } from '../../utils/baseUrl';

@Component({
  selector: 'app-warmup-editor',
  templateUrl: './warmup-editor.component.html',
  styleUrls: ['./warmup-editor.component.css']
})
export class WarmupEditorComponent implements OnInit {

  constructor(private route: ActivatedRoute, private http: HttpClient, private _snackBar: MatSnackBar) {}

  @ViewChild(ExerciseListComponent) exerciseList: ExerciseListComponent;
  @ViewChild(ExerciseEditorComponent) exerciseEditor: ExerciseEditorComponent;

  warmupId: number = -1;
  editExerciseId: number = -1;

  currentlyEditting: string = 'warmup';

  warmup = null;
  warmupName: string = '';

  savingWarmup: boolean = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('warmupId');

      this.warmupId = idParam === null ? null : parseInt(idParam);
    });
  }

  saveWarmup() {
    if (!this.warmupName || this.savingWarmup) {
      this._snackBar.open('Warmup name can not be blank!', 'Ok!', { duration: 5000 });
      return;
    }

    this.savingWarmup = true;

    let parsedWarmup = this.exerciseList.getFullWarmup();
    parsedWarmup.name = this.warmupName;
    parsedWarmup.id = this.warmupId;

    this.http.post(`${url}/warmup/save`, { params: parsedWarmup })
      .subscribe((response: any) => {
        this.savingWarmup = false;
        this._snackBar.open('Warmup saved succesfully', 'Awesome!', { duration: 5000 });
      }, err => {
        console.log(err);
        this.savingWarmup = false;
        this._snackBar.open('Unable to save warmup.', '', { duration: 5000 });
      });
  }

  newExercise() {
    this.editExerciseId = -1;
    this.exerciseEditor.generateExerciseDefaultValues();
    this.currentlyEditting = 'exercise';
  }

  editExercise({ id, exercise }) {
    this.exerciseEditor.editExercise(exercise);
    this.editExerciseId = id;
    this.currentlyEditting = 'exercise';
  }

  showList() {
    this.currentlyEditting = 'warmup';
  }

  reloadWarmup() {
    this.exerciseList.fetchWarmup();
  }

  fetchWarmupName(warmup) {
    this.warmupName = warmup.name;
  }
}
