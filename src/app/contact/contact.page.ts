import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonContent, IonIcon, IonButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { callOutline, locationOutline, mailOutline, timeOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonIcon,
    IonButton,
  ],
})
export class ContactPage {
  submitting = false;
  feedback = '';
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
  });
  contactCards = [
    { title: 'Call Us', detail: '+63 912 345 6789', icon: 'call-outline' },
    { title: 'Email', detail: 'hello@brewluxe.cafe', icon: 'mail-outline' },
    { title: 'Visit Us', detail: '123 Brew Lane, Quezon City, Metro Manila', icon: 'location-outline' },
  ];
  constructor(private readonly fb: FormBuilder, private readonly database: DatabaseService) {
    addIcons({ callOutline, mailOutline, locationOutline, timeOutline, checkmarkCircleOutline });
  }
  private lastSubmissionTime = 0;

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.feedback = 'Complete each required field with valid information.'; return; }

    const now = Date.now();
    const cooldownMs = 30000; // 30 second cooldown
    if (now - this.lastSubmissionTime < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - (now - this.lastSubmissionTime)) / 1000);
      this.feedback = `Please wait ${waitSeconds} seconds before sending another message.`;
      return;
    }

    this.submitting = true; this.feedback = '';
    try {
      await this.database.submitContact(this.form.getRawValue());
      this.lastSubmissionTime = Date.now();
      this.feedback = 'Your message was saved for the Brewluxe project team. Thank you for reaching out!';
      this.form.reset();
    } catch {
      this.feedback = 'We could not save your message. The Supabase database setup may not have been applied yet.';
    } finally { this.submitting = false; }
  }
}
