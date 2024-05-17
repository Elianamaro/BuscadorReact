var Airtable = require('airtable');
const base = new Airtable({ apiKey: 'patEoi7AtHGGV0JPS.f38ac0e7a3df9f6ba5977200021c377fd6a0fdfb921d1bfa6623ff856081a3bd' }).base('appnuQpTRhrx0edsL');

base('Lugares').select({
    view: "Vista de cuadrícula"
}).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function(record) {
        console.log('Retrieved', record.get('Nombre'));
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

}, function done(err) {
    if (err) { console.error(err); return; }
});