// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit } from '@angular/core';

declare const $: any;

@Component({
    selector: 'romb-vector-maps',
    templateUrl: './vectormaps.component.html'
})

export class VectorMapsComponent implements OnInit {
    ngOnInit() {
        const mapData = {
             'AU': 760,
             'BR': 550,
             'CA': 120,
             'DE': 1300,
             'FR': 540,
             'GB': 690,
             'GE': 200,
             'IN': 200,
             'RO': 600,
             'RU': 300,
             'US': 2920,
         };
        $('#worldMap').vectorMap({
            map: 'world_mill_en',
            backgroundColor: 'transparent',
            zoomOnScroll: false,
            regionStyle: {
                initial: {
                    fill: '#e4e4e4',
                    'fill-opacity': 0.9,
                    stroke: 'none',
                    'stroke-width': 0,
                    'stroke-opacity': 0
                }
            },

            series: {
                regions: [{
                    values: mapData,
                    scale: ['#AAAAAA', '#444444'],
                    normalizeFunction: 'polynomial'
                }]
            },
        });
    }
}
