import {Component} from '@angular/core';
import {APIconfig} from '../../../environments/config';
import {ApiService} from '../../services/api.service';

@Component({
  selector: 'romb-footer',
  templateUrl: 'footer.component.html',
  styleUrls: ['footer.component.scss']
})
export class FooterComponent {
  currDate: Date = new Date();
  ver = APIconfig.version;

  constructor(private api: ApiService) {
    // console.log('GET VERSION');
    api.getVersion()
      .then(answer => {
        // console.log('VERSION: ', answer);
        this.ver = answer;
      });
  }
}
