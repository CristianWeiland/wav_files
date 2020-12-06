import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExerciseListComponent } from '../exercise-list/exercise-list.component';
import { ExerciseEditorComponent } from '../exercise-editor/exercise-editor.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-warmup-editor',
  templateUrl: './warmup-editor.component.html',
  styleUrls: ['./warmup-editor.component.css']
})
export class WarmupEditorComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
  ) {}

  @ViewChild(ExerciseListComponent) exerciseList: ExerciseListComponent;
  @ViewChild(ExerciseEditorComponent) exerciseEditor: ExerciseEditorComponent;

  warmupId: number = -1;
  editExerciseId: number = -1;

  currentlyEditting: string = 'warmup';

  // TODO: Load first exercise from warmup instead of a new with default values WHEN EDITTING
  warmup = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      let idParam = params.get('warmupId');

      this.warmupId = idParam === null ? null : parseInt(idParam);
    });
  }

  save() {
    // NEED TO CALL A FUNCTION FROM APP-EXERCISE-LIST TO FETCH THE LATEST EXERCISES
    let warmup = this.exerciseList.getFullWarmup();

    // TODO: Save on db
    this._snackBar.open('Warmup saved successfully!', 'Ok!', {
      duration: 5000,
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
}
