const utils = require("./Oauthmodule");

const Calendar = utils.calendar;



function calendareventList(){
 
    Calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const events = res.data.items;
      if (events.length) {
        console.log('Upcoming 10 events:');
        events.map((event, i) => {
          const start = event.start.dateTime || event.start.date;
          //console.log(event);
          console.log(`${start} - ${event.summary}`);
        });
      } else {
        console.log('No upcoming events found.');
      }
    });
    }

    
    function insertEvent()
    {

     var event = {
          'summary': 'Google I/O 2015',
          'location': '800 Howard St., San Francisco, CA 94103',
          'description': 'A chance to hear more about Google\'s developer products.',
          'start': {
               'dateTime': '2021-12-24T08:30:00+05:30',
               'timeZone': 'Asia/Kolkata',
          },
          'end': {
               'dateTime': '2021-12-24T09:30:00+05:30',
               'timeZone': 'Asia/Kolkata',
          },
          'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=2'
          ],
          'attendees': [
            {'email': 'lpage@example.com'},
            {'email': 'sbrin@example.com'},
          ],
          'reminders': {
            'useDefault': false,
            'overrides': [
              {'method': 'email', 'minutes': 24 * 60},
              {'method': 'poup', 'minutes': 10},
            ],
          },
        };

        Calendar.events.insert({
          auth:  utils.oAuth2Client,
          calendarId: 'primary',
          resource: event,
        }, function(err, event) {
          if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
          }
          console.log('Event created: %s', event.htmlLink);
          console.log(event);
        });
     
      
     
	 
    }


module.exports = {calendareventList, insertEvent};
  