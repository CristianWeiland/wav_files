import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-warmup-list',
  templateUrl: './warmup-list.component.html',
  styleUrls: ['./warmup-list.component.css']
})
export class WarmupListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  displayedColumns: string[] = ['id', 'name', 'actions'];

  warmupList = [
    { id: 1, name: 'Basic warmup' },
    { id: 2, name: 'Advanced warmup' },
    { id: 3, name: 'Advanced warmup - C#3' },
    { id: 4, name: 'Advanced warmup - D#3' },
  ];
}
