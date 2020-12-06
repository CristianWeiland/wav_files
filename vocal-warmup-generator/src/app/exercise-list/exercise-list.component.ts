import { DataSource } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  MatColumnDef, MatHeaderRowDef, MatNoDataRow, MatRowDef, MatTable, MatTableDataSource
} from '@angular/material/table';

import { convertToNote } from '../../utils/utils';

export interface Exercise {
  exerciseId: number;
  name: string;
  range: {
    begin: number,
    end: number
  };
  //speed: number,
}

let ELEMENT_DATA: Exercise[] = [];

@Component({
  selector: 'app-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.css']
})

export class ExerciseListComponent implements OnInit {

  @Input() mode: string;
  @Input() exercises: Exercise[];

  @Output() requestEdit = new EventEmitter<number>();
  @Output() requestDelete = new EventEmitter<number>();

  constructor() { }

  displayedColumns: string[] = ['id', 'name', 'range', 'actions'];
  dataSource = new MatTableDataSource<Exercise>(ELEMENT_DATA);

  @ViewChild(MatTable) table: MatTable<any>;

  ngOnInit(): void {
    if (this.mode === 'edit') {
      this.displayedColumns = ['id', 'name', 'range', 'actions'];
    } else { // mode === 'view'
      this.displayedColumns = ['id', 'name', 'range'];
    }

    ELEMENT_DATA.splice(0, ELEMENT_DATA.length);

    this.exercises.forEach(exercise => {
      ELEMENT_DATA.push(exercise);
    });
  }

  ngAfterViewInit() {
    this.table.renderRows();
  }

  selectExercise(index: number) {
    this.requestEdit.emit(index);
  }

  deleteExercise(i: number) {
    this.dataSource.data.splice(i, 1);
    this.requestDelete.emit(i);
    this.table.renderRows();
  }

  addExercise(newExercise: Exercise) {
    this.dataSource.data.push(newExercise);
    this.table.renderRows();
  }

  updateExercise(newExercise: Exercise, id: number) {
    this.dataSource.data[id] = newExercise;
    this.table.renderRows();
  }

  getFullWarmup() {
    return ELEMENT_DATA;
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
