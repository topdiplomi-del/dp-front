import { Component } from '@angular/core';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';
import { AppComponent } from '../../../../features/home/hero/hero.component';
import { InstitutesComponent } from '../../../../features/home/institutes/institutes.component';
import { OpenDayBannerComponent } from '../../open-days-banner/open-day-banner.component';
import { FaqComponent } from '../../faq/faq.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    AppComponent,
    InstitutesComponent,
    OpenDayBannerComponent,
    FaqComponent,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {}
