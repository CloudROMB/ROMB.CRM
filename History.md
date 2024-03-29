2019-02-02
==========
  * В системное меню добавлен пункт *Настройки системы*
  * Компонент *KeyValueComponent*:
    - теперь умеет менять порядок элементов стрелками вверх/вниз
    - автоматически меняет значения в карточке документа
  * Исправлены ошибки в коде
  * Добавлена обработка исключений во многих методах
  * В меню пользователя добавлен пункт «Настройки системы», открывает компонент *SystemSettingsComponent*
  * На закладке **Администратор** компонента **SystemSettingsComponent** можно обновить компоненты платформы из репозитория
  * В меню пользователя добавлен пункт «Настройки системы», открывает компонент *SystemSettingsComponent*

2019-02-01
==========
  * Исправлены ошибки TypeScript в различных модулях
  * Добавлен компонент *SystemSettingsComponent*
  * Компонент *UserComponent* перенесен в модуль *SettingsModule*, и называется теперь *UserPageComponent*
  * Удален сервис *ChatService*
  * Добавлен компонент *NotFound404Component*, в котором далее необходимо оформить красивый вывод шаблона 

2019-01-31
==========
  * Задокументированы методы:
    - api.service#putDocument()
    - api.service#updateDocument()
  * Добавлено описание структуры карточки справочника по умолчанию *defaultStructureReference*
  * Из описания стркутуры *MetadataDocument* убрано поле *dbName*
  * Из фронта ушло упоминание поля метаданных *dbName*
  * В модуль *communications* добавлены компоненты:
    - Chat - для вывода чат-комнаты и переписки в ней
    - Chats - для отображения списка чат-комнат (переписок)
  * Виджет сообщений (в правом нижнем углу) теперь красный, когда нет соединения с сервером
  * В модуль *references* добавлен компонент справочника по умолчанию *reference.component.ts*
  * В *app.module* добавлены сервисы:
    - ChatService
    - SocketService
  * Добавлены обработчики ошибок при обновленнии списка в компоненте *TableLite*
  * В карточку документа реестра кредитных заявок добавлен чат.
  * В модули маршрутов добавлись маршруты по умолчанию (404)
  * Добавлена системная коллекция *_orders* для работы с шиной данных, управляющей обменом кредитными запросами в банки
  * Создан журнал кредитных запросов
  * В карточку кредитного запроса выведены все возможные поля
  * В меню выведен журнал кредитных запросов в банки
  * Пользователя выбрасывает из системы только в случае, когда ему отключен доступ в справочнике «Пользователи»
  * Удален компонент *messages.component*

2019-01-24_2
==========
  * Исправлена обработка результатов получения мандатов:
    - getRoleCredentials()
    - getCredentials()

2019-01-24
==========
  * Исправлена ошибка проверки *_id* в методе *saveCard()*, модуль *src/app/data-table/components/table.ts*

2019-01-23
==========
  * Отключен выброс пользователя, если он не залогинен
  * В связи с этим изменены методы:
    - postRequest()
    - postFormRequest()
    - getRequest()
  * *api.addDocument* теперь в свойстве *data* возвращает тело нового документа. Поэтому исправлены методы:
    - registerUser()
    - createReestrOrder()
  
2019-01-16
==========
  * Добавлен метод *getRoles()* в модуль *src/app/services/api.service.ts*
  
2019-01-14
==========
  * Добавлена модель карточки метаданных *MetadataDocument*, модуль *src/app/classes/datamodels.ts*
  * Добавлен пакет *@compodoc/compodoc* для формирования документации вызовом *npm run compodoc*
  * Добавлено глобальное перечисление *RequestMethods*, модуль *src/app/classes/types.ts*
  * Доработана карточка системного справочника *Метаданные*
  * Доработан метод *postRequest*, модуль *src/app/services/api.service.ts* — теперь 3-й параметр принимает объект с параметрами вызова метода
  * Добавлен пакет *socket.io-client*
  * Добавлен пакет *@types/socket.io-client*
  * Добавлен сервис *socket.service* в модуль *src/app/services/socket.service.spec.ts*
  * Добавлен сервис *chat.service* в модуль *src/app/services/chat.service.ts*
  * Добавлен компонент 'romb-bankorder' в модуль *src/app/orders/orders.module.ts* 

2019-01-07
==========
  * Методы debugLog() и errorLog() вынесены в *src/app/app.log.ts*
  * BUG: Компонент *src/app/modals/modal/* неверно управлял видимостью модального окна
  * Компонент *src/app/modals/modal/* исправлены стили цветов (приведение к цветам системы) 

2019-01-06
==========
  * Доработан глобальный метод debugLog для вывода отладочных сообщений в консоль только в режиме *development*. В дальнейшем для отладочных вызовов необходимо использовать его.
  * Добавлен глобальный метод errorLog для вывода отладочных сообщений в консоль со стеком вызова только в режиме *development*. В дальнейшем для отладочных вызовов необходимо использовать его.

2018-12-28
==========
  * Добавлен глобальный метод debugLog для вывода отладочных сообщений в консоль только в режиме *development*

2018-12-23
==========
  * В модуле api.service.ts созданы и задокументированы следующие CRUD методы для работы с журналом событий:
    - getLogList()
    - addLogRecord()
    - deleteLogRecord()

2018-12-21
==========

  * Исправлены ошибки в компонентах **data-table** 
  * Исправлена ошибка в компоненте **references/people** 
  * Добавлен компонент **references/brands**   
    - добавлен router **references/brands**
    - в модуль **reference/module** добавлен новый компонент
    - имплементирован вывод данных в DataTable из коллекции БД **brands**
    - создана карточка справочника
  * Добавлена таблица/коллекция **brands**
  * В коллекции метаданных добавлен документ **brands**
    - Добавлено обязательное поле mainPartner 
  * Добавлен NPM пакет для автодокументирования jsdoc
 
