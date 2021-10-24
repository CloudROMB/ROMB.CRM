// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import {Component, OnInit} from '@angular/core';

declare const swal: any;
declare const $: any;

@Component({
  selector: 'romb-calendar',
  templateUrl: 'calendar.component.html'
})

export class CalendarComponent implements OnInit {
  ngOnInit() {
    const $calendar = $('#fullCalendar');

    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();

    $calendar.fullCalendar({
      viewRender: function (view: any, element: any) {
        // We make sure that we activate the perfect scrollbar when the view isn't on Month
        if (view.name !== 'month') {
          const $fc_scroller = $('.fc-scroller');
          // $fc_scroller.perfectScrollbar();
        }
      },
      locale: 'ru',
      header: {
        // left: 'title',
        center: '',
        left: 'month, agendaDay, listWeek',
        right: 'prev, next, today'
      },
      defaultDate: today,
      selectable: true,
      selectHelper: true,
      views: {
        month: { // name of view
          titleFormat: 'MMMM YYYY'
          // other view-specific options here
        },
        week: {
          titleFormat: ' D MMMM YYYY'
        },
        day: {
          titleFormat: 'D MMM, YYYY'
        }
      },

      select: function (start: any, end: any) {

        // on select we show the Sweet Alert modal with an input
        swal({
          title: 'Создать напоминание',
          html: '<div class="form-group">' +
          '<input class="form-control" placeholder="Заголовок напоминания" id="input-field">' +
          '</div>',
          showCancelButton: true,
          confirmButtonClass: 'btn btn-success',
          cancelButtonClass: 'btn btn-danger',
          confirmButtonText: 'Сохранить',
          cancelButtonText: 'Отмена',
          buttonsStyling: false
        }).then(function (result: any) {
          let eventData;
          const event_title = $('#input-field').val();

          if (event_title) {
            eventData = {
              title: event_title,
              start: start,
              end: end
            };
            $calendar.fullCalendar('renderEvent', eventData, true); // stick? = true
          }

          $calendar.fullCalendar('unselect');

        });
      },
      editable: true,
      eventLimit: true, // allow "more" link when too many events


      // color classes: [ event-blue | event-azure | event-green | event-orange | event-red ]
      events: [
        {
          title: 'All Day Event',
          start: new Date(y, m, 1),
          className: 'event-default'
        },
        {
          id: 999,
          title: 'Repeating Event',
          start: new Date(y, m, d - 4, 6, 0),
          allDay: false,
          className: 'event-rose'
        },
        {
          id: 999,
          title: 'Repeating Event',
          start: new Date(y, m, d + 3, 6, 0),
          allDay: false,
          className: 'event-rose'
        },
        {
          title: 'Meeting',
          start: new Date(y, m, d - 1, 10, 30),
          allDay: false,
          className: 'event-green'
        },
        {
          title: 'Lunch',
          start: new Date(y, m, d + 7, 12, 0),
          end: new Date(y, m, d + 7, 14, 0),
          allDay: false,
          className: 'event-red'
        },
        {
          title: 'Md-pro Launch',
          start: new Date(y, m, d - 2, 12, 0),
          allDay: true,
          className: 'event-azure'
        },
        {
          title: 'Birthday Party',
          start: new Date(y, m, d + 1, 19, 0),
          end: new Date(y, m, d + 1, 22, 30),
          allDay: false,
          className: 'event-azure'
        },
        {
          title: 'FRESHCREDIT',
          start: new Date(y, m, 21),
          end: new Date(y, m, 22),
          url: 'http://www.ru/',
          className: 'event-orange'
        },
        {
          title: 'Click for Google',
          start: new Date(y, m, 21),
          end: new Date(y, m, 22),
          url: 'http://www.ru/',
          className: 'event-orange'
        }
      ]
    });
  }
}
