import { findUserById, getAllUserIds } from "./users";

export interface PublicAuthor {
  username: string;
  bio: string;
  image: string | null;
  following: boolean;
}

export interface PublicArticle {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: PublicAuthor;
}

interface ArticleRecord {
  id: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  authorId: number;
  favoritedBy: Set<number>;
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const seededArticles: Omit<ArticleRecord, "id" | "authorId" | "favoritedBy">[] =
  [
    {
      slug: "mini-otpusk-ne-vyhodya-dalshe-balkona",
      title: "Как устроить себе мини-отпуск, не уходя дальше балкона",
      description: "Идеи, как сменить обстановку, не покидая дом.",
      body: `Иногда хочется в отпуск прямо сейчас, но у календаря и кошелька на это другое мнение.
Тогда можно устроить «домашний курорт».

Плед, любимый напиток, музыка из плейлиста «пляж» или «горы», отключённые уведомления и табличка «я в отпуске» в мессенджере.
Да, это не море. Зато не нужно стоять в очереди на посадку и искать зарядку в аэропорту.`,
      tagList: ["отдых", "дом", "юмор"],
      createdAt: "2026-01-12T09:00:00.000Z",
      updatedAt: "2026-01-12T09:00:00.000Z",
    },
    {
      slug: "razgovor-s-soboy-dialogi-v-golove",
      title: "Разговор с самим собой: почему мы все немного диалоги в голове",
      description:
        "Весёлый взгляд на внутреннего комментатора, который не замолкает.",
      body: `У каждого есть голос в голове, который то критикует, то шутит, то спорит сам с собой.
Иногда с ним можно даже посоветоваться — выглядит странно, но помогает.

В статье я предлагаю относиться к этому голосу как к персонажу: дать ему имя, характер и научиться договариваться.
Когда внутренний собеседник начинает не только ругать, но и подбадривать, жить становится заметно спокойнее и веселее.`,
      tagList: ["психология", "юмор", "самоирония"],
      createdAt: "2026-01-13T09:00:00.000Z",
      updatedAt: "2026-01-13T09:00:00.000Z",
    },
    {
      slug: "potantsevat-poka-nikto-ne-vidit",
      title: "Почему иногда полезно потанцевать, пока никто не видит",
      description: "О пользе неловких танцев на кухне под любимую песню.",
      body: `Вы включаете музыку, случайно попадается бодрый трек — и ноги сами хотят что-то сделать.
Вот в этот момент лучше не сдерживаться.

Пара минут нелепых движений на кухне снимают зажимы лучше многих упражнений.
Никто не ставит оценки, не снимает на видео и не сравнивает вас с профессионалами.
Зато настроение подскакивает, а тело вспоминает, что умеет не только сидеть.`,
      tagList: ["музыка", "настроение", "движение"],
      createdAt: "2026-01-14T09:00:00.000Z",
      updatedAt: "2026-01-14T09:00:00.000Z",
    },
    {
      slug: "sila-smeshnyh-noskov",
      title: "Сила смешных носков: маленький бунт против серьёзного мира",
      description: "Почему забавный рисунок на носках иногда спасает день.",
      body: `Жизнь полна серьёзных писем, строгих лиц и важных дел.
В такие моменты приятно знать, что под официальными брюками скрываются носки с котами или динозаврами.

Это маленький секрет, который можно носить с собой куда угодно.
Он не решает проблемы, но добавляет пару очков смелости и даёт почувствовать, что вы всё ещё умеете играть.`,
      tagList: ["юмор", "стиль", "мелочи"],
      createdAt: "2026-01-15T09:00:00.000Z",
      updatedAt: "2026-01-15T09:00:00.000Z",
    },
    {
      slug: "iskusstvo-nichego-ne-delat-pyat-minut",
      title: "Искусство ничего не делать… хотя бы пять минут",
      description: "Весёлое руководство по «официальному безделью».",
      body: `Мы привыкли что-то делать всегда: слушать, смотреть, листать, отвечать.
Попробуйте эксперимент: пять минут вообще ничего — смотреть в потолок, в окно или на стену.

Мозг вначале возмущается и предлагает срочно проверить телефон.
Но если выдержать, появляется странное лёгкое чувство: оказывается, мир не рухнул, пока вы ничем не занимались.
Можно даже назвать это «стратегической паузой» — звучит солиднее, чем «я залип».`,
      tagList: ["отдых", "юмор", "осознанность"],
      createdAt: "2026-01-16T09:00:00.000Z",
      updatedAt: "2026-01-16T09:00:00.000Z",
    },
    {
      slug: "domashnie-rasteniya-real-life-sims",
      title: "Почему домашние растения — это немного реал-лайф-симс",
      description:
        "Наблюдения о том, как мы играем в «жизнь» с цветами на подоконнике.",
      body: `Выбираешь растение, придумываешь ему место, подбираешь горшок, режим полива и освещения.
Звучит подозрительно похоже на знакомый симулятор, только с настоящей землёй.

Когда цветок выпускает новый лист, это ощущается почти как апгрейд персонажа.
А если кто-то завял, мы торжественно обещаем: «со следующего буду обращаться как с королём».
Главное — не относиться к этому слишком серьёзно и помнить, что растения тоже иногда просто устают от людей.`,
      tagList: ["растения", "юмор", "дом"],
      createdAt: "2026-01-17T09:00:00.000Z",
      updatedAt: "2026-01-17T09:00:00.000Z",
    },
    {
      slug: "progulka-bez-tseli-ohota-za-strannostyami",
      title: "Как прогулка без цели превращается в охоту за странностями",
      description: "Идея гулять не по делам, а ради забавных деталей вокруг.",
      body: `Обычно мы идём куда-то: в магазин, на работу, домой.
Предлагаю иногда идти «никуда» — просто смотреть по сторонам.

Можно собирать коллекцию странных вывесок, смешных надписей на машинах, необычных балконов и собак с характером.
Такие охоты за мелочами делают город менее серым и добавляют тему для рассказа друзьям: «Знаешь, что я сегодня увидел…»`,
      tagList: ["прогулки", "наблюдения", "юмор"],
      createdAt: "2026-01-18T09:00:00.000Z",
      updatedAt: "2026-01-18T09:00:00.000Z",
    },
    {
      slug: "lichnyy-prazdnik-bez-povoda-den-ogurtsa",
      title: "Личный праздник без повода: как устроить себе «день огурца»",
      description:
        "Весёлая идея придумывать случайный праздник и отмечать его по-своему.",
      body: `Зачем ждать официальных дат, если можно объявить сегодня «днём пледа», «днём зелёного цвета» или хоть «днём огурца»?
Правило простое: выбираете тему и добавляете её в мелочах.

Например, «день огурца»: салат с огурцами, зелёная футболка и забавная картинка в мессенджере.
Глупо? Да. Но мозгу всё равно нужен повод, чтобы чуть выйти из рутины.
Такие маленькие праздники делают календарь менее скучным и напоминают, что вы имеете право на игру.`,
      tagList: ["праздник", "юмор", "настроение"],
      createdAt: "2026-01-19T09:00:00.000Z",
      updatedAt: "2026-01-19T09:00:00.000Z",
    },
    {
      slug: "kak-utrennie-privychki-vliyayut-na-nastroenie-dnya",
      title: "Как утренние привычки влияют на настроение дня",
      description:
        "Простые действия после пробуждения, которые задают тон всему дню.",
      body: `Многие замечают, что первые минут тридцать после пробуждения определяют, каким будет весь день.
Кто-то сразу хватает телефон, кто-то делает зарядку или пьёт воду.

В статье я разбираю несколько простых утренних привычек: стакан воды, короткая разминка, проветривание комнаты и план на день из трёх задач.
Эти действия занимают меньше десяти минут, но заметно снижают уровень стресса и помогают чувствовать больше контроля над своей жизнью.`,
      tagList: ["привычки", "утро", "настроение"],
      createdAt: "2026-01-20T09:00:00.000Z",
      updatedAt: "2026-01-20T09:00:00.000Z",
    },
    {
      slug: "pochemu-my-ustaem-ot-obscheniya-i-kak-vosstanovitsya",
      title:
        "Почему мы устаём от общения и как восстановиться интровертам и экстравертам",
      description:
        "О том, почему даже приятные встречи могут выматывать и что с этим делать.",
      body: `Иногда после шумной компании или даже дружеской встречи хочется просто молчать и побыть одному.
Это нормально: мозг обрабатывает массу сигналов, эмоций и информации, и ему нужно время на «перезагрузку».

В статье я рассказываю, чем усталость от общения отличается от обычной усталости, почему она бывает и у интровертов, и у экстравертов.
Даю несколько способов восстановления: короткая прогулка в одиночестве, «тихий час» без телефона и честное планирование числа встреч в неделю.`,
      tagList: ["общение", "психология", "усталость"],
      createdAt: "2026-01-21T09:00:00.000Z",
      updatedAt: "2026-01-21T09:00:00.000Z",
    },
    {
      slug: "malenkie-progulki-kak-15-minut-na-ulitse-menyayut-samochuvstvie",
      title: "Маленькие прогулки: как 15 минут на улице меняют самочувствие",
      description:
        "О пользе коротких ежедневных прогулок даже в загруженном расписании.",
      body: `Кажется, что для пользы нужны часовые тренировки или длинные пробежки.
Но уже 10–15 минут спокойной ходьбы на улице заметно улучшают концентрацию и снижают тревожность.

Я делюсь опытом, как встроить такие мини-прогулки в день: выйти на одну остановку раньше, пройтись во время разговора по телефону или сделать круг по кварталу после еды.
Регулярность оказывается важнее длительности: лучше каждый день понемногу, чем раз в неделю «героический марш-бросок».`,
      tagList: ["здоровье", "прогулки", "привычки"],
      createdAt: "2026-01-22T09:00:00.000Z",
      updatedAt: "2026-01-22T09:00:00.000Z",
    },
    {
      slug: "kak-perestat-otkladyvat-dela-kotorye-zanimayut-pyat-minut",
      title: "Как перестать откладывать дела, которые занимают пять минут",
      description:
        "Разбор феномена «сделаю потом» и приём, который помогает с этим бороться.",
      body: `Мелкие дела вроде «позвонить», «написать сообщение» или «вынести мусор» часто тянутся днями, хотя объективно занимают пару минут.
Причина не только в лени, но и в том, что мозг воспринимает любое действие как переключение контекста, а это требует усилий.

В статье я описываю правило «двух минут»: если задача действительно укладывается в это время, её лучше сделать сразу.
Через пару недель такой практики список хвостов заметно сокращается, а ощущение постоянного «долга» перед делами становится слабее.`,
      tagList: ["продуктивность", "прокрастинация", "самоорганизация"],
      createdAt: "2026-01-23T09:00:00.000Z",
      updatedAt: "2026-01-23T09:00:00.000Z",
    },
    {
      slug: "zachem-nam-hobbi-kotoroe-ne-prinosit-deneg",
      title: "Зачем нам хобби, которое не приносит денег",
      description:
        "Почему полезно иметь занятие «просто для души», без цели монетизации.",
      body: `В мире, где всё предлагается превращать в источник дохода, хобби без денег кажется бесполезным.
Но именно такие занятия дают ощущение игры и свободы: можно ошибаться, бросать и возвращаться, не чувствуя вины.

Я разбираю, как хобби снижает уровень стресса, расширяет кругозор и помогает лучше понимать себя.
А ещё объясняю, почему не стоит специально искать «полезное» увлечение — достаточно того, что оно даёт радость и переключает внимание.`,
      tagList: ["хобби", "стресс", "баланс"],
      createdAt: "2026-01-24T09:00:00.000Z",
      updatedAt: "2026-01-24T09:00:00.000Z",
    },
    {
      slug: "minimalizm-v-veschah-kak-ya-perestal-hranit-na-vsyakiy-sluchay",
      title: "Минимализм в вещах: как я перестал хранить «на всякий случай»",
      description:
        "Личный опыт расхламления дома и его влияние на ощущение свободы.",
      body: `Годы складывания вещей «вдруг пригодится» превращают квартиру в склад.
Каждая мелочь занимает не только место, но и внимание: мы помним, где это лежит, и иногда мысленно к этому возвращаемся.

Я рассказываю, как начал методично разбирать шкафы по принципу «оставить только нужное и любимое».
Через несколько недель дом стал визуально легче, уборка занимает меньше времени, а лишнее чувство «надо разобрать» постепенно ушло.`,
      tagList: ["минимализм", "дом", "организация"],
      createdAt: "2026-01-25T09:00:00.000Z",
      updatedAt: "2026-01-25T09:00:00.000Z",
    },
    {
      slug: "malenkie-radosti-zachem-planirovat-priyatnye-melochi-zaranee",
      title: "Маленькие радости: зачем планировать приятные мелочи заранее",
      description:
        "Как осознанно добавлять в дни простые вещи, которые поднимают настроение.",
      body: `Часто мы ждём «чего-то большого», чтобы почувствовать себя лучше: отпуска, крупной покупки или важного события.
Но эмоциональный фон больше завязан на мелочах: вкусном чае, разговоре с приятным человеком, любимой музыке.

В статье я предлагаю относиться к этим мелочам как к задачам в календаре: заранее планировать что-то приятное хотя бы раз в день.
Так жизнь перестаёт быть ожиданием редких праздников и становится чуть более комфортной уже сейчас.`,
      tagList: ["настроение", "привычки", "осознанность"],
      createdAt: "2026-01-26T09:00:00.000Z",
      updatedAt: "2026-01-26T09:00:00.000Z",
    },
    {
      slug: "kak-sotsialnye-seti-vliyayut-na-samootsenku",
      title:
        "Как социальные сети влияют на самооценку и что можно с этим сделать",
      description:
        "О сравнении себя с другими и простых способах снизить влияние ленты.",
      body: `Лента соцсетей часто показывает чужие лучшие моменты: путешествия, успехи, красивую картинку жизни.
На этом фоне собственные обычные дни начинают казаться слишком скучными и «недостаточными».

В статье я обсуждаю, почему сравнение с образами из сети почти всегда проигрышно и как можно легче к этому относиться.
Помогают небольшие шаги: ограничение времени в приложениях, «детокс» от подписок, которые вызывают зависть или раздражение, и переключение внимания на реальные действия в своей жизни.`,
      tagList: ["социальные-сети", "самооценка", "психология"],
      createdAt: "2026-01-27T09:00:00.000Z",
      updatedAt: "2026-01-27T09:00:00.000Z",
    },
    {
      slug: "pochemu-nam-tak-slozhno-prosit-o-pomoschi",
      title: "Почему нам так сложно просить о помощи",
      description:
        "Разбор причин, из-за которых люди предпочитают справляться в одиночку.",
      body: `Многим неловко попросить помощи, даже если ситуация давно вышла из-под контроля.
Кажется, что это признак слабости или некомпетентности, и лучше «как-нибудь самому».

Я рассматриваю несколько причин такого поведения: страх отказа, привычка быть «удобным» и опыт, когда просьбы игнорировали.
Также привожу мягкие формулировки, которые помогают начать разговор и не выглядят как давление на другого человека.`,
      tagList: ["психология", "общение", "поддержка"],
      createdAt: "2026-01-28T09:00:00.000Z",
      updatedAt: "2026-01-28T09:00:00.000Z",
    },
    {
      slug: "iskusstvo-delat-pauzy-pochemu-otdyh-tozhe-delo",
      title: "Искусство делать паузы: почему отдых — тоже дело",
      description:
        "О важности запланированного отдыха и умении ничего не делать без чувства вины.",
      body: `Многие воспринимают отдых как что-то второстепенное: сначала дела, потом, если останутся силы и время, можно расслабиться.
Из-за этого даже во время перерыва появляется чувство вины и желание «быстрее вернуться к делу».

В статье я объясняю, почему мозгу нужен не только сон, но и короткие осознанные паузы в течение дня.
Привожу идеи простого отдыха: пять минут смотреть в окно, сменить позу, сделать пару глубоких вдохов и не трогать телефон.
Со временем такое отношение к паузам снижает ощущение постоянной гонки и делает работу устойчивее.`,
      tagList: ["отдых", "баланс", "здоровье"],
      createdAt: "2026-01-29T09:00:00.000Z",
      updatedAt: "2026-01-29T09:00:00.000Z",
    },
    {
      slug: "kak-ya-ushel-iz-ofisa-i-stal-frontend-razrabotchikom",
      title: "Как я перешёл из офиса в продуктовую фронтенд-разработку",
      description:
        "Практический разбор перехода в IT и роста до уверенного уровня в коммерческой разработке.",
      body: `Несколько лет назад я сменил офисную роль на фронтенд в продуктовой команде.
Сфокусировался на системной практике: регулярный код, рабочие задачи, код-ревью и разбор архитектурных решений.
Постепенно собрал портфолио из реальных кейсов, усилил базу по JavaScript и научился доводить фичи до продакшн-качества.
В статье рассказываю, какие навыки действительно ускорили рост, какие форматы обучения дали максимальную отдачу и как выстроить устойчивый план развития.`,
      tagList: ["career", "frontend", "self-education"],
      createdAt: "2026-01-30T09:00:00.000Z",
      updatedAt: "2026-01-30T09:00:00.000Z",
    },
    {
      slug: "stoit-li-v-2025-godu-uchit-chistyy-javascript",
      title: "Стоит ли в 2025 году учить чистый JavaScript",
      description:
        "Почему знание нативного JS по-прежнему важно, даже если вы пишете на React.",
      body: `Кажется, что сегодня всё крутится вокруг фреймворков: React, Vue, Svelte.
Но как только что-то ломается «под капотом», без понимания нативного JavaScript вы быстро упираетесь в потолок.
В статье разбираю, какие темы из чистого JS необходимы фронтендеру: замыкания, контекст this, прототипы, работа с DOM и событиями.
Показываю на простых примерах, как эти знания помогают писать более предсказуемый и короткий код в любом фреймворке.`,
      tagList: ["javascript", "basics", "frontend"],
      createdAt: "2026-01-31T09:00:00.000Z",
      updatedAt: "2026-01-31T09:00:00.000Z",
    },
    {
      slug: "moy-chek-list-pered-otpravkoy-proekta-na-github",
      title: "Мой чек-лист перед отправкой проекта на GitHub",
      description:
        "Список из практических пунктов, который я прохожу перед каждым пушем в публичный репозиторий.",
      body: `Со временем я заметил, что перед публикацией проекта повторяю одни и те же действия.
Проверяю настройки ESLint и Prettier, очищаю консоль-логи, наводку в README, актуальность скриптов в package.json.
Собрал всё в один чек-лист: что проверить в коде, что — в конфигурациях, и что — в описании репозитория.
Этот список помогает не стыдиться своего GitHub перед рекрутерами и экономит время на будущих правках.`,
      tagList: ["github", "checklist", "productivity"],
      createdAt: "2026-02-01T09:00:00.000Z",
      updatedAt: "2026-02-01T09:00:00.000Z",
    },
    {
      slug: "pochemu-side-proekty-vazhnee-ocherednogo-kursa",
      title: "Почему side-проекты важнее очередного курса",
      description:
        "Аргументы в пользу того, чтобы меньше смотреть уроки и больше писать свой код.",
      body: `Курсы дают структуру и мотивацию, но часто создают иллюзию прогресса.
Вы проходите десятки модулей, а на реальный проект всё равно страшно посмотреть.
Собственный side-проект ломает этот круг: вы сталкиваетесь с ошибками, которых нет в учебниках, и учитесь решать их сами.
В статье я рассказываю, как придумать проект под свой уровень, не перегореть и довести его до более-менее «продового» состояния.`,
      tagList: ["side-projects", "learning", "motivation"],
      createdAt: "2026-02-02T09:00:00.000Z",
      updatedAt: "2026-02-02T09:00:00.000Z",
    },
    {
      slug: "kak-ya-uskoril-verstku-ispolzuya-komponenty-i-dizayn-sistemu",
      title: "Как я ускорил верстку, используя компоненты и дизайн-систему",
      description:
        "Опыт перехода от «каждая страница с нуля» к переиспользуемым компонентам.",
      body: `Раньше каждую страницу я верстал почти с чистого листа: новые классы, новые отступы, новые цвета.
В какой-то момент проект начал рассыпаться, а правки превращались в боль.
Я выделил базовые элементы: кнопки, инпуты, карточки, сетки, и вынес их в отдельную дизайн-систему.
Теперь новые страницы собираются как конструктор, а стили остаются единообразными и прогнозируемыми.`,
      tagList: ["css", "design-system", "components"],
      createdAt: "2026-02-03T09:00:00.000Z",
      updatedAt: "2026-02-03T09:00:00.000Z",
    },
    {
      slug: "zachem-frontenderu-pisat-testy-i-s-chego-voobsche-nachat",
      title: "Зачем фронтендеру писать тесты и с чего вообще начать",
      description:
        "Короткое объяснение, какие тесты действительно приносят пользу в реальных проектах.",
      body: `Когда я впервые услышал про unit-тесты, интеграционные и e2e, казалось, что это отдельная вселенная.
На практике оказалось, что больше всего вывозят простые вещи: тестирование чистых функций и ключевых пользовательских сценариев.
В статье я показываю, какие именно части фронтенда стоит покрывать тестами в первую очередь, а на что можно не тратить время.
Примеры даю на уровне идеи, без сложной конфигурации — чтобы можно было начать уже сегодня.`,
      tagList: ["testing", "frontend", "best-practices"],
      createdAt: "2026-02-04T09:00:00.000Z",
      updatedAt: "2026-02-04T09:00:00.000Z",
    },
    {
      slug: "kak-ya-oformlyayu-readme-chtoby-ego-dochityvali-do-kontsa",
      title: "Как я оформляю README, чтобы его дочитывали до конца",
      description:
        "Структура README для рабочего или open-source проекта, понятная команде и менеджменту.",
      body: `README — это витрина проекта, но многие ограничиваются одной строкой «my cool app».
Я начал относиться к README как к мини-лендингу: короткий заголовок, список фич, стек технологий, скриншоты и ссылка на деплой.
Добавляю блок «Как запустить локально» и пару слов о том, какие решения принимались в архитектуре.
Такой README экономит время людям, которые смотрят мой код, и повышает шанс, что проект действительно откроют.`,
      tagList: ["readme", "documentation", "portfolio"],
      createdAt: "2026-02-05T09:00:00.000Z",
      updatedAt: "2026-02-05T09:00:00.000Z",
    },
    {
      slug: "chem-polezen-linter-i-pochemu-ya-bolshe-ne-pishu-bez-eslint",
      title: "Чем полезен линтер и почему я больше не пишу без ESLint",
      description:
        "Как автоматические проверки кода спасают от глупых ошибок и экономят время на ревью.",
      body: `Сначала ESLint казался мне просто ещё одной сложной настройкой.
Но после пары крупных проектов я понял, что линтер снимает с головы десятки мелких решений: где ставить точку с запятой, как именовать переменные, какие хуки React можно вызывать.
В статье объясняю, какие правила я включаю первым делом, как настраиваю форматирование и зачем всё это нужно даже в небольшом рабочем проекте.
Когда большую часть стиля кода контролирует инструмент, вам остаётся думать о логике, а не о пробелах.`,
      tagList: ["eslint", "tooling", "code-quality"],
      createdAt: "2026-02-06T09:00:00.000Z",
      updatedAt: "2026-02-06T09:00:00.000Z",
    },
    {
      slug: "react-ili-nextjs-chto-vybrat-dlya-sereznogo-proekta",
      title: "React или Next.js: что выбрать для проекта",
      description:
        "Сравнение подхода «чистый React + Vite» и Next.js на примере продуктовой разработки.",
      body: `Сегодня разработчик быстро сталкивается с выбором: писать на чистом React или сразу брать Next.js.
В статье разбираю, какие задачи решает Next: маршрутизация, SSR, SEO, оптимизация картинок, а что остаётся тем же самым React.
Показываю, когда проще стартовать с Vite и минимальной конфигурацией, а когда выгоднее сразу брать фреймворк.
В конце даю несколько сценариев: «портфолио-лендинг», «дашборд» и «блог» — и предлагаю вариант стека под каждый из них.`,
      tagList: ["react", "nextjs", "stack-choice"],
      createdAt: "2026-02-07T09:00:00.000Z",
      updatedAt: "2026-02-07T09:00:00.000Z",
    },
  ];

let nextArticleId = 1;

const VIRTUAL_LIKER_START_ID = 10_000;
const VIRTUAL_LIKER_POOL_SIZE = 120;

const virtualLikerIds = Array.from(
  { length: VIRTUAL_LIKER_POOL_SIZE },
  (_unused, index) => VIRTUAL_LIKER_START_ID + index,
);

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = <T>(input: T[]): T[] => {
  const output = [...input];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
};

const createInitialLikes = (authorId: number): Set<number> => {
  const realUserIds = getAllUserIds().filter((userId) => userId !== authorId);
  const candidateUserIds = [...realUserIds, ...virtualLikerIds];

  if (candidateUserIds.length === 0) {
    return new Set<number>();
  }

  const maxLikes = Math.min(30, candidateUserIds.length);
  const likesCount = randomInt(1, maxLikes);
  return new Set<number>(shuffleArray(candidateUserIds).slice(0, likesCount));
};

const articles: ArticleRecord[] = seededArticles.map((article) => ({
  id: nextArticleId++,
  slug: article.slug,
  title: article.title,
  description: article.description,
  body: article.body,
  tagList: [...article.tagList],
  createdAt: article.createdAt,
  updatedAt: article.updatedAt,
  authorId: 1,
  favoritedBy: createInitialLikes(1),
}));

const toPublicArticle = (
  article: ArticleRecord,
  viewerId?: number,
): PublicArticle => {
  const author = findUserById(article.authorId);
  const safeAuthor = author ?? {
    username: "unknown",
    bio: "",
    image: null,
  };

  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: [...article.tagList],
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    favorited:
      typeof viewerId === "number" ? article.favoritedBy.has(viewerId) : false,
    favoritesCount: article.favoritedBy.size,
    author: {
      username: safeAuthor.username,
      bio: safeAuthor.bio,
      image: safeAuthor.image,
      following: false,
    },
  };
};

