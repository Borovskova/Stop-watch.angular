import { Component } from '@angular/core';
import { fromEvent, interval, NEVER, Subject } from 'rxjs';
import { scan, tap, startWith, switchMap, buffer, throttleTime, filter, debounceTime, map } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public buttonText: string = 'start';
  public buttonTogler: boolean = false;
  public pause: boolean = true;
  public click$ = fromEvent(document, 'click');
  public counterHour: any = 0;
  public counterMin: any = 0;
  public counterSec: any = 0;
  public counterSecSubject: Subject<{ pause?: boolean, counterSecValue?: number }> = new Subject();

  ngOnInit() {
    this.initializeCounter()
  }


  private initializeCounter() {
    this.counterSecSubject.pipe(
      startWith({ pause: true, counterSecValue: this.counterSec }),
      scan((acc, val) => ({ ...acc, ...val })),
      tap((state) => {
        this.counterSec = state.counterSecValue;
      }),
      switchMap((state) => state.pause ? NEVER : interval(1000).pipe(
        tap((val) => {
          state.counterSecValue = this.counterSec + 1;
          this.counterSec = state.counterSecValue;
          if (this.counterSec >= 60) {
            this.resetCounter();
            this.startCounter();
            this.counterMin += 1;
          } else if (this.counterMin >= 60) {
            this.counterMin = 0;
            this.counterHour += 1;
          }
        })
      ))
    ).subscribe();
  }


  public counterPlay() {
    this.buttonTogler = !this.buttonTogler
    this.buttonTogler ? this.startCounter() : this.stopCounter()
  }
  public startCounter() {
    this.counterSecSubject.next({ pause: false, counterSecValue: this.counterSec });
    this.buttonText = 'stop';
  }
  public stopCounter() {
    this.counterSecSubject.next({ pause: true, counterSecValue: 0 });
    this.counterMin = 0;
    this.counterHour = 0;
    this.buttonText = 'start';
  }
  public pauseCounter() {
    // this.pause = !this.pause;
    // setTimeout(() => {
    //   this.pause = !this.pause;
    // }, 300)
    // if (this.pause) {
    //   this.buttonTogler = false;
    //   this.buttonText = 'start';
    //   this.counterSecSubject.next({ pause: true });
    // } 
    this.click$.pipe(
      buffer(
        this.click$.pipe(debounceTime(300))
      ),
      map(list => {
        return list.length;
      }),

      filter(x => x === 2),
    ).subscribe(() => {
      this.buttonTogler = false;
      this.buttonText = 'start';
      this.counterSecSubject.next({ pause: true });
    });
  }

  public resetCounter() {
    this.counterSecSubject.next({ counterSecValue: 0 });
    this.counterMin = 0;
    this.counterHour = 0;
    this.startCounter()
  }
  public addZero(counter: number) {
    if (counter < 10) {
      return true
    } return false
  }
}

