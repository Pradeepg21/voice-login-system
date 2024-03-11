import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.css'
})
export class UpdatePasswordComponent {
  username: string = '';
  oldPasswordBlob: Blob | null = null;
  newPasswordBlob: Blob | null = null;
  oldPasswordBlobUrl: string | null = null;
  newPasswordBlobUrl: string | null = null;
  updatingPassword: boolean = false;
  recordingOldPassword: boolean = false;
  recordingNewPassword: boolean = false;

  constructor(private apiService: ApiService) {}

  startRecordingOldPassword() {
    this.oldPasswordBlobUrl = null;
    this.recordingOldPassword = true;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        this.oldPasswordBlob = new Blob(chunks, { type: 'audio/webm' });
        this.oldPasswordBlobUrl = URL.createObjectURL(this.oldPasswordBlob);
        this.recordingOldPassword = false;
      };
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000); // Recording for 5 seconds, you can adjust this duration
    });
  }

  stopRecordingOldPassword() {
    
    this.recordingOldPassword = false;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      // Accessing the user's media stream again to stop recording
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    });
  }

  startRecordingNewPassword() {
    this.newPasswordBlobUrl = null;
    this.recordingNewPassword = true;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        this.newPasswordBlob = new Blob(chunks, { type: 'audio/webm' });
        this.newPasswordBlobUrl = URL.createObjectURL(this.newPasswordBlob);
        this.recordingNewPassword = false;
      };
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000); // Recording for 5 seconds, you can adjust this duration
    });
  }

  stopRecordingNewPassword() {
    
    this.recordingNewPassword = false;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      // Accessing the user's media stream again to stop recording
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    });
  }
  updatePassword() {
    if (!this.username || !this.oldPasswordBlob || !this.newPasswordBlob || this.updatingPassword) {
      return;
    }

    this.updatingPassword = true;

    this.apiService.updatePassword(this.username, this.oldPasswordBlob, this.newPasswordBlob)
      .pipe(
        catchError(error => {
          console.error('Error updating password:', error);
          // Handle error
          return [];
        }),
        finalize(() => {
          this.updatingPassword = false;
          // Reset form
          this.username = '';
          this.oldPasswordBlob = null;
          this.newPasswordBlob = null;
          this.oldPasswordBlobUrl = null;
          this.newPasswordBlobUrl = null;
        })
      )
      .subscribe(response => {
        console.log('Password updated successfully:', response);
        // Handle successful update
      });
  }
}
