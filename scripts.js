const clearLocationInfo = () => {
  const { addLocationInfoForLocation } = require('./db');
  const walmartLocations = require('./walmart-locations');

  for (let location of walmartLocations) {
    addLocationInfoForLocation('walmart', location);
  }
}

const clearSchedules = () => {
  const { clearSchedules } = require('./db');
  clearSchedules('walmart', () => {
    console.log('done')
  });
}

// clearLocationInfo();
// clearSchedules();
