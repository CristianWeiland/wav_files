import { DataSource } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatColumnDef, MatHeaderRowDef, MatNoDataRow, MatRowDef, MatTable, MatTableDataSource } from '@angular/material/table';
import { HttpClient, HttpParams } from '@angular/common/http';

import { url } from '../../utils/baseUrl';
import { convertToNote } from '../../utils/utils';

import { ExerciseInterface, WarmupInterface } from '../../utils/interfaces';

let ELEMENT_DATA: ExerciseInterface[] = [];

@Component({
  selector: 'app-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.css']
})

export class ExerciseListComponent implements OnInit {

  @Input() mode: string;
  @Input() warmupId: number;
  @Input() exercises: ExerciseInterface[];

  @Output() warmupLoaded = new EventEmitter<any>();
  @Output() requestEdit = new EventEmitter<any>();
  @Output() requestDelete = new EventEmitter<number>();

  constructor(private http: HttpClient) {}

  displayedColumns: string[] = ['id', 'name', 'range', 'actions'];
  dataSource = new MatTableDataSource<ExerciseInterface>(ELEMENT_DATA);

  warmup: WarmupInterface = null;
  loadingWarmup: boolean = false;
  fetchWarmupError: string = '';

  @ViewChild(MatTable) table: MatTable<any>;

  ngOnInit(): void {
    if (this.mode === 'edit') {
      this.displayedColumns = ['id', 'name', 'predefinedExerise', 'range', 'actions'];
    } else { // mode === 'view'
      this.displayedColumns = ['id', 'name', 'predefinedExerise', 'range'];
    }

    ELEMENT_DATA.splice(0, ELEMENT_DATA.length);

    this.fetchWarmup();
  }

  fetchWarmup() {
    if (this.warmupId !== null && this.warmupId !== -1) {
      this.loadingWarmup = true;
      let params = { params: new HttpParams().set('id', this.warmupId.toString()) };

      this.http.get(`${url}/warmup/warmup`, params)
        .subscribe((response: any) => {
          this.warmup = response.warmup;

          this.loadingWarmup = false;

          ELEMENT_DATA.splice(0, ELEMENT_DATA.length);

          response.warmup.exercises.forEach((exercise: ExerciseInterface) => {
            ELEMENT_DATA.push(exercise);
            console.log(exercise);
          });

          this.warmupLoaded.emit({ name: this.warmup.name });

          if (this.table) this.table.renderRows();
        }, (err) => {
          this.loadingWarmup = false;
          console.log('Error fetching warmup!', err);
          if (err.status === 404) {
            this.fetchWarmupError = 'Error 404: Warmup not found.';
          }
        });
    } else {
      this.warmup = { id: -1, name: '', exercises: [] };
    }
  }

  selectExercise(index: number) {
    let params = { id: index, exercise: this.warmup.exercises[index] };
    this.requestEdit.emit(params);
  }

  deleteExercise(i: number) {
    this.http.delete(`${url}/exercises/delete`, { params: { id: this.warmup.exercises[i].exerciseId.toString() } })
      .subscribe((response: any) => {
        //this._snackBar.open('Exercise deleted succesfully', 'Awesome!', { duration: 5000 });

        this.dataSource.data.splice(i, 1);
        this.requestDelete.emit(i);
        this.table.renderRows();
      }, err => {
        console.log(err);

        //this._snackBar.open('Unable to delete exercise.', '', { duration: 5000 });
      });
  }

  addExercise(newExercise: ExerciseInterface) {
    this.dataSource.data.push(newExercise);
    this.table.renderRows();
  }

  updateExercise(newExercise: ExerciseInterface, id: number) {
    this.dataSource.data[id] = newExercise;
    this.table.renderRows();
  }

  getFullWarmup() {
    return this.warmup;
  }

  getRowStyle() {
    if (this.mode === 'edit') {
      return '';
    }
    return 'height: 44px';
  }

  swap(i: number, j: number) {
    this.dataSource.data[i] = this.dataSource.data.splice(j, 1, this.dataSource.data[i])[0];
    this.table.renderRows();
  }

  convertToNote(note) {
    return convertToNote(note);
  }
}
