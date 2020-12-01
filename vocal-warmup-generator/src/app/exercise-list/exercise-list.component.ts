import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.css']
})
export class ExerciseListComponent implements OnInit {

  @Input() mode: string;

  constructor() { }

  displayedColumns: string[] = ['id', 'name', 'actions'];

  ngOnInit(): void {
    if (this.mode === 'edit') {
      this.displayedColumns = ['id', 'name', 'actions'];
    } else { // mode === 'view'
      this.displayedColumns = ['id', 'name'];
    }
  }

  exercises = [
    {
      id: 0,
      exerciseId: 0,
      name: 'Bocca Chiusa',
      range: { begin: 10, end: 20 },
      speed: 1,
    },
    {
      id: 1,
      exerciseId: 1,
      name: 'Vroli - brin',
      range: { begin: 10, end: 20 },
      speed: 1,
    },
    {
      id: 2,
      exerciseId: 2,
      name: 'O - I - A',
      range: { begin: 10, end: 20 },
      speed: 1,
    },
  ];

  deleteExercise(i) {
    this.exercises.splice(i, 1);
  }

  getRowStyle() {
    if (this.mode === 'edit') {
      return '';
    }
    return 'height: 44px';
  }

  swap(i, j) {
    // Not the most readable code, but works
    this.exercises[i] = this.exercises.splice(j, 1, this.exercises[i])[0];
  }
}
