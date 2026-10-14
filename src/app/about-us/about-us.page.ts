import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonContent, IonIcon, IonButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { bag, briefcase, cafe, leaf, people, star, storefront } from 'ionicons/icons';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.page.html',
  styleUrls: ['./about-us.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonContent, IonIcon, IonButton],
})
export class AboutUsPage {
  teamMembers = [
    { name: 'Steven S. Lavilla', role: 'Team Leader / Developer', description: 'Leads the team, coordinates progress, and helps guide the project while contributing to the system’s development and final quality.', image: 'steven-lavilla.png' },
    { name: 'Arc Danier C. Gayon', role: 'Developer', description: 'Contributes to the website’s front-end implementation, interface design, and overall user experience.', image: 'arc-gayon.png' },
    { name: 'Matthew Rovic V. Balita', role: 'Developer', description: 'Helps shape the visual design and supports the implementation of key features across the project.', image: 'matthew-balita.png' },
    { name: 'Junjifil Castro P. Jr', role: 'Developer', description: 'Works on the platform’s interface and interactive functionality to create a polished ordering experience.', image: 'junjifil-castro.png' },
    { name: 'Mohamed Radwan T. Ali', role: 'Developer', description: 'Supports the project’s technical development and ensures the website remains functional, organized, and consistent.', image: 'mohamed-ali.png' },
  ];

  constructor() {
    addIcons({ bag, briefcase, cafe, leaf, people, star, storefront });
  }
}
