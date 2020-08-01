import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, take, mergeAll, zipAll } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataAccessService {

  constructor(private afs:AngularFirestore) { }

  addListing(userId, listing) {
   
     return this.afs.collection<any>(`userListings/${userId}/listings`).add(listing);
     
  }
  
  updateUserDetails(userId, userDetails) {
    return this.afs.collection<any>(`users`).doc(userId).update(userDetails);
  }

  getListings(userId){
    return this.afs.collection<any>(`userListings/${userId}/listings`).valueChanges();
   
  }

  getAllListings() {
    return this.afs.collectionGroup('listings').valueChanges();
  }
  
  getUser(userId) {
    return this.afs.collection<any>('users').doc(userId).valueChanges();
  }
  
}
