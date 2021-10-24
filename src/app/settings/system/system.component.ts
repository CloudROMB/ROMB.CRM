import {Component, OnInit} from '@angular/core';
import {SharedService} from '../../services/shared.service';

@Component({
  selector: 'romb-system-settings',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemSettingsComponent implements OnInit {

  constructor(private shared: SharedService) {

  }

  ngOnInit() {
  }

  checkCredential(cred): boolean {
    return this.shared.checkCredential(cred);
  }

}