const toSlugBase = (title: string): string => {
  const transliterated = title
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("");

  const slug = transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "article";
};

const ensureUniqueSlug = (slugBase: string): string => {
  let slug = slugBase;
  let suffix = 1;
  while (articles.some((article) => article.slug === slug)) {
    slug = `${slugBase}-${suffix++}`;
  }
  return slug;
};

export const getArticleRecordBySlug = (
  slug: string,
): ArticleRecord | undefined =>
  articles.find((article) => article.slug === slug);

export const isArticleAuthor = (slug: string, userId: number): boolean => {
  const article = getArticleRecordBySlug(slug);
  return Boolean(article && article.authorId === userId);
};

export const listArticles = (
  limit: number,
  offset: number,
  viewerId?: number,
): { articles: PublicArticle[]; articlesCount: number } => {
  const sorted = [...articles].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  const sliced = sorted.slice(offset, offset + limit);

  return {
    articles: sliced.map((article) => toPublicArticle(article, viewerId)),
    articlesCount: articles.length,
  };
};

export const getPublicArticleBySlug = (
  slug: string,
  viewerId?: number,
): PublicArticle | undefined => {
  const article = getArticleRecordBySlug(slug);
  if (!article) {
    return undefined;
  }
  return toPublicArticle(article, viewerId);
};

