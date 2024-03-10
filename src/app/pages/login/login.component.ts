import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  mediaRecorder: MediaRecorder | undefined;
  audioChunks: Blob[] = [];
  audioBlobUrl: string | null = null;
  recordingInProgress = false;

  isSignDivVisiable: boolean  = true;

  signUpObj: SignUpModel  = new SignUpModel();
  loginObj: LoginModel  = new LoginModel();

  constructor(private router: Router, private http: HttpClient){}
  startRecording() {
    this.recordingInProgress = true;
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = event => {
          this.audioChunks.push(event.data);
        };
        this.mediaRecorder.start();
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
      });
  }

  stopRecording() {
    this.recordingInProgress = false;
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioBlobUrl = URL.createObjectURL(audioBlob);
      };
    }
  }

  playRecording() {
    if (this.audioBlobUrl) {
      const audio = new Audio(this.audioBlobUrl);
      audio.play();
    }
  }
  sendRecording() {
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });

    // Create FormData object to send audio blob
    const formData = new FormData();
    formData.append('audioFile', audioBlob, 'recording.wav');

    // Replace 'YOUR_API_ENDPOINT' with your actual API endpoint
    const apiUrl = 'YOUR_API_ENDPOINT';

    // Make HTTP POST request to API endpoint
    this.http.post(apiUrl, formData).pipe(
      tap(response => {
        console.log('Recording sent successfully:', response);
        // Handle response as needed
      }),
      catchError(error => {
        console.error('Error sending recording:', error);
        // Handle error as needed
        return of(error);
      })
    ).subscribe();
  }


  onRegister() {
    debugger;
    const localUser = localStorage.getItem('angular17users');
    if(localUser != null) {
      const users =  JSON.parse(localUser);
      users.push(this.signUpObj);
      localStorage.setItem('angular17users', JSON.stringify(users))
    } else {
      const users = [];
      users.push(this.signUpObj);
      localStorage.setItem('angular17users', JSON.stringify(users))
    }
    alert('Registration Success')
  }

  onLogin() {
    debugger;
    const localUsers =  localStorage.getItem('angular17users');
    if(localUsers != null) {
      const users =  JSON.parse(localUsers);

      const isUserPresent =  users.find( (user:SignUpModel)=> user.email == this.loginObj.email && user.password == this.loginObj.password);
      if(isUserPresent != undefined) {
        alert("User Found...");
        localStorage.setItem('loggedUser', JSON.stringify(isUserPresent));
        this.router.navigateByUrl('/dashboard');
      } else {
        alert("No User Found")
      }
    }
  }

}

export class SignUpModel  {
  name: string;
  email: string;
  password: string;

  constructor() {
    this.email = "";
    this.name = "";
    this.password= ""
  }
}

export class LoginModel  { 
  email: string;
  password: string;

  constructor() {
    this.email = ""; 
    this.password= ""
  }
}
