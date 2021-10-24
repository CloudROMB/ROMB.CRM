import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import {brandDocument} from '../../classes/datamodels';
import {DataTableLiteComponent} from '../../data-table/components/tablelite';
import {SharedService} from '../../services/shared.service';
import {AuthService} from '../../services/auth.service';
import {ApiService} from '../../services/api.service';

@Component({
  selector: 'romb-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit, AfterViewInit, AfterViewChecked {
  public source = 'brands';
  public structureDoc: any = brandDocument;
  @ViewChild(DataTableLiteComponent) dataTable: DataTableLiteComponent;

  partners: any[];

  constructor(private shared: SharedService,
              private auth: AuthService,
              private api: ApiService,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  ngAfterViewChecked() {
  }

  afterOpen(doc) {
    this.partners = [];
  }

  async beforeSave(event) {
    const doc = event.doc;
    const table = event.table;

    doc.partnersCount = 0;
    if (doc._id) {
      try {
        // TODO: в criteria не верное условие, потому что показывает не последний исторический элемент,
        //  а любой релевантный. Нужно копать в сторону $unwind, $last
        const partners = await this.api.getRefCount('departments',
          {
            criteria: {
              brand: {
                $elemMatch: {
                  'id': doc._id
                }
              }
            }
          })
          .catch(err => {
            throw new Error('beforeSave Brand: ' + err.message);
          });

        if (partners && typeof partners.count === 'number') {
          console.log('--- partnersCount', partners);
          doc.partnersCount = partners.count;
        }
      } catch (err) {
        console.error(err.message);
        table.allowSave = false;
        return;
      }
    }

    console.log('beforeSave Brand:', doc);
  }

  async showPartners(doc) {
    if (doc && doc._id) {
      // TODO: в criteria не верное условие, потому что показывает не последний исторический элемент,
      //  а любой релевантный. Нужно копать в сторону $unwind, $last
      // https://stackoverflow.com/questions/30537317/mongodb-aggregation-match-if-value-in-array
      const res = await this.api.getRefList('partners', {
        criteria: {
          brand: {
            $elemMatch: {
              'id': doc._id
            }
          }
        },
        cutFields: false
      });

      console.log(res);

      if (res && res.result) {
        this.partners = res.data.list;
      }
    }
  }

  afterClose() {

  }

  selectPartner(item, partner) {
    item.mainPartner = partner;
  }

}
