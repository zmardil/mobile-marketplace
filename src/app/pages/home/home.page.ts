import { Component, OnInit } from '@angular/core';
import { DataAccessService } from 'src/app/services/data-access.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  
  listings;
  searchText: string = '';
  
  constructor(private dataSvc: DataAccessService) {
    this.dataSvc.getAllListings().subscribe(data => {
      this.listings = data;
    })
  }

  ngOnInit() {
  }
  
  search() {
    return this.listings.filter(listing => {
      return listing.title.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1 || listing.description.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1;
    })
  }

}
