import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

import { removeFilenameCollisionAvoider } from '../../utils/utils';

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

  warmupList: Array<any> = [];
  fetchingWarmups: boolean = false;
  fetchingWarmupsError = null;
  displayedColumns: string[] = ['id', 'name', 'actions'];
  expandedElement: null;
  audio: HTMLAudioElement;
  generating: boolean = false;

  ngOnInit(): void {
    this.fetchingWarmups = true;
    this.fetchingWarmupsError = null;

    this.http.get('http://127.0.0.1:8080/warmup/')
      .subscribe((response: any) => {
        this.fetchingWarmups = false;
        this.warmupList = response.warmups;
      }, (err) => {
        console.log('Error fetching warmups!', err);
        this.fetchingWarmupsError = 'Unable to fetch warmups!';
      });
  }

  blob: any; // TODO: check if I need this here or it can be a local "let" inside downloadRequest
  downloadRequest(filename) {
    // download file
    const httpOptions = {
      responseType: 'blob' as 'json',
      //headers: new HttpHeaders({
      //  'Authorization': this.authKey,
      //}),
    };

    this.http.get(`http://127.0.0.1:8080/audio/${filename}`, httpOptions)
      .subscribe((data: any) => {
        //this.blob = new Blob([data], { type: 'audio/x-wav' });

        let downloadURL = window.URL.createObjectURL(data);
        let link = document.createElement('a');
        link.href = downloadURL;
        link.download = removeFilenameCollisionAvoider(filename);
        link.click();
        window.URL.revokeObjectURL(data);
      });
  }

  generateWarmup(warmup, updateAudio) {
    let params = {
      exercises: warmup.exercises,
      name: warmup.name,
    }
    this.audio = null;
    this.generating = true;

    this.http.post('http://127.0.0.1:8080/wav/generate', params)
      .subscribe((response: any) => {
        warmup.filename = response.filename;
        this.generating = false;
        if (updateAudio) {
          this.audio = new Audio();
          this.audio.src = `http://127.0.0.1:8080/audio/${response.filename}`;
        } else {
          this.downloadRequest(response.filename);
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
    this._snackBar.open('Generating warmup...', 'Ok!', {
      duration: 5000,
    });

    this.generateWarmup(warmup, false);
  }

  selectElement(warmup) {
    this.expandedElement = this.expandedElement === warmup ? null : warmup;

    if (this.expandedElement) {
      if (!warmup.filename) {
        this.generateWarmup(warmup, true);
      } else {
        this.audio = new Audio();
        this.audio.src = `http://127.0.0.1:8080/audio/${warmup.filename}`;
      }
    }
  }
}
