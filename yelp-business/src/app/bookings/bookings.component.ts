import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit {
  constructor() { }
  localDataKey = 'dataYelpAPI'
  bookings:any;
  ngOnInit(): void {
    var dataLocal = localStorage.getItem(this.localDataKey)
    if (dataLocal!= null) {
      this.bookings = JSON.parse(dataLocal)
    }
    
  }
  deleteBooking(index:number){
    var dataLocal = localStorage.getItem(this.localDataKey)
    var dataStored=[]
    if (dataLocal!= null) {
      dataStored = JSON.parse(dataLocal);
      dataStored.splice(index, 1);
      localStorage.setItem(this.localDataKey, JSON.stringify(dataStored));
      this.bookings = dataStored;
    }
    alert('Reservation cancelled')
  }

}
