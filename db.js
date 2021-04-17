const { firestore } = require('./firebase');
const admin = require('firebase-admin');
const geofirestore = require('geofirestore');

/**
 * schedule record
 * {
    "time":1619016000,
    "title":"",
    "start":"2021-04-21 10:40:00",
    "end":"2021-04-21 10:50:00",
    "id":"607a02107676f",
    "schedule_appt_type_id":22022,
    "loc_id":null
  }
 */

const addSchedulesForLocation = (client, locationId, schedules) => {
  firestore.collection('clients').doc(client).collection('schedules').doc(String(locationId)).set({
    times: schedules,
    client,
    loc_id: locationId,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

const addLocationInfoForLocation = (client, locationInfo) => {
  // Create a GeoFirestore reference
  const GeoFirestore = geofirestore.initializeApp(firestore);

  GeoFirestore.collection('clients').doc(client).collection('info').doc(String(locationInfo.loc_id)).set({
    ...locationInfo,
    client,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    // The coordinates field must be a GeoPoint!
    coordinates: new admin.firestore.GeoPoint(Number(locationInfo.lat), Number(locationInfo.long)),
  });
}

const clearSchedules = async (client) => {
  async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();
  
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // When there are no documents left, we are done
      resolve();
      return;
    }
  
    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  
    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      deleteQueryBatch(db, query, resolve);
    });
  }

  return new Promise((resolve) => {
    let scheduleRef = firestore.collection('clients').doc(client).collection('schedules');

    // add some logic to keep looping over this until done since max = 500
    let query = scheduleRef.orderBy('__name__').limit(500);
    deleteQueryBatch(firestore, query, () => {
      return resolve(true);
    });
  });
}

module.exports = {
  addSchedulesForLocation,
  addLocationInfoForLocation,
  clearSchedules,
}
