import { MatTabsModule } from '@angular/material/tabs';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, FormArray, NgForm } from '@angular/forms';
import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';
import { debounceTime, tap, switchMap, finalize, distinctUntilChanged, filter } from 'rxjs/operators';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit {

  reviewData: any
  searchCtrl = new FormControl();
  filteredKws: any;
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 3;
  selectedKw: any = "";
  distance: any = 10;
  nameWiseFlag = false;
  numberWise3Flag = false;
  numberWise4Flag = false;
  reviewTable: HTMLTableElement = document.createElement('table');
  mapOptions: google.maps.MapOptions = {
    center: { lat: 38.9987208, lng: -77.2538699 },
    zoom: 14
  }
  marker = {
    position: { lat: 38.9987208, lng: -77.2538699 },
  }
  name: any;
  infoData: any
  filteredObj: any
  bAddress: any;
  bPhone: any;
  bStatus: any;
  bCategory: any;
  bPrice: any;
  bMoreInfo: any;
  email: any;
  dateSave: any;
  displayStyle = "none";
  today = new Date();
  photos0: any;
  photos1: any;
  photos2: any;
  listingObj: any;
  photos:any
  storedIndex:any;
  localDataKey = 'dataYelpAPI'
  storedData = []
  email_valid: any = true
  date_valid: any = true
  hour_valid: any = true
  min_valid: any= true




  constructor(private http: HttpClient) {
  }

  onSelected() {
    this.selectedKw = this.selectedKw;
  }

  enableCheckbox() {
    var checkInp = document.getElementById('check') as HTMLInputElement;
    var inputLoc = document.getElementById('location') as HTMLInputElement;

    if (checkInp.checked) {
      inputLoc.disabled = true;
      inputLoc.value = '';
      inputLoc.checked = false;
      if (!inputLoc.classList.contains('bg-light')) {
        inputLoc.classList.add('bg-light');
      }

    }
    else {
      inputLoc.disabled = false;
      inputLoc.style.background = 'white';
      inputLoc.classList.remove('bg-light');
    }
  }

  cleanLoc() {
    var inputLoc = document.getElementById('location') as HTMLInputElement;
    inputLoc.classList.remove('bg-light');
    var checkInp = document.getElementById('check') as HTMLInputElement;
    checkInp.checked = false;
    inputLoc.disabled = false;
    var notFound = document.getElementById('noResult') as HTMLDivElement;
    if (!notFound.classList.contains('d-none')) {
      notFound.classList.add('d-none');
    }
    var searchTable = document.getElementById('searchTable') as HTMLTableElement;
    if (!searchTable.classList.contains('d-none')) {
      searchTable.classList.add('d-none');
    }
    var cancelDiv = document.getElementById('cancel') as HTMLButtonElement;
    if (!cancelDiv.classList.contains('d-none')) {
      cancelDiv.classList.add('d-none');
      var rDiv = document.getElementById('resModal') as HTMLButtonElement;
      rDiv.classList.remove('d-none');
    }

    var divTable = document.getElementById('searchTable') as HTMLTableElement;
    if (!cancelDiv.classList.contains('d-none')) {
      divTable.classList.add('d-none');
    }
    var divEle = document.getElementById('detaiLS') as HTMLDivElement;
    if (!divEle.classList.contains('d-none')) {
      divEle.classList.add('d-none');
    }

  }

  openModal() {
    this.displayStyle = "block"
  }

  clearSelection() {
    this.selectedKw = "";
    this.filteredKws = [];
  }

  ngOnInit(): void {
    this.searchCtrl.valueChanges
      .pipe(
        filter(res => {
          return res !== null && res.length >= this.minLengthTerm
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredKws = [];
          this.isLoading = true;
        }),
        switchMap(value => this.http.get('https://webapp-4mk5cto4oa-wl.a.run.app/get_autocomplete_words' + '?kw=' + value)
          .pipe(
            finalize(() => {
              this.isLoading = false
            }),
          )
        )
      )
      .subscribe((data: any) => {
        if (data['data'] == undefined) {
          this.errorMsg = data['Error'];
          this.filteredKws = [];
        } else {
          this.errorMsg = "";
          this.filteredKws = data['data'];
          console.log(this.filteredKws);
        }
      });

  }
 
  async prepareReview(bId: string) {
    var resp = await axios.get("https://webapp-4mk5cto4oa-wl.a.run.app/get_business_reviews", { params: { 'id': bId } });
    if (resp.status != 200) {
      alert('Sorry! Not much information available on this business');
      return;
    }
    this.reviewData = resp.data.data;
  }

  prepareMap(lat: number, long: number) {
    this.mapOptions = {
      center: { lat: lat, lng: long },
      zoom: 14
    }
    this.marker = {
      position: { lat: lat, lng: long },
    }
  }

  async prepareDataset(bId: string, bName: string) {
    var divTable = document.getElementById('searchTable') as HTMLTableElement;
    divTable.classList.add('d-none');
    var resp = await axios.get("https://webapp-4mk5cto4oa-wl.a.run.app/get_business_info", { params: { 'id': bId } });
    if (resp.status != 200) {
      alert('Sorry! Not much information available on this business');
      return;
    }
    this.infoData = resp.data.data;
    this.name = bName
    var detDiv = document.getElementById('details') as HTMLDivElement;
    detDiv.classList.remove('d-none');
    this.prepareReview(bId);
    this.prepareMap(this.infoData['coordinates']['latitude'], this.infoData['coordinates']['longitude']);

    this.bAddress = this.infoData['address']
    this.bCategory = this.infoData['category']
    this.bPhone = this.infoData['phone_no']
    this.bStatus = this.infoData['status']
    var statusDiv= document.getElementById('statusId') as HTMLDivElement;
    if (statusDiv.classList.contains('text-danger')) {
      statusDiv.classList.remove('text-danger');
    }
    if (statusDiv.classList.contains('text-success')) {
      statusDiv.classList.remove('text-danger');
    }
    if (this.bStatus == 'Closed') {
      statusDiv.classList.add('text-danger');
    }  else {
      statusDiv.classList.add('text-sucess');
    }
    this.bMoreInfo = this.infoData['info_url']
    this.bPrice = this.infoData['price']

    console.log(this.infoData['photos'])
    this.photos0 = this.infoData['photos'][0];
    this.photos1 = this.infoData['photos'][1];
    this.photos2 = this.infoData['photos'][2];
    console.log(this.photos0)
    console.log(this.photos1)
    console.log(this.photos2)
    this.photos = this.infoData['photos']
  }

  async submit(form: NgForm) {
    var category = document.getElementById('c') as HTMLInputElement;
    var loc = document.getElementById('location') as HTMLInputElement;
    var location = ''
    if (loc.value != '') {
      location = loc.value;
    } else {
      var resp = await axios.get("https://api.ipify.org/?format=json");
      var ip = resp.data['ip'];
      console.log(resp);
    }
    var distEle = document.getElementById('d') as HTMLInputElement;
    var obj =
    {
      'radius': this.distance,
      'keyword': this.selectedKw,
      'category': category.value,
      'location': location,
      'ip': ip,
    }
    var resp_business = await axios.get('https://webapp-4mk5cto4oa-wl.a.run.app/get_businesses/', { params: obj });
    var notFound = document.getElementById('noResult') as HTMLDivElement;
    if (resp_business.status != 200) {
      notFound.classList.remove('d-none');
      return;
    }
    var numRow = resp_business.data.data.length;
    var tableId = document.getElementById('searchTable') as HTMLTableElement;
    if (numRow == 0) {
      notFound.classList.remove('d-none');
      if (!tableId.classList.contains('d-none')) {
        tableId.classList.add('d-none');
      }
      return;
    }

    tableId.classList.remove('d-none');
    if (!notFound.classList.contains('d-none')) {
      notFound.classList.add('d-none');
    }
    this.listingObj = resp_business.data.data

  }

  submitReservation() { 
    this.valEma();
    this.valMin();
    this.valHour();
    this.valDate();
    if (!(this.date_valid && this.email_valid && this.hour_valid && this.min_valid) ) {
      return 
    }
    var emailIn = document.getElementById('userEmail') as HTMLInputElement;
    var dateIn = document.getElementById('rdate') as HTMLInputElement;
    var hourIn = document.getElementById('tHId') as HTMLInputElement;
    var minIn = document.getElementById('tMId') as HTMLInputElement;

   var dataToStore = []
   var locStoreData = localStorage.getItem(this.localDataKey);
   if (locStoreData!= null) {
        dataToStore = JSON.parse(locStoreData);
   }
   dataToStore.push({'email': emailIn.value, 'date':dateIn.value, 'hour':hourIn.value, 'min':minIn.value, 'name': this.name});
   this.storedIndex = dataToStore.length
   localStorage.setItem( this.localDataKey, JSON.stringify(dataToStore));
   this.storedData = dataToStore

   var cancelDiv = document.getElementById('cancel') as HTMLButtonElement;
   cancelDiv.classList.remove('d-none');
   var rDiv = document.getElementById('resModal') as HTMLButtonElement;
   rDiv.classList.add('d-none');
   alert("Reservation Created");

   this.closeModal();
  }

  closeModal() {
    this.displayStyle = "none";
  }

  function() {
    var forms  = document.querySelectorAll('.needs-validation');
    Array.prototype.slice.call(forms)
    .forEach( function (form) {
      form.addEventListener('submit', function(event:any) {
        if(!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated')
      }, false)
    })
  }

  valEma() {
    var email = document.getElementById('userEmail') as HTMLInputElement
    var email_content = email.value

    if (email_content.length == 0) {
      this.email_valid = false;
    } else {
      this.email_valid = true
    }
  }
  valDate() {
    var dateIn = document.getElementById('rdate') as HTMLInputElement
    var date_content = dateIn.value

    if (date_content.length == 0) {
      this.date_valid = false;
    } else {
      this.date_valid = true
    }
  }
  valHour() {
    var hourIn = document.getElementById('tHId') as HTMLInputElement
    var hour_content = hourIn.value
    console.log("hour")
    console.log(hour_content)

    if (hour_content.length == 0) {
      this.hour_valid = false;
    } else {
      this.hour_valid = true
    }
  }
  valMin() {
    var minIn = document.getElementById('tMId') as HTMLInputElement
    var min_content = minIn.value
    console.log("min")
    console.log(min_content)

    if (min_content.length == 0) {
      this.min_valid = false;
    } else {
      this.min_valid = true
    }
  }



  arrowClick() {
    var divEle = document.getElementById('details') as HTMLDivElement;
    divEle.classList.add('d-none');
    var divEle2 = document.getElementById('searchTable') as HTMLTableElement;
    divEle2.classList.remove('d-none');

    var cancelDiv = document.getElementById('cancel') as HTMLButtonElement;
    if (!cancelDiv.classList.contains('d-none')) {
      cancelDiv.classList.add('d-none');
      var rDiv = document.getElementById('resModal') as HTMLButtonElement;
      rDiv.classList.remove('d-none');
    }
    
  }
  
  cancelReservation(){
    var parseData = []
    var locStoreData = localStorage.getItem('dataYelpAPI');
    if (locStoreData!= null) {
      parseData = JSON.parse(locStoreData);
   }
   console.log(parseData);
   parseData.slice(this.storedIndex, 1);
   var locStoreData = localStorage.getItem('dataYelpAPI');
   localStorage.setItem( this.localDataKey,  JSON.stringify(parseData));
   this.storedData = parseData;
   var cancelDiv = document.getElementById('cancel') as HTMLButtonElement;
   cancelDiv.classList.add('d-none');
   var rDiv = document.getElementById('resModal') as HTMLButtonElement;
   rDiv.classList.remove('d-none');
   alert('Reservation Cancelled');
  }
}

