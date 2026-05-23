import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
})
export class FaqComponent {
  openIndex: number | null = null;

  toggleFaq(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
