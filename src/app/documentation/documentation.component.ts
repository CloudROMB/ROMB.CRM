import {Component, OnInit} from '@angular/core';
import {SharedService} from '../services/shared.service';
import {AuthService} from '../services/auth.service';
import {ApiService} from '../services/api.service';

@Component({
  selector: 'romb-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss']
})
export class DocumentationComponent implements OnInit {
  private creds: string[];

  constructor(private shared: SharedService,
              private api: ApiService,
              private auth: AuthService) {
  }

  async ngOnInit() {
    await this.api.getCredentials();
    this.creds = this.shared.checkCredentials(['documentation_admin', 'documentation_user']);
  }

  checkCredentials(cred) {
    // this.creds = this.shared.checkCredentials(['documentation_admin', 'documentation_user']);
    if (this.creds) {
      return this.creds.indexOf(cred) >= 0;
    } else {
      return false;
    }
  }
}
