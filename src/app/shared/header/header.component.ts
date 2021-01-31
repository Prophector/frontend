import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../../core/token-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public userDisplayName?: string;

  constructor(private readonly router: Router, private readonly tokenStorageService: TokenStorageService) {}

  public ngOnInit(): void {
    this.userDisplayName = this.tokenStorageService.getUser()?.displayName;
  }

  public signOut(): void {
    this.tokenStorageService.signOut();
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }
}
