import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiUrl = 'https://example.com/api'; // Your API endpoint URL

  constructor(private http: HttpClient) { }

  sendCredentials(username: string, audioPassword: string): Observable<any> {
    const credentials = {
      username: username,
      audioPassword: audioPassword
    };

    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }
}
