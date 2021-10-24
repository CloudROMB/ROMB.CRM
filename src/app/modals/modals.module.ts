import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {AgreementComponent} from './agreement/agreement.component';
import {RegisterModalComponent} from './register/register.component';
import {MaterialModule} from '../material.module';
import {Angular2FontawesomeModule} from 'angular2-fontawesome';
import {CreditCalculatorComponent} from './credit-calculator/credit-calculator.component';
import {ModalComponent} from './modal/modal.component';
import {TextMaskModule} from 'angular2-text-mask';
@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        Angular2FontawesomeModule,
        FormsModule,
        ReactiveFormsModule,
        TextMaskModule
    ],
    declarations: [
        AgreementComponent,
        RegisterModalComponent,
        CreditCalculatorComponent,
        ModalComponent
    ],
    exports: [
        AgreementComponent,
        RegisterModalComponent,
        CreditCalculatorComponent,
        ModalComponent
    ]
})
export class ModalsModule {
}
