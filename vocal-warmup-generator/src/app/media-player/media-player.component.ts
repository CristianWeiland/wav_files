import { Component, OnInit, Input } from '@angular/core';
import { VirtualTimeScheduler } from 'rxjs';

@Component({
  selector: 'app-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.css']
})
export class MediaPlayerComponent implements OnInit {
  @Input() audio: HTMLAudioElement;

  isPlaying = false;
  isMuted = false;
  soundLevel = 100;
  soundButtonStyle: string = '';

  duration: number;
  currentTime: number;

  tick: any;

  constructor() {}

  ngOnInit(): void {
    this.tick = setInterval(() => {
      if (this.audio) {
        this.currentTime = this.audio.currentTime;
        if (this.currentTime === this.duration) {
          this.isPlaying = false;
        }
      }
    }, 25); // Low interval to make it smooth
  }

  ngOnChanges(): void {
    let self = this;
    this.audio.addEventListener('loadeddata', () => {
      self.duration = this.audio.duration;
      self.currentTime = 0;
    })
  }

  soundHover() {
    console.log('SoundHover!');
    //this.soundButtonStyle = 'height: 120px; top: -100px; background-color: black';
  }

  sliderChange(newValue: number) {
    this.currentTime = newValue;
    this.audio.currentTime = this.currentTime;
  }

  togglePlay() {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  getDuration() {
    this.duration = this.audio.duration;
    this.currentTime = this.audio.currentTime;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
  }

  formatTime(seconds: number) {
    if (isNaN(seconds)) return '--';

    // If time is 49.95, assume 50 seconds:
    let integerSecs = Math.ceil(seconds);

    let mins = Math.floor(integerSecs / 60);
    let secs = integerSecs % 60;

    // Ensure format 01:03 instead of 1:3
    let formattedMins = mins.toString().padStart(2, '0');
    let formattedSecs = secs.toString().padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
  }
}
