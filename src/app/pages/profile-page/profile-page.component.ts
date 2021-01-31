import { Component, OnInit } from '@angular/core';
import { PredictionModel, UserInfo } from '../../api/dto/dtos';
import { TokenStorageService } from '../../core/token-storage.service';
import { UserApiService } from '../../api/user-api.service';
import { Observable } from 'rxjs';
import { ModelApiService } from '../../api/model-api.service';
import { MODEL_STATUS, TIMESERIES_TYPE_DISPLAY_NAME } from 'src/app/core/constants';
import { COUNTRIES } from 'src/app/core/countries';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit {
  public currentUser?: UserInfo;
  public userModels$?: Observable<PredictionModel[]>;

  public readonly COUNTRIES = COUNTRIES;
  public readonly TIMESERIES_TYPE_DISPLAY_NAME = TIMESERIES_TYPE_DISPLAY_NAME;
  public readonly MODEL_STATUS = MODEL_STATUS;

  constructor(
    private readonly tokenStorage: TokenStorageService,
    private readonly userApiService: UserApiService,
    private readonly modelApiService: ModelApiService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.tokenStorage.getUser();
    this.loadUserModels();
  }

  private loadUserModels(): void {
    this.userModels$ = this.userApiService.getUserPredictionModels();
  }

  deleteModel(model: PredictionModel): void {
    if (confirm('Are you sure you want to delete this model?')) {
      this.modelApiService.deleteModel(model.id).subscribe(() => {
        this.loadUserModels();
      });
    }
  }
}
