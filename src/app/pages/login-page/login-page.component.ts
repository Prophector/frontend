import { Component, OnInit } from '@angular/core';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from '../../core/auth.service';
import { TokenStorageService } from '../../core/token-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserApiService } from '../../api/user-api.service';
import { UserInfo } from '../../api/dto/dtos';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  public isLoggedIn = false;
  public isLoginFailed = false;
  public errorMessage = '';
  public currentUser?: UserInfo;
  public reason?: string;
  public readonly googleURL = '/oauth2/authorization/google?redirect_uri=/login';
  public readonly githubURL = '/oauth2/authorization/github?redirect_uri=/login';

  public readonly faGoogle = faGoogle;
  public readonly faGithub = faGithub;

  constructor(
    private readonly authService: AuthService,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly userApiService: UserApiService,
  ) {}

  public ngOnInit(): void {
    this.parseLoginReason();
    this.storeRedirectUrl();

    const token = this.route.snapshot.queryParamMap.get('token');
    const error = this.route.snapshot.queryParamMap.get('error');
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.currentUser = this.tokenStorage.getUser();
      setTimeout(() => {
        const redirectUrl = window.sessionStorage.getItem('redirectUrl') || '/';
        window.sessionStorage.removeItem('redirectUrl');
        window.location.href = redirectUrl;
      }, 2000);
    } else if (token) {
      this.tokenStorage.saveToken(token);
      this.userApiService.getCurrentUser().subscribe(
        (data) => {
          this.login(data);
        },
        (err) => {
          this.errorMessage = err.error.message;
          this.isLoginFailed = true;
        },
      );
    } else if (error) {
      this.errorMessage = error;
      this.isLoginFailed = true;
    }
  }

  public login(user: UserInfo): void {
    this.tokenStorage.saveUser(user);
    this.isLoginFailed = false;
    this.isLoggedIn = true;
    this.currentUser = this.tokenStorage.getUser();
    window.location.reload();
  }

  private storeRedirectUrl(): void {
    const redirectUrl = this.route.snapshot.queryParamMap.get('redirectUrl');
    if (redirectUrl) {
      window.sessionStorage.setItem('redirectUrl', redirectUrl);
    }
  }

  private parseLoginReason(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason) {
      this.reason = reason;
    }
  }
}
