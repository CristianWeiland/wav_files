import { DataSource } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  MatColumnDef, MatHeaderRowDef, MatNoDataRow, MatRowDef, MatTable, MatTableDataSource
} from '@angular/material/table';

export interface Exercise {
  exerciseId: number;
  name: string;
  range: {
    begin: number,
    end: number
  };
  //speed: number,
}

/*
let ELEMENT_DATA: Exercise[] = [
  {
    exerciseId: 0,
    name: 'Bocca Chiusa',
    range: { begin: 10, end: 20 },
    speed: 1,
  },
  {
    exerciseId: 1,
    name: 'Vroli - brin',
    range: { begin: 10, end: 20 },
    speed: 1,
  },
  {
    exerciseId: 2,
    name: 'O - I - A',
    range: { begin: 10, end: 20 },
    speed: 1,
  },
  {
    exerciseId: 2,
    name: 'Ziu ziu',
    range: { begin: 10, end: 20 },
    speed: 1,
  },
  {
    exerciseId: 2,
    name: 'Mei mai mei',
    range: { begin: 10, end: 20 },
    speed: 1,
  },
];
*/

let ELEMENT_DATA: Exercise[] = [];

@Component({
  selector: 'app-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.css']
})


export class ExerciseListComponent implements OnInit {

  @Input() mode: string;
  @Input() exercises: Exercise[];

  @Output() requestEdit = new EventEmitter<any>();

  constructor() { }

  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource = new MatTableDataSource<Exercise>(ELEMENT_DATA);

  @ViewChild(MatTable) table: MatTable<any>;

  ngOnInit(): void {
    if (this.mode === 'edit') {
      this.displayedColumns = ['id', 'name', 'actions'];
    } else { // mode === 'view'
      this.displayedColumns = ['id', 'name'];
    }

    ELEMENT_DATA.splice(0, ELEMENT_DATA.length);

    this.exercises.forEach(exercise => {
      ELEMENT_DATA.push(exercise);
    });
  }

  ngAfterViewInit() {
    this.table.renderRows();
  }

  deleteExercise(i: number) {
    this.dataSource.data.splice(i, 1);
    this.table.renderRows();
  }

  addExercise(newExercise: Exercise) {
    this.dataSource.data.push(newExercise);
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
}
