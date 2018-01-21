/**
 * @typedef {Object} Person
 * @property {String} login Идентификатор сотрудника.
 * @property {Number} floor "Домашний" этаж сотрудника.
 * @property {String} avatar Ссылка на аватар.
 */

/**
 * @typedef {Object} Room
 * @property {Number} id Идентификатор переговорки.
 * @property {String} title Название переговорки.
 * @property {Number} capacity Вместимость (количество человек).
 * @property {Number} floor Этаж, на котором расположена переговорка.
 */

/**
 * @typedef {Object} EventDate
 * @property {Number} start Timestamp начала встречи.
 * @property {Number} end Timestamp окончания встречи.
 */

/**
 * @typedef {Object} Event
 * @property {String} id Идентификатор встречи.
 * @property {String} title Название встречи.
 * @property {String[]} members Логины участников встречи.
 * @property {EventDate} date Дата и время проведения встречи.
 * @property {Number} room Идентификатор переговорки.
 */

/**
 * @typedef {Object} RoomsSwap
 * @property {string} event Идентификатор встречи.
 * @property {String} room Новый идентификатор переговорки.
 */

/**
 * @typedef {Object} Recommendation
 * @property {EventDate} date Дата и время проведения встречи.
 * @property {String} room Идентификатор переговорки.
 * @property {RoomsSwap[]} [swap] Необходимые замены переговорк для реализации рекомендации.
 */

/**
 * @param {EventDate} date Дата планируемой встречи.
 * @param {Person[]} members Участники планируемой встречи.
 * @param {Object} db
 * @param {Event[]} db.events Список все встреч.
 * @param {Room[]} db.rooms Список всех переговорок.
 * @returns {Recommendation[]}
 */

var date = {
  start: "2017-12-13T13:15:00.000Z",
  end: "2017-12-13T15:15:00.000Z"
};

function getRecommendation(date, members, db) {

  // Я не нашла способа запросить данные с сервера для конкретной даты, поэтому просто задаю одну дату, используемую в БД

  var suitable = {};
  var eventsInSameTime = [];
  var swaps = [];

  var calculatesPassedFloors = function (roomFloor, membersEvent) {
    var sumPassedFloor = 0;
    for (var i = 0; i < membersEvent.length; i++) {
      sumPassedFloor += Math.abs(membersEvent[i].homeFloor - roomFloor);
    };
    return sumPassedFloor;
  };

  var sortingRooms = function (output) {
    for (var i = 0; i < output.roomsIndexes.length - 1; i++) {
      var min = output.passedFloors[i];
      for (var j = i + 1; j < output.roomsIndexes.length; j++) {
        if (output.passedFloors[j] < min) {
          min = output.passedFloors[j];
          output.passedFloors[j] = output.passedFloors[i];
          output.passedFloors[i] = min;
          var swapIndex = output.roomsIndexes[j];
          output.roomsIndexes[j] = output.roomsIndexes[i];
          output.roomsIndexes[i] = swapIndex;
        };
      };
    };
  };

  var searchSuitableRoom = function (start, end, membersArray, ignoreEvent) {
    var startOfDay = Date.parse(start.slice(0, 11) + "03:30:00.000Z");
    var startEvent = Math.floor((Date.parse (start) - startOfDay) / 900000);
    var endEvent = Math.floor((Date.parse (end) - startOfDay) / 900000);
    var result = {
      roomsIndexes: [],
      passedFloors: [],
      eventsInSameTime: []
    };
    var eventsIndexes = [];

    for (var i = 0; i < db.rooms.length; i++) {
      var freeSlot = 0;
      if (db.rooms[i].capacity >= membersArray.length) {
        for (var j = startEvent; j < endEvent; j++) {
          if (!db.rooms[i].segments[j]) {
            freeSlot++;
          } else {
            if (ignoreEvent) {
              if (db.rooms[i].segments[j] === ignoreEvent) {
                freeSlot++;
              } else {
                eventsIndexes.push(db.rooms[i].segments[j]);
              };
            } else {
              eventsIndexes.push(db.rooms[i].segments[j]);
            };
          };
        };
      };

      if (freeSlot === (endEvent - startEvent)) {
        result.roomsIndexes.push(i);
        result.passedFloors.push(calculatesPassedFloors (db.rooms[i].floor, membersArray));
      };
    };

    for (var i = 0; i < eventsIndexes.length; i++) {
      if (eventsIndexes[i] != null) {
        result.eventsInSameTime.push(eventsIndexes[i]);
      };
      for (var j = i + 1; j < eventsIndexes.length; j++) {
        if (eventsIndexes[j] === eventsIndexes[i]) {
          eventsIndexes[j] = null;
        };
      };
    };

    sortingRooms (result);
    return result;
  };

  suitable = searchSuitableRoom (date.start, date.end, members);

  if (suitable.roomsIndexes.length === 0) {
    console.log("Для всречи с 17:15 до 19:15 свободных переговорок нет, нужен перенос встреч:");

    var suitableSwap = [];
    var suitableVariant;

    for (var i = 0; i < suitable.eventsInSameTime.length; i++) {
      var index = suitable.eventsInSameTime[i];
      suitableSwap = searchSuitableRoom (db.events[index].dateStart, db.events[index].dateEnd, db.events[index].users);

      if (suitableSwap.roomsIndexes.length != 0) {
        suitableVariant = searchSuitableRoom (date.start, date.end, members, index);
        if (suitableVariant.roomsIndexes.length != 0) {
          var swapVariant = {
            eventSwap: db.events[index].id,
            newRoom: suitableSwap.roomsIndexes[0],

            eventName: db.events[index].title, // для просмотра теста в консоли
            roomName: db.rooms[suitableSwap.roomsIndexes[0]].title // для просмотра теста в консоли
          };
          swaps.push(swapVariant);
          suitable.roomsIndexes = suitable.roomsIndexes.concat(suitableVariant.roomsIndexes);
          suitable.passedFloors = suitable.passedFloors.concat(suitableVariant.passedFloors);

          console.log("Встречу \"" + swapVariant.eventName + "\" можно перенести в переговорку \"" + swapVariant.roomName + "\"");
          swaps.push(swapVariant);
        };
      };

    };
  };

  sortingRooms(suitable);

  for (var i = 0; i < suitable.roomsIndexes.length; i++) {

    // переговорки будут видны при клике на кнопку "создать Встречу" в шапке - только для теста
    renderRecommenderRoom (db.rooms[suitable.roomsIndexes[i]], Date.parse (date.start), Date.parse (date.end));
  };

  console.log(swaps); // для просмотра теста в консоли
};
