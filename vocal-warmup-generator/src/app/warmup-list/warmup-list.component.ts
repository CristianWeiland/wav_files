import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Component({
  selector: 'app-warmup-list',
  templateUrl: './warmup-list.component.html',
  styleUrls: ['./warmup-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class WarmupListComponent implements OnInit {

  constructor(
    private _snackBar: MatSnackBar,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {}

  displayedColumns: string[] = ['id', 'name', 'actions'];
  expandedElement: null;
  audio: HTMLAudioElement;

  deleteThisVarLater = true;

  warmupList = [
    {
      id: 1,
      name: 'Basic warmup (all)',
      filename: null,
      exercises: [
        { exerciseId: 0, name: 'Bocca Chiusa', range: { begin: 10, end: 12 }},
        { exerciseId: 1, name: 'Vroli vroli', range: { begin: 10, end: 12 }},
        { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 12 }},
      ],
    },
    {
      id: 2,
      name: 'Quick warmup (BC)',
      filename: null,
      exercises: [
        { exerciseId: 0, name: 'Bocca Chiusa', range: { begin: 10, end: 12 }},
      ],
    },
    {
      id: 3,
      name: 'Advanced warmup (vroli)',
      filename: null,
      exercises: [
        { exerciseId: 1, name: 'Vroli vroli', range: { begin: 10, end: 12 }},
        { exerciseId: 1, name: 'Vroli vroli', range: { begin: 10, end: 12 }},
      ],
    },
    {
      id: 4,
      name: 'Range extension warmup (oia)',
      filename: null,
      exercises: [
        { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 12 }},
        { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 12 }},
        { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 12 }},
        { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 20 }},
      ],
    },
  ];

  generateWarmup(warmup, updateAudio) {
    let params = {
      exercises: warmup.exercises,
      name: warmup.name,
    }
    this.audio = null;
    // TODO: Add a "loader" while generating
    this.http.post('http://127.0.0.1:8080/wav/generate', params)
      .subscribe((response: any) => {
        warmup.filename = response.filename;
        if (updateAudio) {
          //this.audio = new Audio(`../../../assets/audio/${response.filename}`);
          this.audio = new Audio();
          this.audio.src = `http://127.0.0.1:8080/audio/${response.filename}`;
        } else {
          // download file
          //const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          //a.href = url;
          // the filename you want
          a.download = 'todo-1.json';
          document.body.appendChild(a);
          a.click();
          //window.URL.revokeObjectURL(url);
        }
      }, err => {
        console.log(err);

        this._snackBar.open('Unable to generate warmup.', '', {
          duration: 5000,
        });
        this.expandedElement = null;
      });
  }

  downloadWav(warmup) {
    if (!warmup.filename) {
      this._snackBar.open('Generating warmup...', 'Ok!', {
        duration: 5000,
      });

      this.generateWarmup(warmup, false);
    }
  }

  selectElement(warmup) {
    this.expandedElement = this.expandedElement === warmup ? null : warmup;

    if (this.expandedElement) {
      if (!warmup.filename) {
        this.generateWarmup(warmup, true);
      }
      //this.audio = new Audio(`../../../assets/audio/${warmup.filename}`);
      /*
      if (this.deleteThisVarLater)
        this.audio = new Audio('../../../assets/audio/new.wav');
      else
        //this.audio = new Audio('../../../assets/audio/new1.wav');
        this.audio = new Audio('../../../../assets/audio/Quick warmup.wav');
      this.deleteThisVarLater = !this.deleteThisVarLater;
      */
    }
  }
}