type CreateArticlePayload = {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
};

export const createArticle = (
  authorId: number,
  payload: CreateArticlePayload,
  viewerId?: number,
): PublicArticle => {
  const now = new Date().toISOString();
  const slug = ensureUniqueSlug(toSlugBase(payload.title));

  const article: ArticleRecord = {
    id: nextArticleId++,
    slug,
    title: payload.title,
    description: payload.description,
    body: payload.body,
    tagList: Array.isArray(payload.tagList)
      ? payload.tagList.filter((tag): tag is string => typeof tag === "string")
      : [],
    createdAt: now,
    updatedAt: now,
    authorId,
    favoritedBy: new Set<number>(),
  };

  articles.push(article);
  return toPublicArticle(article, viewerId);
};

type UpdateArticlePayload = {
  title?: string;
  description?: string;
  body?: string;
  tagList?: string[];
};

export const updateArticle = (
  slug: string,
  payload: UpdateArticlePayload,
  viewerId?: number,
): PublicArticle | undefined => {
  const article = getArticleRecordBySlug(slug);
  if (!article) {
    return undefined;
  }

  if (typeof payload.title === "string" && payload.title.trim()) {
    article.title = payload.title.trim();
  }
  if (typeof payload.description === "string" && payload.description.trim()) {
    article.description = payload.description.trim();
  }
  if (typeof payload.body === "string" && payload.body.trim()) {
    article.body = payload.body.trim();
  }
  if (Array.isArray(payload.tagList)) {
    article.tagList = payload.tagList.filter(
      (tag): tag is string => typeof tag === "string",
    );
  }

  article.updatedAt = new Date().toISOString();

  return toPublicArticle(article, viewerId);
};

export const deleteArticle = (slug: string): boolean => {
  const index = articles.findIndex((article) => article.slug === slug);
  if (index < 0) {
    return false;
  }

  articles.splice(index, 1);
  return true;
};

export const favoriteArticle = (
  slug: string,
  userId: number,
): PublicArticle | undefined => {
  const article = getArticleRecordBySlug(slug);
  if (!article) {
    return undefined;
  }
  article.favoritedBy.add(userId);
  return toPublicArticle(article, userId);
};

export const unfavoriteArticle = (
  slug: string,
  userId: number,
): PublicArticle | undefined => {
  const article = getArticleRecordBySlug(slug);
  if (!article) {
    return undefined;
  }
  article.favoritedBy.delete(userId);
  return toPublicArticle(article, userId);
};
