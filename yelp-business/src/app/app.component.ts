import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'yelp-business';
  searchClick() {
    var scE = document.getElementById('sc') as HTMLLinkElement;
    if(!scE.classList.contains('rounded-pill')) {
      scE.classList.add('rounded-pill');
      scE.classList.add('border');
      scE.classList.add('border-dark');

      var bkE= document.getElementById('bk') as HTMLLinkElement;
      bkE.classList.remove('rounded-pill');
      bkE.classList.remove('border');
      bkE.classList.remove('border-dark');

    }
  }

  bookingsClick() {
    var bkE = document.getElementById('bk') as HTMLLinkElement;
    if(!bkE.classList.contains('rounded-pill')) {
      bkE.classList.add('rounded-pill');
      bkE.classList.add('border');
      bkE.classList.add('border-dark');

      var scE= document.getElementById('sc') as HTMLLinkElement;
      scE.classList.remove('rounded-pill');
      scE.classList.remove('border');
      scE.classList.remove('border-dark');

    }
  }
}